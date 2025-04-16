import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import BottomNavigation from "./components/layout/BottomNavigation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Roommates from "./pages/Roommates";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import FamilySetup from "./pages/FamilySetup";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showBottomNav = !["/login", "/signup", "/verify", "/family-setup"].includes(
    location.pathname
  );

  return (
    <div className="min-h-screen bg-choresync-gray">
      {children}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root route redirects based on auth status */}
      <Route path="/" element={<Index />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/family-setup" element={
        <ProtectedRoute>
          <FamilySetup />
        </ProtectedRoute>
      } />

      {/* Protected routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/roommates" 
        element={
          <ProtectedRoute>
            <Roommates />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* NotFound route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
