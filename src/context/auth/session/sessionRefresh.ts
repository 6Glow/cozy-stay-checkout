
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { mapSupabaseUserToUser } from "./mappers";
import { toast } from "sonner";

export const refreshSession = async (): Promise<{
  user: User | null;
  success: boolean;
}> => {
  try {
    console.log("Attempting to refresh session...");
    
    // Try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error("Session refresh failed:", refreshError);
      
      // Check if stored user data exists as fallback for UI purposes
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        // Try one more time to sign in with stored credentials 
        const storedAuth = localStorage.getItem("auth_credentials");
        
        if (storedAuth) {
          try {
            const { email, password } = JSON.parse(storedAuth);
            console.log("Attempting to sign in again with stored credentials");
            
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (!signInError && signInData.user) {
              const userData = mapSupabaseUserToUser(signInData.user);
              localStorage.setItem("user", JSON.stringify(userData));
              localStorage.setItem("sb-last-auth-time", new Date().toISOString());
              toast.success("Session restored successfully");
              return { user: userData, success: true };
            }
          } catch (e) {
            console.log("Error using stored credentials:", e);
          }
        }
      }
      
      localStorage.removeItem("user");
      localStorage.removeItem("sb-last-auth-time");
      return { user: null, success: false };
    }
    
    if (!refreshData.session) {
      console.log("No session returned after refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("sb-last-auth-time");
      return { user: null, success: false };
    }
    
    console.log("Session refreshed successfully");
    const userData = mapSupabaseUserToUser(refreshData.session.user);
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("sb-last-auth-time", new Date().toISOString());
    
    return { user: userData, success: true };
  } catch (e) {
    console.error("Error refreshing session:", e);
    localStorage.removeItem("user");
    localStorage.removeItem("sb-last-auth-time");
    return { user: null, success: false };
  }
};
