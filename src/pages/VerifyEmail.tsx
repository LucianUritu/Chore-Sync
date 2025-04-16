
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  otp: z.string().min(6, { message: "Verification code must be 6 digits" }),
});

const VerifyEmail = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingAuthEmail");
    if (!pendingEmail) {
      navigate("/login");
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
      setCountdown(60);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownActive, countdown]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await verifyOtp(values.otp);
      // Note: No need for toast or navigation here as they're handled in the verifyOtp function
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendCode = () => {
    setIsResending(true);
    
    // Simulate sending a new verification code
    localStorage.setItem('verificationCode', '123456');
    
    setTimeout(() => {
      setIsResending(false);
      setIsCountdownActive(true);
      
      toast({
        title: "Code resent: 123456",
        description: `In a real app, this would be sent to ${email}. For testing, use code: 123456`,
      });
    }, 1000);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 bg-choresync-gray">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center">
          <button 
            onClick={goBack}
            className="p-2 mr-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Email Verification</h1>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              We've sent a verification code to
            </p>
            <p className="font-medium">{email}</p>
            <p className="mt-2 text-sm text-gray-500">
              For this demo, use code: <span className="font-bold">123456</span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Verify and Continue
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive a code?{" "}
              {isCountdownActive ? (
                <span className="text-gray-400">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-medium text-choresync-blue hover:underline disabled:text-gray-400"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;