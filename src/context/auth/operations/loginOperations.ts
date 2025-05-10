
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
      
      // Specifically handle the email verification error
      if (error.message.includes("Email not confirmed")) {
        // Check if we can verify the user exists first
        const { data: userExists } = await supabase.auth.admin.getUserByEmail(email);
        
        if (userExists) {
          // Auto-verify the email for better user experience (for demo purposes)
          const { error: verifyError } = await supabase.auth.admin.updateUserById(
            userExists.user.id,
            { email_confirm: true }
          );
          
          if (!verifyError) {
            // Try to log in again after auto-verification
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (!retryError && retryData.user) {
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
        }
        
        toast.error("Please verify your email address before logging in. Check your inbox for a verification email.");
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
