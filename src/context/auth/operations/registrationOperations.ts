
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { mapSupabaseUserToUser } from "../session";

/**
 * Handles user registration with email and password
 */
export const registerUser = async (
  email: string, 
  password: string,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    // Validate password strength
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setIsLoading(false);
      throw new Error("Password must be at least 8 characters long.");
    }
    
    // Check for at least one number and special character
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasNumber || !hasSpecial) {
      toast.error("Password must contain at least one number and one special character.");
      setIsLoading(false);
      throw new Error("Password must contain at least one number and one special character.");
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("Registration error:", error);
      
      // Handle specific error cases
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please try logging in instead.");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
      throw error;
    }
    
    if (data.user) {
      const userData = mapSupabaseUserToUser(data.user);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      
      // Store credentials for auto-login if email verification is skipped
      localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
      
      toast.success("Registration successful! Welcome aboard!");
    }
  } catch (error: any) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};
