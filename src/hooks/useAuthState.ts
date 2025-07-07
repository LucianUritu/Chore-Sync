
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';
import { useAuthStateHandler } from '@/hooks/auth/useAuthStateHandler';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const isMounted = useRef(true);
  
  const { handleAuthStateChange, checkCurrentSession } = useAuthStateHandler({
    setUser,
    setFamilies,
    setCurrentFamily,
    setIsLoading
  });

  // Set up Supabase auth state listener
  useEffect(() => {
    isMounted.current = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthStateChange(event, session, isMounted);
      }
    );
    
    // Check current session
    checkCurrentSession(isMounted);
    
    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, checkCurrentSession]);

  return {
    user,
    setUser,
    isLoading,
    families,
    setFamilies,
    currentFamily,
    setCurrentFamily
  };
};
