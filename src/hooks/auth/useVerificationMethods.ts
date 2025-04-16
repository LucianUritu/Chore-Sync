import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { User, Family } from '@/types/auth.types';

interface VerificationMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useVerificationMethods = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily
}: VerificationMethodsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const verifyOtp = async (otp: string) => {
    const mockCode = localStorage.getItem('verificationCode');
    const email = localStorage.getItem('pendingAuthEmail') || '';
    
    // For demonstration purposes, we'll also accept '123456' as a valid code
    if (otp === mockCode || otp === '123456') {
      try {
        // In a real implementation, you'd verify the OTP with Supabase
        // but for our demo we just sign in directly
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: '123456' // This assumes the user was set up with this password
        });
        
        if (error) throw error;
        
        // Clean up
        localStorage.removeItem('pendingAuthEmail');
        localStorage.removeItem('pendingAuthName');
        localStorage.removeItem('verificationCode');
        
        toast({
          title: "Authentication Successful",
          description: "You've been successfully logged in.",
        });
        
        // Check for a redirect path after authentication
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
        localStorage.removeItem('redirectAfterAuth');
        
        navigate(redirectPath);
      } catch (error: any) {
        console.error('Verification error:', error);
        toast({
          title: "Verification failed",
          description: error.message || "Failed to verify your code",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
      return;
    }
    
    setUser(null);
    setFamilies([]);
    setCurrentFamily(null);
    navigate('/login');
  };

  return {
    verifyOtp,
    logout
  };
};
