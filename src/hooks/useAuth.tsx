import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth.types';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthMethods } from '@/hooks/useAuthMethods';
import { useFamilyMethods } from '@/hooks/useFamilyMethods';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    setUser,
    isLoading,
    families,
    setFamilies,
    currentFamily,
    setCurrentFamily
  } = useAuthState();

  const {
    login,
    loginWithPassword,
    signup,
    signupWithPassword,
    verifyOtp,
    logout
  } = useAuthMethods({
    user,
    setUser,
    families,
    setFamilies,
    currentFamily,
    setCurrentFamily
  });

  const {
    createFamily,
    switchFamily,
    updateUserName
  } = useFamilyMethods({
    user,
    setUser,
    families,
    setFamilies,
    currentFamily,
    setCurrentFamily
  });

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
