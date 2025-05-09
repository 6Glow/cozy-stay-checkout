
import { User } from "@/types";
import { createContext } from "react";

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>; // Change return type from void to boolean
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
