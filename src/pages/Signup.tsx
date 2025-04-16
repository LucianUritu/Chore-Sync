
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, User, Eye, EyeOff, Lock } from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const { toast } = useToast();
  const { signupWithPassword } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSigningUp(true);
      const success = await signupWithPassword(values.name, values.email, values.password);
      
      if (success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        navigate("/");
      } else {
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
      setIsSigningUp(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-choresync-gray">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-choresync-blue">ChoreSync</h1>
          <p className="mt-2 text-gray-600">
            Sign up to start managing your household chores
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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

              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-choresync-blue hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;