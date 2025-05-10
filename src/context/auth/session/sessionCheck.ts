
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { mapSupabaseUserToUser } from "./mappers";
import { refreshSession } from "./sessionRefresh";
import { toast } from "sonner";

export const checkSession = async (): Promise<{
  user: User | null;
  success: boolean;
}> => {
  try {
    console.log("Checking for active session...");
    
    // Check for stored user data as a quick first check
    const storedUser = localStorage.getItem("user");
    const lastAuthTime = localStorage.getItem("sb-last-auth-time");
    
    // If we have a stored user and the last auth time is within the last 30 minutes,
    // we can assume the session is still valid for better UX
    if (storedUser && lastAuthTime) {
      const lastAuth = new Date(lastAuthTime);
      const now = new Date();
      const minutesSinceLastAuth = (now.getTime() - lastAuth.getTime()) / (1000 * 60);
      
      // If authenticated in the last 2 minutes, use stored data for better UX
      if (minutesSinceLastAuth < 2) {
        console.log("Using cached user data (authenticated within last 2 minutes)");
        return { user: JSON.parse(storedUser), success: true };
      }
    }
    
    // Perform actual session check with Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking session:", error);
      return { user: null, success: false };
    }
    
    if (data.session?.user) {
      const userData = mapSupabaseUserToUser(data.session.user);
      
      // Update last auth time and store user data
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      
      console.log("Active session found and verified");
      return { user: userData, success: true };
    } else {
      // No active session, try to refresh it
      console.log("No active session found, attempting refresh...");
      
      if (storedUser) {
        console.log("Stored user found. Trying to refresh session...");
        const refreshResult = await refreshSession();
        
        if (refreshResult.success) {
          console.log("Session refreshed successfully");
          return refreshResult;
        } else {
          console.log("Failed to refresh session");
          
          // Try auto-login with stored credentials
          const storedCreds = localStorage.getItem("auth_credentials");
          
          if (storedCreds) {
            try {
              console.log("Attempting login with stored credentials");
              const { email, password } = JSON.parse(storedCreds);
              
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              if (!signInError && signInData.user) {
                const userData = mapSupabaseUserToUser(signInData.user);
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("sb-last-auth-time", new Date().toISOString());
                
                console.log("Auto-login successful");
                return { user: userData, success: true };
              } else {
                console.log("Auto-login failed:", signInError?.message);
                // Clear stored credentials if login failed and remember me is not set
                if (localStorage.getItem("rememberMe") !== "true") {
                  localStorage.removeItem("auth_credentials");
                  localStorage.removeItem("rememberMe");
                }
              }
            } catch (e) {
              console.log("Error using stored credentials:", e);
            }
          }
          
          // Clear stored user if all refresh attempts fail
          localStorage.removeItem("user");
          localStorage.removeItem("sb-last-auth-time");
        }
      }
      
      return { user: null, success: false };
    }
  } catch (error) {
    console.error("Error checking session:", error);
    return { user: null, success: false };
  }
};
