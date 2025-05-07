
import React, { useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  forgotUserPassword, 
  resetUserPassword, 
  updateUserProfile, 
  deleteUserAccount 
} from "./operations";
import { handleAuthStateChange, checkSession } from "./session";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleAuthStateChange(event, session, setUser);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const initializeSession = async () => {
      const sessionResult = await checkSession();
      if (sessionResult.user) {
        setUser(sessionResult.user);
      }
      setIsLoading(false);
    };

    initializeSession();
    
    // Set up session refresh interval (every 5 minutes)
    const refreshInterval = setInterval(async () => {
      console.log("Refreshing session token...");
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Error refreshing session:", error);
        } else if (data.session) {
          console.log("Session refreshed successfully");
          // Update last auth time
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
        }
      } catch (error) {
        console.error("Error in refresh interval:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up subscription and interval
    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const login = async (email: string, password: string) => {
    return loginUser(email, password, setUser, setIsLoading);
  };

  const register = async (email: string, password: string) => {
    return registerUser(email, password, setUser, setIsLoading);
  };

  const logout = async (): Promise<void> => {
    // Clear auth credentials on logout
    localStorage.removeItem("auth_credentials");
    return logoutUser(setUser, setIsLoading);
  };

  const forgotPassword = async (email: string) => {
    return forgotUserPassword(email, setIsLoading);
  };

  const resetPassword = async (token: string, password: string) => {
    return resetUserPassword(token, password, setIsLoading);
  };

  const updateProfile = async (userData: Partial<User>) => {
    return updateUserProfile(userData, user, setUser, setIsLoading);
  };

  const deleteAccount = async () => {
    // Clear auth credentials on account deletion
    localStorage.removeItem("auth_credentials");
    return deleteUserAccount(user?.id, setUser, setIsLoading);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
