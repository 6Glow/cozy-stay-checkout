
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { mapSupabaseUserToUser } from "./mappers";

export const refreshSession = async (): Promise<{
  user: User | null;
  success: boolean;
}> => {
  try {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      console.log("Session refresh failed");
      localStorage.removeItem("user");
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
    return { user: null, success: false };
  }
};
