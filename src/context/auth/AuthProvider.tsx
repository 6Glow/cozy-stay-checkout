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

  // Auto-login from stored credentials
  const tryAutoLogin = async () => {
    try {
      const storedCreds = localStorage.getItem("auth_credentials");
      if (storedCreds) {
        const parsedCreds = JSON.parse(storedCreds);
        if (parsedCreds.email && parsedCreds.password) {
          // Don't show loading state for auto-login attempt
          const { data, error } = await supabase.auth.signInWithPassword({
            email: parsedCreds.email,
            password: parsedCreds.password,
          });
          
          if (data.user && !error) {
            console.log("Auto-login successful");
            // Session will be set by the auth state listener
          } else if (error) {
            console.error("Auto-login failed:", error.message);
            // If auto-login fails, clear stored credentials to prevent future failed attempts
            if (error.message?.includes("Invalid login credentials")) {
              localStorage.removeItem("auth_credentials");
            }
          }
        }
      }
    } catch (error) {
      console.error("Auto-login error:", error);
    }
  };

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
      } else {
        // Try to auto-login if we don't have a session
        await tryAutoLogin();
      }
      setIsLoading(false);
    };

    initializeSession();
    
    // Set up session refresh interval (every 1 minute to ensure freshness)
    const refreshInterval = setInterval(async () => {
      console.log("Refreshing session token...");
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Error refreshing session:", error);
          // If we can't refresh, try auto-login
          await tryAutoLogin();
        } else if (data.session) {
          console.log("Session refreshed successfully");
          // Update last auth time
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
        }
      } catch (error) {
        console.error("Error in refresh interval:", error);
      }
    }, 60 * 1000); // 1 minute
    
    // Clean up subscription and interval
    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    const result = await loginUser(email, password, setUser, setIsLoading, rememberMe);
    return result;
  };

  const register = async (email: string, password: string) => {
    return registerUser(email, password, setUser, setIsLoading);
  };

  const logout = async (): Promise<void> => {
    // Keep auth credentials on logout for easy re-login if rememberMe was true
    // Otherwise clear them
    if (localStorage.getItem("rememberMe") !== "true") {
      localStorage.removeItem("auth_credentials");
    }
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
    localStorage.removeItem("rememberMe");
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
