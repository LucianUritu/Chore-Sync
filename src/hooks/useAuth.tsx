import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  getUserById, 
  getUsers, 
  saveUser, 
  getFamilies,
  getFamilyById,
  saveFamily,
  addUserToFamily,
  getInitials
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
  families: string[];
  currentFamilyId: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  families: Family[];
  currentFamily: Family | null;
  login: (email: string) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
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

  // Load user data and families on initial load
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      const foundUser = getUserById(userId);
      if (foundUser) {
        setUser(foundUser);
        
        // Load families and set current family
        const allFamilies = getFamilies();
        const userFamilies = allFamilies.filter(f => 
          foundUser.families.includes(f.id)
        );
        
        setFamilies(userFamilies);
        
        if (foundUser.currentFamilyId) {
          const currentFam = userFamilies.find(f => f.id === foundUser.currentFamilyId) || null;
          setCurrentFamily(currentFam);
        }
      } else {
        localStorage.removeItem('currentUserId');
      }
    }
    setIsLoading(false);
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
      
      // Check if user already exists
      const users = getUsers();
      let existingUser = users.find(u => u.email === email);
      
      if (!existingUser) {
        // Create new user if they don't exist
        const userInitials = getInitials(name);
        
        // Check if we need to create a default family
        let allFamilies = getFamilies();
        let defaultFamily: Family;
        
        if (allFamilies.length === 0) {
          // Create a default family if none exists
          defaultFamily = {
            id: `f-${Date.now()}`,
            name: `${name}'s Family`,
            members: [{
              userId: `u-${Date.now()}`,
              name,
              initials: userInitials
            }]
          };
          saveFamily(defaultFamily);
          allFamilies = [defaultFamily];
        } else {
          defaultFamily = allFamilies[0];
        }
        
        // Create new user
        existingUser = {
          id: `u-${Date.now()}`,
          email,
          name,
          initials: userInitials,
          families: [defaultFamily.id],
          currentFamilyId: defaultFamily.id,
        };
        
        // Add user to family
        addUserToFamily(
          existingUser.id, 
          existingUser.name, 
          existingUser.initials, 
          defaultFamily.id
        );
        
        // Save new user
        saveUser(existingUser);
      }
      
      // Set current user
      setUser(existingUser);
      localStorage.setItem('currentUserId', existingUser.id);
      
      // Load user's families
      const userFamilies = getFamilies().filter(f => 
        existingUser?.families.includes(f.id)
      );
      setFamilies(userFamilies);
      
      // Set current family
      if (existingUser.currentFamilyId) {
        const family = userFamilies.find(f => f.id === existingUser?.currentFamilyId) || null;
        setCurrentFamily(family);
      }
      
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
    setCurrentFamily(null);
    localStorage.removeItem('currentUserId');
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
    saveFamily(newFamily);
    
    // Update user's families
    const updatedUser = {
      ...user,
      families: [...user.families, newFamily.id],
      currentFamilyId: newFamily.id
    };
    
    saveUser(updatedUser);
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

  const switchFamily = (familyId: string) => {
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
      
      saveUser(updatedUser);
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
    
    // Update user
    const updatedUser = {
      ...user,
      name: newName,
      initials: newInitials
    };
    
    saveUser(updatedUser);
    setUser(updatedUser);
    
    // Update user in all families
    const allFamilies = getFamilies();
    const updatedFamilies = allFamilies.map(family => {
      const updatedMembers = family.members.map(member => {
        if (member.userId === user.id) {
          return {
            ...member,
            name: newName,
            initials: newInitials
          };
        }
        return member;
      });
      
      return {
        ...family,
        members: updatedMembers
      };
    });
    
    // Save updated families
    updatedFamilies.forEach(family => saveFamily(family));
    
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
        signup, 
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
