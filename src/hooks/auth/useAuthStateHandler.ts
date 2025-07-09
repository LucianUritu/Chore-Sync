
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';
import { useUserProfile } from './useUserProfile';
import { useFamilyLoader } from './useFamilyLoader';

interface AuthStateHandlerProps {
  setUser: (user: User | null) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStateHandler = ({
  setUser,
  setFamilies,
  setCurrentFamily,
  setIsLoading
}: AuthStateHandlerProps) => {
  const { createOrLoadUserProfile } = useUserProfile();
  const { loadUserFamilies } = useFamilyLoader();

  const handleAuthStateChange = async (
    event: string,
    session: any,
    isMounted: React.MutableRefObject<boolean>
  ) => {
    if (!isMounted.current) return;
    
    console.log("🔵 Auth state change:", event, session?.user?.id);
    
    try {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log("🟢 User authenticated, processing profile...");
          await handleUserProfile(session.user, isMounted);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("🔴 User signed out, clearing state");
        if (isMounted.current) {
          setUser(null);
          setFamilies([]);
          setCurrentFamily(null);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('🔴 Error in auth state change:', error);
      if (isMounted.current) {
        setIsLoading(false);
        setUser(null);
        setFamilies([]);
        setCurrentFamily(null);
      }
    }
  };

  const handleUserProfile = async (authUser: any, isMounted: React.MutableRefObject<boolean>) => {
    if (!isMounted.current) return;
    
    try {
      console.log("🔵 Loading user profile from database for:", authUser.id);
      
      // Always fetch fresh user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('🔴 Error fetching profile:', profileError);
        throw profileError;
      }

      let userProfile: User;

      if (profileData) {
        userProfile = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          initials: profileData.initials,
          families: Array.isArray(profileData.families) ? profileData.families : [],
          currentFamilyId: profileData.current_family_id
        };
        console.log("🟢 User profile loaded from database:", {
          id: userProfile.id,
          name: userProfile.name,
          familiesCount: userProfile.families?.length || 0,
          currentFamilyId: userProfile.currentFamilyId
        });
      } else {
        // Create new profile if doesn't exist
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        const newUserData = {
          id: authUser.id,
          email: authUser.email || '',
          name: userName,
          initials: userName.substring(0, 2).toUpperCase(),
          families: [],
          current_family_id: null
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newUserData);

        if (insertError) {
          console.error('🔴 Error creating profile:', insertError);
        }

        userProfile = {
          id: newUserData.id,
          email: newUserData.email,
          name: newUserData.name,
          initials: newUserData.initials,
          families: newUserData.families,
          currentFamilyId: newUserData.current_family_id
        };
      }
      
      if (!isMounted.current) return;
      setUser(userProfile);

      // Load families from database
      console.log("🔵 Loading families from database...");
      const { families, currentFamily } = await loadUserFamilies(userProfile);
      
      if (!isMounted.current) return;
      
      console.log("🟢 Families loaded from database:", { 
        familiesCount: families.length, 
        currentFamily: currentFamily?.name || 'none'
      });
      
      setFamilies(families || []);
      setCurrentFamily(currentFamily || null);
      
      // Always set loading to false at the end
      if (isMounted.current) {
        console.log("🟢 Auth process completed successfully");
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('🔴 Error in handleUserProfile:', error);
      if (isMounted.current) {
        setUser(null);
        setFamilies([]);
        setCurrentFamily(null);
        setIsLoading(false);
      }
    }
  };

  const checkCurrentSession = async (isMounted: React.MutableRefObject<boolean>) => {
    if (!isMounted.current) return;
    
    console.log("🔵 Checking current session...");
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("🔴 Error getting session:", error);
        if (isMounted.current) {
          setIsLoading(false);
        }
        return;
      }
      
      if (session?.user) {
        console.log("🟢 Found existing session, loading profile...");
        await handleUserProfile(session.user, isMounted);
      } else {
        console.log("🔴 No existing session found");
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('🔴 Error checking current session:', error);
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    handleAuthStateChange,
    checkCurrentSession
  };
};
