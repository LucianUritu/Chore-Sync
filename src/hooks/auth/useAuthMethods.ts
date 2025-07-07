
import { useLoginMethods } from '@/hooks/auth/useLoginMethods';
import { useSignupMethods } from '@/hooks/auth/useSignupMethods';
import { useVerificationMethods } from '@/hooks/auth/useVerificationMethods';
import { User, Family } from '@/types/auth.types';

interface AuthMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useAuthMethods = (props: AuthMethodsProps) => {
  const { login, loginWithPassword } = useLoginMethods(props);
  const { signup, signupWithPassword } = useSignupMethods(props);
  const { verifyOtp, logout } = useVerificationMethods(props);

  return {
    login,
    loginWithPassword,
    signup,
    signupWithPassword,
    verifyOtp,
    logout
  };
};
