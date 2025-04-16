export interface Family {
    id: string;
    name: string;
    members: {
      userId: string;
      name: string;
      initials: string;
    }[];
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    initials: string;
    password?: string;
    families: string[];
    currentFamilyId: string | null;
  }
  
  export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    families: Family[];
    currentFamily: Family | null;
    login: (email: string) => Promise<void>;
    loginWithPassword: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string) => Promise<void>;
    signupWithPassword: (name: string, email: string, password: string) => Promise<boolean>;
    verifyOtp: (otp: string) => Promise<void>;
    logout: () => void;
    createFamily: (name: string) => Promise<Family | undefined>;
    switchFamily: (familyId: string) => void;
    updateUserName: (newName: string) => Promise<void>;
  }
  