
import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';

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
        console.log("🔵 Auth state change:", event, session?.user?.id);
        setIsLoading(true);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log("🟢 Creating user profile from session");
            
            // Create user profile from auth session data
            const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
            const userProfile: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: userName,
              initials: userName.substring(0, 2).toUpperCase(),
              families: [],
              currentFamilyId: null
            };
            
            // Create default family
            const defaultFamily: Family = {
              id: crypto.randomUUID(),
              name: `${userName}'s Family`,
              members: [{
                userId: session.user.id,
                name: userName,
                initials: userName.substring(0, 2).toUpperCase()
              }]
            };
            
            // Update user with family
            userProfile.families = [defaultFamily.id];
            userProfile.currentFamilyId = defaultFamily.id;
            
            console.log("🟢 Setting user and family state");
            setUser(userProfile);
            setFamilies([defaultFamily]);
            setCurrentFamily(defaultFamily);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("🔴 User signed out");
          setUser(null);
          setFamilies([]);
          setCurrentFamily(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Check current session
    const checkCurrentSession = async () => {
      console.log("🔵 Checking current session");
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("🟢 Found existing session, creating user profile");
          
          // Create user profile from auth session data
          const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          const userProfile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: userName,
            initials: userName.substring(0, 2).toUpperCase(),
            families: [],
            currentFamilyId: null
          };
          
          // Create default family
          const defaultFamily: Family = {
            id: crypto.randomUUID(),
            name: `${userName}'s Family`,
            members: [{
              userId: session.user.id,
              name: userName,
              initials: userName.substring(0, 2).toUpperCase()
            }]
          };
          
          // Update user with family
          userProfile.families = [defaultFamily.id];
          userProfile.currentFamilyId = defaultFamily.id;
          
          setUser(userProfile);
          setFamilies([defaultFamily]);
          setCurrentFamily(defaultFamily);
        } else {
          console.log("🔴 No existing session found");
        }
      } catch (error) {
        console.error('🔴 Error checking current session:', error);
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
