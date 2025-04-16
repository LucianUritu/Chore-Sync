import { useState } from 'react';
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

interface AuthMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useAuthMethods = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily
}: AuthMethodsProps) => {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // User profile and families will be loaded by the auth state listener
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
        // If no default family exists, we'll create one
        const allFamilies = await getFamilies();
        let defaultFamily: Family;
        
        if (allFamilies.length === 0) {
          // Create a default family
          defaultFamily = {
            id: `f-${Date.now()}`,
            name: `${name}'s Family`,
            members: [{
              userId: data.user.id,
              name,
              initials: getInitials(name)
            }]
          };
          
          await saveFamily(defaultFamily);
          
          // Update the user's profile with the family
          const userProfile = await getUserById(data.user.id);
          if (userProfile) {
            userProfile.families = [defaultFamily.id];
            userProfile.currentFamilyId = defaultFamily.id;
            await saveUser(userProfile);
          }
        }
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
    setCurrentFamily(null);
    navigate('/login');
  };

  return {
    login,
    loginWithPassword,
    signup,
    signupWithPassword,
    verifyOtp,
    logout
  };
};
