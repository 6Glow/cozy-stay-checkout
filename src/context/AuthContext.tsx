import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
        console.log("Auth state changed:", event);
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            firstName: session.user.user_metadata?.firstName || "",
            lastName: session.user.user_metadata?.lastName || "",
            phone: session.user.user_metadata?.phone || "",
            createdAt: session.user.created_at,
          };
          
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
          
          // If login event, show toast
          if (event === 'SIGNED_IN') {
            toast.success("Login successful!");
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("sb-last-auth-time");
          toast.success("You've been logged out successfully.");
        } else if (event === 'TOKEN_REFRESHED') {
          // Do nothing special here, just log it
          console.log("Auth token refreshed");
        } else if (!session) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("sb-last-auth-time");
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          return;
        }
        
        if (data.session?.user) {
          const userData: User = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            firstName: data.session.user.user_metadata?.firstName || "",
            lastName: data.session.user.user_metadata?.lastName || "",
            phone: data.session.user.user_metadata?.phone || "",
            createdAt: data.session.user.created_at,
          };
          
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
        } else {
          // Check for stored user data as fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            // If we have a stored user but no active session, we need to refresh the token
            // or clear the stored user
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshError || !refreshData.session) {
                // If we can't refresh, clear the stored user
                localStorage.removeItem("user");
                setUser(null);
              } else {
                // If we successfully refreshed, update the user
                const userData: User = {
                  id: refreshData.session.user.id,
                  email: refreshData.session.user.email || "",
                  firstName: refreshData.session.user.user_metadata?.firstName || "",
                  lastName: refreshData.session.user.user_metadata?.lastName || "",
                  phone: refreshData.session.user.user_metadata?.phone || "",
                  createdAt: refreshData.session.user.created_at,
                };
                
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("sb-last-auth-time", new Date().toISOString());
              }
            } catch (e) {
              console.error("Error refreshing session:", e);
              localStorage.removeItem("user");
              setUser(null);
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
      }
    };

    checkSession();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clear stored data first to prevent using stale data
      localStorage.removeItem("user");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || "",
          firstName: data.user.user_metadata?.firstName || "",
          lastName: data.user.user_metadata?.lastName || "",
          phone: data.user.user_metadata?.phone || "",
          createdAt: data.user.created_at,
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      
      // More detailed error handling
      if (error.message?.includes("email") && error.message?.includes("not confirmed")) {
        error.code = "email_not_confirmed";
        toast.error("Email not confirmed. Please check your inbox for the confirmation link.");
      } else if (error.message?.includes("Invalid login")) {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || "",
          createdAt: data.user.created_at,
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Registration successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clean up stored data
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("sb-last-auth-time");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast.success("Password has been reset successfully.");
    } catch (error: any) {
      toast.error(error.message || "Password reset failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        }
      });
      
      if (error) throw error;
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      // Delete user's bookings first
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', user?.id);
        
      if (bookingsError) {
        throw bookingsError;
      }

      // Then delete the auth user
      const { error: userError } = await supabase.auth.admin.deleteUser(
        user?.id || ""
      );
      
      if (userError) {
        throw userError;
      }

      setUser(null);
      localStorage.removeItem("user");
      toast.success("Your account has been deleted successfully");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account. Please try again.");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
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
