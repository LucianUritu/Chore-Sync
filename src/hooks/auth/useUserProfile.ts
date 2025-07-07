
import { supabase } from '@/integration/supabase/clients';
import { User } from '@/types/auth.types';

export const useUserProfile = () => {
  const createOrLoadUserProfile = async (authUser: any): Promise<User | null> => {
    try {
      console.log("🟢 Loading user profile for user ID:", authUser.id);
      
      // First, check if user profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log("🔵 Profile query result:", { 
        hasProfile: !!existingProfile, 
        error: profileError?.code 
      });

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('🔴 Database error fetching profile:', profileError);
        throw profileError;
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
        // Create new user profile
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

        // Insert new user profile to Supabase
        const { data: insertedData, error: insertProfileError } = await supabase
          .from('profiles')
          .insert(newUserData)
          .select()
          .single();

        if (insertProfileError) {
          console.error('🔴 Error creating profile:', insertProfileError);
          throw insertProfileError;
        }

        const userProfile: User = {
          id: newUserData.id,
          email: newUserData.email,
          name: newUserData.name,
          initials: newUserData.initials,
          families: newUserData.families,
          currentFamilyId: newUserData.current_family_id
        };

        console.log("🟢 Successfully created new user profile:", {
          id: userProfile.id,
          name: userProfile.name
        });
        return userProfile;
      }
    } catch (error) {
      console.error('🔴 Error in createOrLoadUserProfile:', error);
      return null;
    }
  };

  return { createOrLoadUserProfile };
};
