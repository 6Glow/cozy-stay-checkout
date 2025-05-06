
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { mapSupabaseUserToUser } from "./mappers";
import { refreshSession } from "./sessionRefresh";

export const checkSession = async (): Promise<{
  user: User | null;
  success: boolean;
}> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking session:", error);
      return { user: null, success: false };
    }
    
    if (data.session?.user) {
      const userData = mapSupabaseUserToUser(data.session.user);
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      
      return { user: userData, success: true };
    } else {
      // Check for stored user data as fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const refreshResult = await refreshSession();
        return refreshResult;
      }
      
      return { user: null, success: false };
    }
  } catch (error) {
    console.error("Error checking session:", error);
    return { user: null, success: false };
  }
};
