
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
      }
    }
  };

  const handleUserProfile = async (authUser: any, isMounted: React.MutableRefObject<boolean>) => {
    if (!isMounted.current) return;
    
    try {
      console.log("🔵 Creating or loading user profile for:", authUser.id);
      
      // Use the existing createOrLoadUserProfile function
      const userProfile = await createOrLoadUserProfile(authUser);
      
      if (!isMounted.current || !userProfile) {
        console.log("🔴 Component unmounted or no user profile");
        if (isMounted.current) {
          setIsLoading(false);
        }
        return;
      }
      
      console.log("🟢 User profile loaded:", {
        id: userProfile.id,
        name: userProfile.name,
        familiesCount: userProfile.families?.length || 0
      });
      
      setUser(userProfile);

      // Load families
      console.log("🔵 Loading families...");
      const { families, currentFamily } = await loadUserFamilies(userProfile);
      
      if (!isMounted.current) return;
      
      console.log("🟢 Families loaded:", { 
        familiesCount: families.length, 
        currentFamily: currentFamily?.name || 'none'
      });
      
      setFamilies(families || []);
      setCurrentFamily(currentFamily || null);
      
      console.log("🟢 Auth process completed successfully");
      
    } catch (error) {
      console.error('🔴 Error in handleUserProfile:', error);
    } finally {
      if (isMounted.current) {
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
