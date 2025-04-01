
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load user from localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const simulateSendEmail = (email: string) => {
    // In a real app, this would send an actual email
    console.log(`Simulating sending verification code to ${email}`);
    
    // For demo purposes, we'll set a mock verification code
    localStorage.setItem('verificationCode', '123456');
    
    toast({
      title: "Verification Code: 123456",
      description: `In a real app, this would be sent to ${email}. For testing, use code: 123456`,
    });
  };

  const login = async (email: string) => {
    // Store the email for the verification step
    localStorage.setItem('pendingAuthEmail', email);
    
    // Simulate sending an email with the verification code
    simulateSendEmail(email);
    
    navigate('/verify');
  };

  const signup = async (name: string, email: string) => {
    // Store the name and email for the verification step
    localStorage.setItem('pendingAuthEmail', email);
    localStorage.setItem('pendingAuthName', name);
    
    // Simulate sending an email with the verification code
    simulateSendEmail(email);
    
    navigate('/verify');
  };

  const verifyOtp = async (otp: string) => {
    const mockCode = localStorage.getItem('verificationCode');
    
    // For demonstration purposes, we'll also accept '123456' as a valid code
    if (otp === mockCode || otp === '123456') {
      const email = localStorage.getItem('pendingAuthEmail') || '';
      const name = localStorage.getItem('pendingAuthName') || 'User';
      
      const authenticatedUser = {
        email,
        name,
        isAuthenticated: true,
      };
      
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      // Clean up
      localStorage.removeItem('pendingAuthEmail');
      localStorage.removeItem('pendingAuthName');
      localStorage.removeItem('verificationCode');
      
      toast({
        title: "Authentication Successful",
        description: "You've been successfully logged in.",
      });
      
      navigate('/');
    } else {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
