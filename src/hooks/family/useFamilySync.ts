
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
      
      // Refresh user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('🔴 Error fetching user profile:', profileError);
        throw profileError;
      }

      const updatedUser: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        initials: profileData.initials,
        families: Array.isArray(profileData.families) ? profileData.families : [],
        currentFamilyId: profileData.current_family_id
      };

      console.log('🔵 Updated user data:', {
        familiesCount: updatedUser.families.length,
        currentFamilyId: updatedUser.currentFamilyId
      });

      // If user has families, refresh them from database
      if (updatedUser.families && updatedUser.families.length > 0) {
        console.log('🔄 Fetching families:', updatedUser.families);
        
        const { data: userFamilies, error: familiesError } = await supabase
          .from('families')
          .select('id, name')
          .in('id', updatedUser.families);

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

        // Find current family or default to first family
        let refreshedCurrentFamily: Family | null = null;
        if (updatedUser.currentFamilyId) {
          refreshedCurrentFamily = refreshedFamilies.find(f => f.id === updatedUser.currentFamilyId) || null;
        }
        
        // If no current family is set but user has families, set the first one as current
        if (!refreshedCurrentFamily && refreshedFamilies.length > 0) {
          refreshedCurrentFamily = refreshedFamilies[0];
          
          // Update the user's current family in the database
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ current_family_id: refreshedCurrentFamily.id })
            .eq('id', user.id);

          if (updateError) {
            console.error('🔴 Error setting default current family:', updateError);
          } else {
            updatedUser.currentFamilyId = refreshedCurrentFamily.id;
            console.log('🟢 Set default current family:', refreshedCurrentFamily.name);
          }
        }

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
