import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integration/supabase/clients";
import { 
  getUserById,
  getFamilies,
  getFamilyById,
  saveFamily,
  addUserToFamily,
  getInitials,
  saveUser
} from '@/services/database';

interface Family {
  id: string;
  name: string;
  members: {
    userId: string;
    name: string;
    initials: string;
  }[];
}

interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  password?: string; // Add password field as optional
  families: string[];
  currentFamilyId: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  families: Family[];
  currentFamily: Family | null;
  login: (email: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<void>;
  signupWithPassword: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => void;
  createFamily: (name: string) => Promise<void>;
  switchFamily: (familyId: string) => void;
  updateUserName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up Supabase auth state listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Get user profile from database
            const userProfile = await getUserById(session.user.id);
            
            if (userProfile) {
              setUser(userProfile);
              
              // Load families and set current family
              const allFamilies = await getFamilies();
              const userFamilies = allFamilies.filter(f => 
                userProfile.families.includes(f.id)
              );
              
              setFamilies(userFamilies);
              
              if (userProfile.currentFamilyId) {
                const currentFam = userFamilies.find(f => f.id === userProfile.currentFamilyId) || null;
                setCurrentFamily(currentFam);
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setFamilies([]);
          setCurrentFamily(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Check current session
    const checkCurrentSession = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile from database
        const userProfile = await getUserById(session.user.id);
        
        if (userProfile) {
          setUser(userProfile);
          
          // Load families and set current family
          const allFamilies = await getFamilies();
          const userFamilies = allFamilies.filter(f => 
            userProfile.families.includes(f.id)
          );
          
          setFamilies(userFamilies);
          
          if (userProfile.currentFamilyId) {
            const currentFam = userFamilies.find(f => f.id === userProfile.currentFamilyId) || null;
            setCurrentFamily(currentFam);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkCurrentSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const simulateSendEmail = (email: string) => {
    console.log(`Simulating sending verification code to ${email}`);
    
    // For demo purposes, we'll set a mock verification code
    localStorage.setItem('verificationCode', '123456');
    
    toast({
      title: "Verification Code: 123456",
      description: `In a real app, this would be sent to ${email}. For testing, use code: 123456`,
    });
  };

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
      
      // The trigger will create the profile, but we don't have control over the families
      // So we'll manually handle family creation after sign up is complete
      
      // Wait for auth state to update
      // The rest will be handled by the auth state listener
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

  const createFamily = async (name: string) => {
    if (!user) return;
    
    // Create new family
    const newFamily: Family = {
      id: `f-${Date.now()}`,
      name,
      members: [{
        userId: user.id,
        name: user.name,
        initials: user.initials
      }]
    };
    
    // Save the family
    await saveFamily(newFamily);
    
    // Update user's families
    const updatedUser = {
      ...user,
      families: [...user.families, newFamily.id],
      currentFamilyId: newFamily.id
    };
    
    await saveUser(updatedUser);
    setUser(updatedUser);
    
    // Update families list and current family
    const updatedFamilies = [...families, newFamily];
    setFamilies(updatedFamilies);
    setCurrentFamily(newFamily);
    
    toast({
      title: "Family Created",
      description: `${name} has been created successfully.`,
    });
  };

  const switchFamily = async (familyId: string) => {
    if (!user) return;
    
    const family = families.find(f => f.id === familyId);
    
    if (family) {
      // Update current family
      setCurrentFamily(family);
      
      // Update user's current family
      const updatedUser = {
        ...user,
        currentFamilyId: familyId,
      };
      
      await saveUser(updatedUser);
      setUser(updatedUser);
      
      toast({
        title: "Family Switched",
        description: `You're now viewing ${family.name}.`,
      });
    }
  };

  const updateUserName = async (newName: string) => {
    if (!user) return;
    
    const newInitials = getInitials(newName);
    
    // Update user in Supabase
    const updatedUser = {
      ...user,
      name: newName,
      initials: newInitials
    };
    
    await saveUser(updatedUser);
    setUser(updatedUser);
    
    // Update user in all families
    const allFamilies = await getFamilies();
    const updatedFamilies = allFamilies.map(family => {
      const memberIndex = family.members.findIndex(m => m.userId === user.id);
      
      if (memberIndex >= 0) {
        const updatedMembers = [...family.members];
        updatedMembers[memberIndex] = {
          ...updatedMembers[memberIndex],
          name: newName,
          initials: newInitials
        };
        
        return {
          ...family,
          members: updatedMembers
        };
      }
      
      return family;
    });
    
    // Save updated families
    for (const family of updatedFamilies) {
      await saveFamily(family);
    }
    
    // Update families state
    const userFamilies = updatedFamilies.filter(f => 
      user.families.includes(f.id)
    );
    setFamilies(userFamilies);
    
    // Update current family
    if (user.currentFamilyId) {
      const currentFam = userFamilies.find(f => f.id === user.currentFamilyId) || null;
      setCurrentFamily(currentFam);
    }
    
    toast({
      title: "Profile Updated",
      description: "Your name has been updated successfully.",
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        families, 
        currentFamily, 
        login, 
        loginWithPassword,
        signup, 
        signupWithPassword,
        verifyOtp, 
        logout, 
        createFamily, 
        switchFamily,
        updateUserName
      }}
    >
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

