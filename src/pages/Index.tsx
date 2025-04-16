import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integration/supabase/clients";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, families } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const [directCheckDone, setDirectCheckDone] = useState(false);

  // Do an immediate check with Supabase directly
  useEffect(() => {
    const checkAuthDirectly = async () => {
      try {
        console.log("Index: Checking auth directly with Supabase");
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("Index: No active session found, redirecting to login");
          navigate("/login", { replace: true });
        } else {
          console.log("Index: Active session found, waiting for auth context to load");
          // Let the auth context handle further routing
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setDirectCheckDone(true);
      }
    };
    
    checkAuthDirectly();
  }, [navigate]);

  // Quick timeout to prevent endless loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
      console.log("Index: Local loading timeout elapsed");
    }, 500); // Short timeout
    
    return () => clearTimeout(timer);
  }, []);

  // Enhanced redirection logic with family check
  useEffect(() => {
    console.log("Index: Checking auth state", { 
      isLoading, 
      hasUser: !!user, 
      familiesCount: families?.length || 0,
      directCheckDone,
      localLoading
    });
    
    // Only proceed if auth check is complete or local timeout has elapsed
    if ((!isLoading && directCheckDone) || !localLoading) {
      if (user) {
        console.log("Index: User authenticated, checking families", { userId: user.id });
        
        if (families && families.length > 0) {
          console.log("Index: User has families, navigating to /home");
          navigate("/home", { replace: true });
        } else {
          console.log("Index: User has no families, navigating to /family-selection");
          navigate("/family-selection", { replace: true });
        }
      } else if (!isLoading && directCheckDone) {
        console.log("Index: User not authenticated after checks, navigating to /login");
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, user, isLoading, families, localLoading, directCheckDone]);

  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center h-screen bg-choresync-gray">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-choresync-blue mb-4">Welcome to ChoreSync</h2>
        <div className="w-16 h-16 border-4 border-t-choresync-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        
        <p className="mt-4 text-gray-600">
          {isLoading ? "Checking authentication..." : "Redirecting you..."}
        </p>
      </div>
    </div>
  );
};

export default Index;
