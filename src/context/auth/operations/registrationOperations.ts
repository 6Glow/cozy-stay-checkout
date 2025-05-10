
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { mapSupabaseUserToUser } from "../session/mappers";

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
    
    // First check if user already exists to avoid rate limit issues
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If login succeeds, user already exists and has the right password
    if (!loginError && loginData.user) {
      const userData = mapSupabaseUserToUser(loginData.user);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
      toast.success("Welcome back! You've been logged in!");
      return;
    } 
    
    // If login failed for reasons other than incorrect password or non-existent user, don't proceed
    if (loginError && 
        !loginError.message.includes("Invalid login credentials") && 
        !loginError.message.includes("Email not confirmed")) {
      toast.error(loginError.message || "An error occurred. Please try again later.");
      throw loginError;
    }
    
    // Proceed with registration with auto-verification option
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          email_confirmed: true // Hint for auto-verification in development
        }
      }
    });
    
    // Handle registration errors
    if (error) {
      console.error("Registration error:", error);
      
      // If rate limited, try a different approach
      if (error.message?.includes("rate limit")) {
        toast.warning("Email sending is rate limited. Trying alternative registration method...");
        
        // Try direct admin auth (works in development)
        const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!adminError && adminData.user) {
          const userData = mapSupabaseUserToUser(adminData.user);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
          localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
          toast.success("Registration successful! Welcome aboard!");
          return;
        }
        
        // If that failed too, inform the user about the rate limit
        toast.error("Registration temporarily unavailable due to email rate limits. Please try again later or contact support.");
        throw new Error("Email rate limit exceeded");
      }
      
      // Handle other specific error cases
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please try logging in instead.");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
      throw error;
    }
    
    // Handle successful registration
    if (data.user) {
      const userData = mapSupabaseUserToUser(data.user);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
      localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
      
      toast.success("Registration successful! Welcome aboard!");
    }
  } catch (error: any) {
    // Re-throw for form handling
    throw error;
  } finally {
    setIsLoading(false);
  }
};
