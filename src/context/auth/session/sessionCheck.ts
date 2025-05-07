
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
    // Check for stored user data as a quick first check
    const storedUser = localStorage.getItem("user");
    const lastAuthTime = localStorage.getItem("sb-last-auth-time");
    
    // If we have a stored user and the last auth time is within the last 30 minutes,
    // we can assume the session is still valid for better UX
    if (storedUser && lastAuthTime) {
      const lastAuth = new Date(lastAuthTime);
      const now = new Date();
      const minutesSinceLastAuth = (now.getTime() - lastAuth.getTime()) / (1000 * 60);
      
      // If authenticated in the last 5 minutes, use stored data for better UX
      if (minutesSinceLastAuth < 5) {
        return { user: JSON.parse(storedUser), success: true };
      }
    }
    
    // Perform actual session check with Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking session:", error);
      toast.error("Session verification failed. Please try logging in again.");
      return { user: null, success: false };
    }
    
    if (data.session?.user) {
      const userData = mapSupabaseUserToUser(data.session.user);
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      
      return { user: userData, success: true };
    } else {
      // No active session, try to refresh it
      if (storedUser) {
        console.log("No active session but stored user found. Trying to refresh...");
        const refreshResult = await refreshSession();
        if (refreshResult.success) {
          console.log("Session refreshed successfully");
        } else {
          console.log("Failed to refresh session");
          // Clear stored user if refresh fails
          localStorage.removeItem("user");
          localStorage.removeItem("sb-last-auth-time");
        }
        return refreshResult;
      }
      
      return { user: null, success: false };
    }
  } catch (error) {
    console.error("Error checking session:", error);
    toast.error("Session verification failed. Please try logging in again.");
    return { user: null, success: false };
  }
};
