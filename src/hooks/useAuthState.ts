
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

    // Set up auth state listener with all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔵 Auth event received:', event);
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

  // Set up real-time subscription for user profile changes
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔵 Setting up real-time profile subscription for user:', user.id);

    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🟢 Profile updated in real-time:', payload.new);
          
          const updatedProfile = payload.new as any;
          const updatedUser: User = {
            id: updatedProfile.id,
            email: updatedProfile.email,
            name: updatedProfile.name,
            initials: updatedProfile.initials,
            families: Array.isArray(updatedProfile.families) ? updatedProfile.families : [],
            currentFamilyId: updatedProfile.current_family_id
          };

          setUser(updatedUser);

          // Reload families if they changed
          if (updatedUser.families && updatedUser.families.length > 0) {
            const { data: userFamilies } = await supabase
              .from('families')
              .select('*')
              .in('id', updatedUser.families);

            if (userFamilies) {
              const refreshedFamilies = userFamilies.map(family => ({
                id: family.id,
                name: family.name,
                members: Array.isArray(family.members) 
                  ? (family.members as Array<{userId: string; name: string; initials: string}>)
                  : []
              }));

              const refreshedCurrentFamily = updatedUser.currentFamilyId 
                ? refreshedFamilies.find(f => f.id === updatedUser.currentFamilyId) || null
                : null;

              setFamilies(refreshedFamilies);
              setCurrentFamily(refreshedCurrentFamily);
            }
          } else {
            setFamilies([]);
            setCurrentFamily(null);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔴 Cleaning up profile subscription');
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id]);

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
