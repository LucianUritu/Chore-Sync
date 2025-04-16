
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
} from '@/services/database';

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("SignupMethods: User created, creating default family");
        
        // Always create a default family
        const defaultFamily = {
          id: `f-${Date.now()}`,
          name: `${name}'s Family`,
          members: [{
            userId: data.user.id,
            name,
            initials: getInitials(name)
          }]
        };
        
        await saveFamily(defaultFamily);
        
        // Get the user's profile or create one if it doesn't exist
        const userProfile = await getUserById(data.user.id) || {
          id: data.user.id,
          email: email,
          name: name,
          initials: getInitials(name),
          families: [],
          currentFamilyId: null
        };
        
        // Update the user's profile with the family
        userProfile.families = [defaultFamily.id];
        userProfile.currentFamilyId = defaultFamily.id;
        await saveUser(userProfile);
        
        console.log("SignupMethods: Default family created and user updated");
        
        // Update local state
        setUser(userProfile);
        setFamilies([defaultFamily]);
        setCurrentFamily(defaultFamily);
        
        toast({
          title: "Account created",
          description: "Your account and family have been created successfully.",
        });
        
        // Navigate to home instead of family selection
        navigate("/home", { replace: true });
      }
      
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
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
