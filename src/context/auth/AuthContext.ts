
import { createContext } from 'react';
import { User } from '@/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>; // Changed from Promise<void> to Promise<boolean>
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: () => Promise.resolve(false), // Changed to return boolean
  register: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  updateProfile: () => Promise.resolve(),
  deleteAccount: () => Promise.resolve(),
});
