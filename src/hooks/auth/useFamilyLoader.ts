
import { supabase } from '@/integration/supabase/clients';
import { Family, User } from '@/types/auth.types';

export const useFamilyLoader = () => {
  const loadUserFamilies = async (userProfile: User): Promise<{ families: Family[]; currentFamily: Family | null }> => {
    let families: Family[] = [];
    let currentFamily: Family | null = null;

    try {
      if (userProfile.families && userProfile.families.length > 0) {
        console.log("🟢 Loading user families:", userProfile.families);
        const { data: userFamilies, error: familiesError } = await supabase
          .from('families')
          .select('*')
          .in('id', userProfile.families);

        if (familiesError) {
          console.error('🔴 Error loading families:', familiesError);
          return { families: [], currentFamily: null };
        }

        families = (userFamilies || []).map(family => ({
          id: family.id,
          name: family.name,
          members: Array.isArray(family.members) 
            ? (family.members as Array<{userId: string; name: string; initials: string}>)
            : []
        }));

        console.log("🟢 Loaded families:", families);

        // Set current family if specified
        if (userProfile.currentFamilyId) {
          const currentFam = families.find(f => f.id === userProfile.currentFamilyId);
          if (currentFam) {
            currentFamily = currentFam;
          }
        }
      } else {
        console.log("🟡 User has no families");
      }
    } catch (error) {
      console.error('🔴 Error loading families:', error);
    }

    return { families, currentFamily };
  };

  return { loadUserFamilies };
};
