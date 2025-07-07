
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
          console.log("🟢 User signed in, processing profile...");
          setIsLoading(true);
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
      console.log("🔵 Starting user profile creation/loading for:", authUser.id);
      
      const userProfile = await createOrLoadUserProfile(authUser);
      
      if (!isMounted.current) {
        console.log("🔴 Component unmounted during profile loading");
        return;
      }

      if (!userProfile) {
        console.error("🔴 Failed to create or load user profile");
        setUser(null);
        setFamilies([]);
        setCurrentFamily(null);
        setIsLoading(false);
        return;
      }

      console.log("🟢 User profile loaded successfully:", userProfile);
      setUser(userProfile);

      // Load families - this is where the issue might be
      console.log("🔵 Loading families for user...", userProfile.families);
      
      try {
        const { families, currentFamily } = await loadUserFamilies(userProfile);
        
        if (!isMounted.current) return;
        
        console.log("🟢 Families loaded:", { 
          familiesCount: families.length, 
          currentFamily: currentFamily?.name || 'none',
          familiesList: families
        });
        
        setFamilies(families);
        setCurrentFamily(currentFamily);
        
        // Important: Always set loading to false regardless of family count
        setIsLoading(false);
        
      } catch (familyError) {
        console.error('🔴 Error loading families:', familyError);
        if (isMounted.current) {
          // Set empty families but still complete the auth process
          setFamilies([]);
          setCurrentFamily(null);
          setIsLoading(false);
        }
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
    setIsLoading(true);
    
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
