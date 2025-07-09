import { User } from '@/types/auth.types';

export const checkUserFamilyStauts = (user: User | null): 'no-user' | 'no-family' | 'has-family' => {
  if (!user) {
    return 'no-user';
  }

  if (!user.families || user.families.length === 0) {
    return 'no-family';
  }

  return 'has-family';
};

export const getRedirectPath = (user: User | null): string => {
    const status = checkUserFamilyStauts(user);
    switch (status) {
        case 'no-user':
            return '/auth/login';
        case 'no-family':
            return '/family/create';
        case 'has-family':
            return '/dashboard';
        default:
            return '/auth/login'; // Fallback path
    }
};