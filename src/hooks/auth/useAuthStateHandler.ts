
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
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          console.log("🟢 User signed in, processing profile...");
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
      // Skip TOKEN_REFRESHED to prevent duplicate processing
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
        if (isMounted.current) {
          setUser(null);
          setFamilies([]);
          setCurrentFamily(null);
          setIsLoading(false);
        }
        return;
      }

      console.log("🟢 User profile loaded successfully:", {
        id: userProfile.id,
        name: userProfile.name,
        familiesCount: userProfile.families?.length || 0
      });
      
      if (!isMounted.current) return;
      setUser(userProfile);

      // Load families with timeout to prevent hanging
      console.log("🔵 Loading families for user...");
      
      try {
        const familyPromise = loadUserFamilies(userProfile);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Family loading timeout')), 5000);
        });
        
        const { families, currentFamily } = await Promise.race([familyPromise, timeoutPromise]) as any;
        
        if (!isMounted.current) return;
        
        console.log("🟢 Families loaded:", { 
          familiesCount: families.length, 
          currentFamily: currentFamily?.name || 'none'
        });
        
        setFamilies(families || []);
        setCurrentFamily(currentFamily || null);
        
      } catch (familyError) {
        console.error('🔴 Error loading families (using fallback):', familyError);
        if (isMounted.current) {
          // Set empty families but still complete the auth process
          setFamilies([]);
          setCurrentFamily(null);
        }
      }
      
      // Always set loading to false at the end
      if (isMounted.current) {
        console.log("🟢 Auth process completed, setting loading to false");
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
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session check timeout')), 3000);
      });
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
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
