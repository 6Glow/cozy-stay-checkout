
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { mapSupabaseUserToUser } from "../session/mappers";

export const loginUser = async (
  email: string,
  password: string,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  rememberMe: boolean = true
): Promise<boolean> => {
  setIsLoading(true);
  let success = false;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      
      // Check if this is an unverified account
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email address before logging in.");
      } else {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      }
      
    } else if (data.user) {
      const userData = mapSupabaseUserToUser(data.user);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      
      // Store credentials for auto-login if rememberMe is true
      if (rememberMe) {
        localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("auth_credentials");
        localStorage.removeItem("rememberMe");
      }
      
      toast.success("Login successful! Welcome back!");
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error("Login error:", error);
    toast.error("An unexpected error occurred. Please try again later.");
    return false;
  } finally {
    setIsLoading(false);
  }
};

export default loginUser;
