import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, families } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Don't do anything while auth is loading
    
    if (isRedirecting) return; // Prevent multiple redirects
    setIsRedirecting(true);
    
    console.log("Index: Auth check complete", { 
      hasUser: !!user, 
      familiesCount: families?.length || 0 
    });
    
    // Small timeout to ensure state is stable before navigation
    setTimeout(() => {
      if (user) {
        if (families && families.length > 0) {
          console.log("Index: User has families, navigating to /home");
          navigate("/home", { replace: true });
        } else {
          console.log("Index: User has no families, navigating to /family-selection");
          navigate("/family-selection", { replace: true });
        }
      } else {
        console.log("Index: No user after auth check, navigating to /login");
        navigate("/login", { replace: true });
      }
    }, 100);
  }, [navigate, user, isLoading, families]);

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
