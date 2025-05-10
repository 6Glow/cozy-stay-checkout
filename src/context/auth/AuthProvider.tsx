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

  // Improved auto-login from stored credentials
  const tryAutoLogin = async () => {
    try {
      const storedCreds = localStorage.getItem("auth_credentials");
      if (storedCreds) {
        const parsedCreds = JSON.parse(storedCreds);
        if (parsedCreds.email && parsedCreds.password) {
          console.log("Attempting auto-login...");
          // Don't show loading state for auto-login attempt
          const { data, error } = await supabase.auth.signInWithPassword({
            email: parsedCreds.email,
            password: parsedCreds.password,
          });
          
          if (data.user && !error) {
            console.log("Auto-login successful");
            // Session will be set by the auth state listener
            return true;
          } else if (error) {
            console.error("Auto-login failed:", error.message);
            // If auto-login fails, clear stored credentials to prevent future failed attempts
            if (error.message?.includes("Invalid login credentials") && 
                localStorage.getItem("rememberMe") !== "true") {
              localStorage.removeItem("auth_credentials");
              localStorage.removeItem("rememberMe");
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Auto-login error:", error);
      return false;
    }
  };

  // Enhanced session management with better error handling
  useEffect(() => {
    // Track if the component is mounted to avoid state updates after unmount
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log("Auth state changed:", event);
        handleAuthStateChange(event, session, setUser);
        
        if (event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeSession = async () => {
      try {
        console.log("Initializing auth session...");
        const sessionResult = await checkSession();
        
        if (sessionResult.user) {
          console.log("Existing session found");
          setUser(sessionResult.user);
        } else {
          console.log("No session found, trying auto-login");
          // Try to auto-login if we don't have a session
          await tryAutoLogin();
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();
    
    // Set up session refresh interval (every 4 minutes to ensure freshness)
    const refreshInterval = setInterval(async () => {
      if (!isMounted) return;
      
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("Error refreshing session:", error);
          // If session refresh fails, try auto-login
          await tryAutoLogin();
        } else if (data.session) {
          console.log("Session refreshed successfully");
          // Update last auth time
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
        }
      } catch (error) {
        console.error("Error in refresh interval:", error);
      }
    }, 4 * 60 * 1000); // 4 minutes
    
    // Clean up subscription and interval
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    return await loginUser(email, password, setUser, setIsLoading, rememberMe);
  };

  const register = async (email: string, password: string) => {
    return registerUser(email, password, setUser, setIsLoading);
  };

  const logout = async (): Promise<void> => {
    // Keep auth credentials on logout for easy re-login if rememberMe was true
    // Otherwise clear them
    if (localStorage.getItem("rememberMe") !== "true") {
      localStorage.removeItem("auth_credentials");
      localStorage.removeItem("rememberMe");
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
