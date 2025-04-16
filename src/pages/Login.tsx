import React, { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Login = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { loginWithPassword, signupWithPassword } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      console.log("Login: Attempting login with email", values.email);
      
      await loginWithPassword(values.email, values.password);
      
      // Note: Navigation is now handled inside loginWithPassword
      
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
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
      // Navigation is handled in signupWithPassword
      
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

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
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
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
                          <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                            <Mail size={20} />
                          </div>
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            className="border-0 focus-visible:ring-0"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
                          <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                            <Lock size={20} />
                          </div>
                          <Input
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            className="border-0 focus-visible:ring-0"
                            disabled={isLoading}
                            {...field}
                          />
                          <div 
                            className="flex items-center justify-center w-10 h-10 text-gray-500 cursor-pointer"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
                          <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                            <User size={20} />
                          </div>
                          <Input
                            placeholder="Your name"
                            className="border-0 focus-visible:ring-0"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
                          <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                            <Mail size={20} />
                          </div>
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            className="border-0 focus-visible:ring-0"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
                          <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                            <Lock size={20} />
                          </div>
                          <Input
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            className="border-0 focus-visible:ring-0"
                            disabled={isLoading}
                            {...field}
                          />
                          <div 
                            className="flex items-center justify-center w-10 h-10 text-gray-500 cursor-pointer"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md border-input focus-within:ring-2 focus-within:ring-ring">
                          <div className="flex items-center justify-center w-10 h-10 text-gray-500">
                            <Lock size={20} />
                          </div>
                          <Input
                            placeholder="Confirm password"
                            type={showConfirmPassword ? "text" : "password"}
                            className="border-0 focus-visible:ring-0"
                            disabled={isLoading}
                            {...field}
                          />
                          <div 
                            className="flex items-center justify-center w-10 h-10 text-gray-500 cursor-pointer"
                            onClick={toggleShowConfirmPassword}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
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
