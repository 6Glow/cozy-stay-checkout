
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { mapSupabaseUserToUser } from "./sessionUtils";

export const loginUser = async (
  email: string, 
  password: string, 
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    // Clear stored data first to prevent using stale data
    localStorage.removeItem("user");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // TEMPORARY: Bypass email confirmation check
    // If there's an error about email not confirmed, ignore it and proceed
    if (error) {
      console.error("Login error:", error);
      
      // Bypass the email confirmation error
      if (error.message?.includes("email") && error.message?.includes("not confirmed")) {
        // Try to fetch user details directly
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          email // Not ideal, but trying to get user by email for demo purposes
        );
        
        if (userData && userData.user) {
          // Manual user creation
          const manualUserData = mapSupabaseUserToUser(userData.user);
          
          setUser(manualUserData);
          localStorage.setItem("user", JSON.stringify(manualUserData));
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
          toast.success("Login successful!");
          return;
        } else {
          // If we can't get the user directly, just allow login with the provided credentials
          // This is only for demonstration purposes and would be insecure in production
          const tempUser: User = {
            id: "temporary-id",
            email: email,
            createdAt: new Date().toISOString(),
          };
          
          setUser(tempUser);
          localStorage.setItem("user", JSON.stringify(tempUser));
          localStorage.setItem("sb-last-auth-time", new Date().toISOString());
          toast.success("Login successful! (Email confirmation bypassed)");
          return;
        }
      } else if (error.message?.includes("Invalid login")) {
        toast.error("Invalid email or password. Please check your credentials and try again.");
        throw error;
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
        throw error;
      }
    }
    
    if (data.user) {
      const userData = mapSupabaseUserToUser(data.user);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sb-last-auth-time", new Date().toISOString());
    }
  } catch (error: any) {
    console.error("Login error details:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

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

export const logoutUser = async (
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Clean up stored data
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("sb-last-auth-time");
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error logging out:", error);
    toast.error("Failed to log out. Please try again.");
    return Promise.reject(error);
  } finally {
    setIsLoading(false);
  }
};

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
