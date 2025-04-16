import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { simulateSendEmail } from '@/utils/authUtils';
import { User, Family } from '@/types/auth.types';
import { getUserById, getFamilies } from '@/services/database';

interface LoginMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useLoginMethods = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily
}: LoginMethodsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const login = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Store the email for the verification step
      localStorage.setItem('pendingAuthEmail', email);
      
      // Simulate sending an email with the verification code
      simulateSendEmail(email);
      
      navigate('/verify');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  const loginWithPassword = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("AuthMethods: Attempting login with email and password", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("AuthMethods: Login successful, user:", data.user?.id);
      
      // After successful login, get the user's profile and load families
      if (data.user) {
        const userProfile = await getUserById(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          
          // Load families
          const allFamilies = await getFamilies();
          const userFamilies = allFamilies.filter(f => 
            userProfile.families.includes(f.id)
          );
          
          setFamilies(userFamilies);
          
          if (userProfile.currentFamilyId) {
            const currentFam = userFamilies.find(f => f.id === userProfile.currentFamilyId) || null;
            setCurrentFamily(currentFam);
          }
          
          // Redirect based on whether user has families or not
          if (userFamilies.length > 0) {
            navigate("/home", { replace: true });
          } else {
            navigate("/family-selection", { replace: true });
          }
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    login,
    loginWithPassword
  };
};
