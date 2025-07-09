import { User } from '@/types/auth.types';

export const checkUserFamilyStatus = (user: User | null): 'no-user' | 'no-family' | 'has-family' => {
  if (!user) {
    return 'no-user';
  }
  
  // Check if user has any families
  if (!user.families || user.families.length === 0) {
    return 'no-family';
  }
  
  return 'has-family';
};

export const getRedirectPath = (user: User | null): string => {
  // Always redirect to home if user is authenticated, otherwise to login
  if (!user) {
    return '/login';
  }
  
  return '/home';
};
