
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
        // Create new user profile with timeout
        console.log("🟢 Creating new user profile...");
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        
        const newUserData = {
          id: authUser.id,
          email: authUser.email || '',
          name: userName,
          initials: userName.substring(0, 2).toUpperCase(),
          families: [],
          current_family_id: null
        };

        console.log("🔵 Inserting new profile data:", newUserData);

        try {
          const insertPromise = supabase
            .from('profiles')
            .insert(newUserData)
            .select()
            .single();
            
          const insertTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile insert timeout')), 3000);
          });

          const { data: insertedData, error: insertProfileError } = await Promise.race([
            insertPromise,
            insertTimeoutPromise
          ]) as any;

          if (insertProfileError) {
            console.error('🔴 Error creating profile, using fallback:', insertProfileError);
          }
        } catch (insertError) {
          console.error('🔴 Insert timeout, using fallback:', insertError);
        }

        // Return user profile regardless of database operation success
        const userProfile: User = {
          id: newUserData.id,
          email: newUserData.email,
          name: newUserData.name,
          initials: newUserData.initials,
          families: newUserData.families,
          currentFamilyId: newUserData.current_family_id
        };

        console.log("🟢 Returning new user profile:", {
          id: userProfile.id,
          name: userProfile.name,
          familiesCount: userProfile.families.length
        });
        return userProfile;
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
