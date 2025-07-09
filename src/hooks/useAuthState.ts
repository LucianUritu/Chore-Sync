
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';
import { useAuthStateHandler } from '@/hooks/auth/useAuthStateHandler';
import { getFamilyMembers } from '@/services/familyMemberService';

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
    console.log("🔵 Setting up auth state listener");

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;
        console.log('🔵 Auth event received:', event);
        await handleAuthStateChange(event, session, isMounted);
      }
    );
    
    // Check current session
    checkCurrentSession(isMounted);
    
    return () => {
      console.log('🔴 Cleaning up auth state listener');
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Set up real-time subscription for user profile changes
  useEffect(() => {
    if (!user?.id || !isMounted.current) return;

    console.log('🔵 Setting up real-time profile subscription for user:', user.id);

    const profileSubscription = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          if (!isMounted.current) return;
          
          console.log('🟢 Profile updated in real-time:', payload.new);
          
          try {
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

            // Reload families using family_members table
            if (updatedUser.families && updatedUser.families.length > 0) {
              const { data: userFamilies } = await supabase
                .from('families')
                .select('id, name')
                .in('id', updatedUser.families);

              if (userFamilies && isMounted.current) {
                const refreshedFamilies = await Promise.all(userFamilies.map(async (family) => {
                  const members = await getFamilyMembers(family.id);
                  return {
                    id: family.id,
                    name: family.name,
                    members: members.map(member => ({
                      userId: member.user_id,
                      name: member.name,
                      initials: member.initials
                    }))
                  };
                }));

                const refreshedCurrentFamily = updatedUser.currentFamilyId 
                  ? refreshedFamilies.find(f => f.id === updatedUser.currentFamilyId) || null
                  : null;

                setFamilies(refreshedFamilies);
                setCurrentFamily(refreshedCurrentFamily);
              }
            } else if (isMounted.current) {
              setFamilies([]);
              setCurrentFamily(null);
            }
          } catch (error) {
            console.error('🔴 Error processing real-time profile update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔴 Cleaning up profile subscription');
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id]);

  // Enhanced real-time subscription for family_members table changes
  useEffect(() => {
    if (!user?.families || user.families.length === 0 || !isMounted.current) return;

    console.log('🔵 Setting up family_members subscription for families:', user.families);

    const familyMembersSubscription = supabase
      .channel(`family-members-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'family_members'
        },
        async (payload) => {
          if (!isMounted.current) return;
          
          const affectedMember = (payload.new || payload.old) as any;
          
          // Only process if this change affects our families
          if (!affectedMember || !user.families.includes(affectedMember.family_id)) return;
          
          console.log('🟢 Family member change detected for our family:', {
            event: payload.eventType,
            familyId: affectedMember.family_id,
            memberName: affectedMember.name || 'unknown'
          });
          
          try {
            // Refresh all user families when any family member changes
            const { data: userFamilies, error: familiesError } = await supabase
              .from('families')
              .select('id, name')
              .in('id', user.families);

            if (familiesError) {
              console.error('🔴 Error fetching families after member change:', familiesError);
              return;
            }

            if (userFamilies && isMounted.current) {
              const refreshedFamilies = await Promise.all(userFamilies.map(async (family) => {
                console.log('🔄 Refreshing members for family after member change:', family.name);
                const members = await getFamilyMembers(family.id);
                console.log('🔄 Found members after change:', members.length, 'for family:', family.name);
                
                return {
                  id: family.id,
                  name: family.name,
                  members: members.map(member => ({
                    userId: member.user_id,
                    name: member.name,
                    initials: member.initials
                  }))
                };
              }));

              const refreshedCurrentFamily = user.currentFamilyId 
                ? refreshedFamilies.find(f => f.id === user.currentFamilyId) || null
                : null;

              console.log('🟢 Updated families from family_members real-time subscription:', {
                familiesCount: refreshedFamilies.length,
                currentFamily: refreshedCurrentFamily?.name,
                currentFamilyMembers: refreshedCurrentFamily?.members?.length || 0
              });

              setFamilies(refreshedFamilies);
              setCurrentFamily(refreshedCurrentFamily);
            }
          } catch (error) {
            console.error('🔴 Error processing family member real-time update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔵 Family members subscription status:', status);
      });

    return () => {
      console.log('🔴 Cleaning up family members subscription');
      supabase.removeChannel(familyMembersSubscription);
    };
  }, [user?.families?.join(','), user?.currentFamilyId, user?.id]); // Use join to create stable dependency

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
