
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const Login = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { loginWithPassword, signupWithPassword } = useAuth();

  const onLoginSubmit = async (values: { email: string; password: string }) => {
    console.log("🔵 Login Page: Form submitted with values:", { email: values.email, passwordLength: values.password.length });
    
    try {
      setIsLoading(true);
      console.log("🔵 Login Page: Calling loginWithPassword...");
      
      const success = await loginWithPassword(values.email, values.password);
      console.log("🔵 Login Page: loginWithPassword result:", success);
      
      if (!success) {
        console.log("🔴 Login Page: Login failed");
      } else {
        console.log("🟢 Login Page: Login successful");
      }
      
    } catch (error: any) {
      console.error("🔴 Login Page: Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: { name: string; email: string; password: string; confirmPassword: string }) => {
    try {
      setIsLoading(true);
      const success = await signupWithPassword(values.name, values.email, values.password);
      
      if (!success) {
        toast({
          title: "Signup failed",
          description: "Failed to create account. Email may already be in use.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => setIsLoginMode(!isLoginMode);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-choresync-gray">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-choresync-blue">ChoreSync</h1>
          <p className="mt-2 text-gray-600">
            {isLoginMode 
              ? "Login to manage your household chores" 
              : "Sign up to start managing your household chores"}
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          {isLoginMode ? (
            <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
          ) : (
            <SignupForm onSubmit={onSignupSubmit} isLoading={isLoading} />
          )}

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-choresync-blue hover:underline"
              onClick={toggleMode}
            >
              {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
