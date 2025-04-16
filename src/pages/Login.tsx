
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Eye, EyeOff, Lock } from "lucide-react";
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
import { supabase } from "@/integration/supabase/clients";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const { toast } = useToast();
  const { loginWithPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // We'll just redirect to / and let Index handle the redirection logic
  const from = location.state?.from || "/";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        console.error("Login error:", error);
      } else if (data?.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        console.log("Login successful, navigating to:", from);
        // Force a delay to ensure auth state is updated
        setTimeout(() => {
          // Navigate to root and let the Index component handle further redirection
          navigate("/", { replace: true });
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
      console.error("Unexpected login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 bg-choresync-gray">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-choresync-blue">ChoreSync</h1>
          <p className="mt-2 text-gray-600">
            Login to manage your household chores
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-choresync-blue hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;