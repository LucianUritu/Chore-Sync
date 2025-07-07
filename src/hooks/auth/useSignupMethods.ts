
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { simulateSendEmail } from '@/utils/authUtils';
import { User, Family } from '@/types/auth.types';
import { 
  getUserById, 
  getFamilies, 
  saveFamily, 
  saveUser, 
  getInitials 
} from '@/services/supabaseDatabase';

interface SignupMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useSignupMethods = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily
}: SignupMethodsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const signup = async (name: string, email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      // Store the name and email for the verification step
      localStorage.setItem('pendingAuthEmail', email);
      localStorage.setItem('pendingAuthName', name);
      
      // Simulate sending an email with the verification code
      simulateSendEmail(email);
      
      navigate('/verify');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  const signupWithPassword = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔵 SignupMethods: Starting signup with email:", email, "and name:", name);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      console.log("🔵 SignupMethods: Supabase signup response:", { data: !!data.user, error });
      
      if (error) {
        console.error("🔴 SignupMethods: Supabase signup error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("🟢 SignupMethods: User created successfully, ID:", data.user.id);
        console.log("🔵 SignupMethods: Creating user profile and default family in Supabase");
        
        // Create user profile first
        const userProfile: User = {
          id: data.user.id,
          email: email,
          name: name,
          initials: getInitials(name),
          families: [],
          currentFamilyId: null
        };
        
        console.log("🔵 SignupMethods: Saving user profile to Supabase:", userProfile);
        await saveUser(userProfile);
        console.log("🟢 SignupMethods: User profile saved successfully to Supabase");
        
        // Create default family
        const defaultFamily: Family = {
          id: crypto.randomUUID(),
          name: `${name}'s Family`,
          members: [{
            userId: data.user.id,
            name,
            initials: getInitials(name)
          }]
        };
        
        console.log("🔵 SignupMethods: Saving default family to Supabase:", defaultFamily);
        await saveFamily(defaultFamily);
        console.log("🟢 SignupMethods: Default family saved successfully to Supabase");
        
        // Update user profile with family
        userProfile.families = [defaultFamily.id];
        userProfile.currentFamilyId = defaultFamily.id;
        
        console.log("🔵 SignupMethods: Updating user profile with family in Supabase:", userProfile);
        await saveUser(userProfile);
        console.log("🟢 SignupMethods: User profile updated with family in Supabase");
        
        // Update local state
        setUser(userProfile);
        setFamilies([defaultFamily]);
        setCurrentFamily(defaultFamily);
        
        console.log("🟢 SignupMethods: State updated, navigating to home");
        
        toast({
          title: "Account created",
          description: "Your account and family have been created successfully.",
        });
        
        // Navigate to home
        navigate("/home", { replace: true });
        
        return true;
      } else {
        console.error("🔴 SignupMethods: No user returned from Supabase");
        return false;
      }
      
    } catch (error: any) {
      console.error('🔴 SignupMethods: Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    signup,
    signupWithPassword
  };
};
