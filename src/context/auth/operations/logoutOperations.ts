
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Handles user logout
 */
export const logoutUser = async (
  setUser: (user: null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      throw error;
    }
    
    // Clear user data from localStorage
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("sb-last-auth-time");
    
    toast.success("You've been successfully logged out!");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Something went wrong while logging out.");
  } finally {
    setIsLoading(false);
  }
};
