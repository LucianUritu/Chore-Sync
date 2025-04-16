
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nptuphsubkuxfbtvmfga.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdHVwaHN1Ymt1eGZidHZtZmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Njg2MzUsImV4cCI6MjA1OTQ0NDYzNX0.kPwLqFarZfngmMWud-K8qn-ZBhWRoBA61pSKjomL27c";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'choresync-auth'
  }
});