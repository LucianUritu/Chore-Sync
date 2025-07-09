import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';

interface FamilySyncProps {
  user: User | null;
  setUser: (user: User | null) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family | null) => void;
}

export const useFamilySync = ({
  user,
  setUser,
  setFamilies,
  setCurrentFamily
}: FamilySyncProps) => {

  const refreshUserAndFamilies = async () => {
    if (!user) return;

    try {
      // Refresh user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const updatedUser: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        initials: profileData.initials,
        families: Array.isArray(profileData.families) ? profileData.families : [],
        currentFamilyId: profileData.current_family_id
      };

      // Refresh families from database
      if (updatedUser.families && updatedUser.families.length > 0) {
        const { data: userFamilies, error: familiesError } = await supabase
          .from('families')
          .select('*')
          .in('id', updatedUser.families);

        if (familiesError) throw familiesError;

        const refreshedFamilies = (userFamilies || []).map(family => ({
          id: family.id,
          name: family.name,
          members: Array.isArray(family.members) 
            ? (family.members as Array<{userId: string; name: string; initials: string}>)
            : []
        }));

        const refreshedCurrentFamily = updatedUser.currentFamilyId 
          ? refreshedFamilies.find(f => f.id === updatedUser.currentFamilyId) || null
          : null;

        // Update all states with fresh data
        setUser(updatedUser);
        setFamilies(refreshedFamilies);
        setCurrentFamily(refreshedCurrentFamily);

        console.log('🟢 Refreshed user and families from database');
      } else {
        setUser(updatedUser);
        setFamilies([]);
        setCurrentFamily(null);
      }
    } catch (error) {
      console.error('🔴 Error refreshing user and families:', error);
    }
  };

  return {
    refreshUserAndFamilies
  };
};
