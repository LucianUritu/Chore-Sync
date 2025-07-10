
import { supabase } from '@/integration/supabase/clients';
import { User } from '@/types/auth.types';

export const useUserProfile = () => {
  const createOrLoadUserProfile = async (authUser: any): Promise<User | null> => {
    try {
      console.log("🟢 Loading user profile for user ID:", authUser.id);
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout')), 3000);
      });

      const { data: existingProfile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log("🔵 Profile query result:", { 
        hasProfile: !!existingProfile, 
        error: profileError?.code 
      });

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('🔴 Database error fetching profile, using fallback:', profileError);
        // Return a basic user profile as fallback
        const fallbackUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          initials: (authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User').substring(0, 2).toUpperCase(),
          families: [],
          currentFamilyId: null
        };
        return fallbackUser;
      }

      if (existingProfile) {
        // User profile exists, return it
        console.log("🟢 Found existing user profile");
        const userProfile: User = {
          id: existingProfile.id,
          email: existingProfile.email,
          name: existingProfile.name,
          initials: existingProfile.initials,
          families: Array.isArray(existingProfile.families) ? existingProfile.families : [],
          currentFamilyId: existingProfile.current_family_id
        };
        
        console.log("🟢 Returning existing user profile:", {
          id: userProfile.id,
          name: userProfile.name,
          familiesCount: userProfile.families.length
        });
        return userProfile;
      } else {
        // Profile doesn't exist - return a fallback user instead of trying to create
        console.log("🟡 No profile found, using fallback user profile");
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        
        const fallbackUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: userName,
          initials: userName.substring(0, 2).toUpperCase(),
          families: [],
          currentFamilyId: null
        };

        console.log("🟢 Returning fallback user profile:", {
          id: fallbackUser.id,
          name: fallbackUser.name,
          familiesCount: fallbackUser.families.length
        });
        return fallbackUser;
      }
    } catch (error) {
      console.error('🔴 Error in createOrLoadUserProfile, using fallback:', error);
      // Return a basic user profile as ultimate fallback
      const fallbackUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        initials: (authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User').substring(0, 2).toUpperCase(),
        families: [],
        currentFamilyId: null
      };
      return fallbackUser;
    }
  };

  return { createOrLoadUserProfile };
};
