
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPath } from "@/utils/familyUtils";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoading || hasRedirected) return;
    
    console.log("Index: Auth state check", { 
      hasUser: !!user,
      familiesCount: user?.families?.length || 0,
      families: user?.families,
      isLoading
    });
    
    // Small timeout to ensure state is stable before navigation
    const redirectTimer = setTimeout(() => {
      const redirectPath = getRedirectPath(user);
      
      console.log("Index: Redirecting to:", redirectPath);
      setHasRedirected(true);
      navigate(redirectPath, { replace: true });
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [navigate, user, isLoading, hasRedirected]);

  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center h-screen bg-choresync-gray">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-choresync-blue mb-4">Welcome to ChoreSync</h2>
        <div className="w-16 h-16 border-4 border-t-choresync-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        
        <p className="mt-4 text-gray-600">
          {isLoading ? "Checking authentication..." : "Redirecting you..."}
        </p>
        
        {/* Debug info */}
        <div className="mt-4 text-xs text-gray-400">
          User: {user ? "✓" : "✗"} | Families: {user?.families?.length || 0} | Loading: {isLoading ? "✓" : "✗"}
        </div>
      </div>
    </div>
  );
};

export default Index;
