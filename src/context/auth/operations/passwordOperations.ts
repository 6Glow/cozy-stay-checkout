
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Sends a password reset email
 */
export const forgotUserPassword = async (
  email: string,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
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

/**
 * Resets user's password with token from email
 */
export const resetUserPassword = async (
  token: string,
  password: string,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
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
