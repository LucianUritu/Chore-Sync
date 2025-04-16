
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, families } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log("Index: Auth state loaded", { user: !!user });
      // Redirect based on authentication status
      if (user) {
        console.log("Index: User authenticated, checking families");
        if (families && families.length > 0) {
          console.log("Index: User has families, navigating to /home");
          navigate("/home", { replace: true });
        } else {
          console.log("Index: User has no families, navigating to /family-setup");
          navigate("/family-setup", { replace: true });
        }
      } else {
        console.log("Index: User not authenticated, navigating to /login");
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, user, isLoading, families]);

  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center h-screen bg-choresync-gray">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-choresync-blue mb-4">Loading...</h2>
        <div className="w-16 h-16 border-4 border-t-choresync-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        
        {/* Add a timeout message that appears after 5 seconds */}
        {isLoading && (
          <p className="mt-4 text-gray-600 animate-fade-in delay-5000">
            This is taking longer than usual. Please refresh if it continues.
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;