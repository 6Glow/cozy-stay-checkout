
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { mapSupabaseUserToUser } from "../sessionUtils";

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const userData = mapSupabaseUserToUser(data.user);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Registration successful!");
    }
  } catch (error: any) {
    toast.error(error.message || "Registration failed. Please try again.");
    throw error;
  } finally {
    setIsLoading(false);
  }
};
