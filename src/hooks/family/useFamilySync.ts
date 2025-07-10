
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';
import { getFamilyMembers } from '@/services/familyMemberService';

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
      console.log('🔄 Refreshing user and families for:', user.id);
      
      // Get user's families directly from family_members table
      const { data: userMemberships, error: membershipsError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id);

      if (membershipsError) {
        console.error('🔴 Error fetching user memberships:', membershipsError);
        throw membershipsError;
      }

      const userFamilyIds = userMemberships?.map(m => m.family_id) || [];
      console.log('🔵 User family IDs from family_members:', userFamilyIds);

      // Try to get current family preference from profiles (but don't fail if RLS blocks it)
      let currentFamilyIdPreference: string | null = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('current_family_id')
          .eq('id', user.id)
          .single();
        
        currentFamilyIdPreference = profileData?.current_family_id || null;
        console.log('🔵 Current family preference from profile:', currentFamilyIdPreference);
      } catch (error) {
        console.log('🟡 Could not get family preference from profile (RLS):', error);
      }

      if (userFamilyIds.length > 0) {
        console.log('🔄 Fetching families:', userFamilyIds);
        
        const { data: userFamilies, error: familiesError } = await supabase
          .from('families')
          .select('id, name')
          .in('id', userFamilyIds);

        if (familiesError) {
          console.error('🔴 Error fetching families:', familiesError);
          throw familiesError;
        }

        // Load members for each family from family_members table
        const refreshedFamilies = await Promise.all((userFamilies || []).map(async (family) => {
          console.log('🔄 Loading members for family:', family.name);
          const members = await getFamilyMembers(family.id);
          console.log('🔄 Found members:', members.length, 'for family:', family.name);
          
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

        // Find current family based on preference or default to first family
        let refreshedCurrentFamily: Family | null = null;
        if (currentFamilyIdPreference && userFamilyIds.includes(currentFamilyIdPreference)) {
          refreshedCurrentFamily = refreshedFamilies.find(f => f.id === currentFamilyIdPreference) || null;
        }
        
        // If no current family is set but user has families, set the first one as current
        if (!refreshedCurrentFamily && refreshedFamilies.length > 0) {
          refreshedCurrentFamily = refreshedFamilies[0];
          
          // Try to update the user's current family preference (but don't fail if RLS blocks it)
          try {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ current_family_id: refreshedCurrentFamily.id })
              .eq('id', user.id);

            if (updateError) {
              console.log('🟡 Could not update current family preference (RLS):', updateError.message);
            } else {
              console.log('🟢 Set default current family preference:', refreshedCurrentFamily.name);
            }
          } catch (error) {
            console.log('🟡 Could not update current family preference (RLS):', error);
          }
        }

        // Update user object with actual family data from family_members table
        const updatedUser: User = {
          ...user,
          families: userFamilyIds,
          currentFamilyId: refreshedCurrentFamily?.id || null
        };

        console.log('🟢 Refreshed families:', {
          familiesCount: refreshedFamilies.length,
          currentFamily: refreshedCurrentFamily?.name,
          currentFamilyMembers: refreshedCurrentFamily?.members?.length || 0
        });

        // Update all states with fresh data
        setUser(updatedUser);
        setFamilies(refreshedFamilies);
        setCurrentFamily(refreshedCurrentFamily);
      } else {
        console.log('🔵 User has no families');
        const updatedUser: User = {
          ...user,
          families: [],
          currentFamilyId: null
        };
        setUser(updatedUser);
        setFamilies([]);
        setCurrentFamily(null);
      }
    } catch (error) {
      console.error('🔴 Error refreshing user and families:', error);
      throw error;
    }
  };

  return {
    refreshUserAndFamilies
  };
};
