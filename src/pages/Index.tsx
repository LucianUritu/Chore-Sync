import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect based on authentication status
    if (user) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate, user]);

  return null;
};

export default Index;
