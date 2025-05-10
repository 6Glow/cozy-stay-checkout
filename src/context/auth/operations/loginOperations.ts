
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
    // First attempt to sign in directly - this will work if email is already confirmed
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      
      // If error is about email not being confirmed, try to auto-verify
      if (error.message.includes("Email not confirmed")) {
        console.log("Attempting to bypass email verification...");
        
        // Try signup again to trigger auto-verification (in development mode)
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (!signupError) {
          // Try to sign in again immediately - this may work in development with email verification disabled
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!retryError && retryData.user) {
            // Success! User is now logged in
            const userData = mapSupabaseUserToUser(retryData.user);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("sb-last-auth-time", new Date().toISOString());
            
            if (rememberMe) {
              localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
              localStorage.setItem("rememberMe", "true");
            }
            
            toast.success("Login successful!");
            success = true;
            setIsLoading(false);
            return success;
          }
        }
        
        // If we reached here, all attempts failed
        toast.error("Login failed. Try again or contact support.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      } else {
        toast.error(error.message || "An error occurred during login.");
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
