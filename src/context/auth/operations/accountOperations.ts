
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes user account and related data
 */
export const deleteUserAccount = async (
  userId: string | undefined,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    // Delete user's bookings first
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .eq('user_id', userId);
      
    if (bookingsError) {
      throw bookingsError;
    }

    // Then delete the auth user
    const { error: userError } = await supabase.auth.admin.deleteUser(
      userId || ""
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

// Add missing User import for TypeScript
import { User } from "@/types";
