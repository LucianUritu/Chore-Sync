
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { simulateSendEmail } from '@/utils/authUtils';
import { User, Family } from '@/types/auth.types';

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
      
      localStorage.setItem('pendingAuthEmail', email);
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
      console.log("🔵 Starting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("🔴 Supabase auth error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("No user returned from login");
      }
      
      console.log("🟢 Supabase login successful, user ID:", data.user.id);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate immediately after successful auth
      // The auth state listener will handle user profile loading
      console.log("🟢 Navigating to /home");
      navigate('/home');
      
      return true;
    } catch (error: any) {
      console.error('🔴 Login error:', error);
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
