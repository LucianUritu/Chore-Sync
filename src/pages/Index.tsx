
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, families } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoading || hasRedirected) return; // Don't do anything while auth is loading or already redirected
    
    console.log("Index: Auth state check", { 
      hasUser: !!user,
      familiesCount: families?.length || 0,
      families,
      isLoading
    });
    
    // Small timeout to ensure state is stable before navigation
    const redirectTimer = setTimeout(() => {
      if (!user) {
        console.log("Index: No user, navigating to /login");
        setHasRedirected(true);
        navigate("/login", { replace: true });
      } else if (!families || families.length === 0) {
        console.log("Index: User has no families, navigating to /family-selection");
        setHasRedirected(true);
        navigate("/family-selection", { replace: true });
      } else {
        console.log("Index: User has families, navigating to /home");
        setHasRedirected(true);
        navigate("/home", { replace: true });
      }
    }, 100); // Reduced timeout

    return () => clearTimeout(redirectTimer);
  }, [navigate, user, isLoading, families, hasRedirected]);

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
          User: {user ? "✓" : "✗"} | Families: {families?.length || 0} | Loading: {isLoading ? "✓" : "✗"}
        </div>
      </div>
    </div>
  );
};

export default Index;
