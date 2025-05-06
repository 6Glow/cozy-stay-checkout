
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

export const mapSupabaseUserToUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    firstName: supabaseUser.user_metadata?.firstName || "",
    lastName: supabaseUser.user_metadata?.lastName || "",
    phone: supabaseUser.user_metadata?.phone || "",
    createdAt: supabaseUser.created_at,
  };
};

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

export const handleAuthStateChange = (
  event: string,
  session: any,
  setUser: (user: User | null) => void
) => {
  console.log("Auth state changed:", event);
  
  if (session?.user) {
    const userData = mapSupabaseUserToUser(session.user);
    
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
};
