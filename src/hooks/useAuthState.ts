
import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';
import { getUserById, getFamilies } from '@/services/database';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  
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
