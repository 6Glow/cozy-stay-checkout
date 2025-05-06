
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

/**
 * Updates user profile information
 */
export const updateUserProfile = async (
  userData: Partial<User>,
  user: User | null,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
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
