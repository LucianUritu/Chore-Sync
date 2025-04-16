
import { supabase } from '@/integration/supabase/clients';
import { toast } from '@/hooks/use-toast';

export const simulateSendEmail = (email: string) => {
  console.log(`Simulating sending verification code to ${email}`);
  
  // For demo purposes, we'll set a mock verification code
  localStorage.setItem('verificationCode', '123456');
  
  toast({
    title: "Verification Code: 123456",
    description: `In a real app, this would be sent to ${email}. For testing, use code: 123456`,
  });
};
