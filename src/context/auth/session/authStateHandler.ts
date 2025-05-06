
import { User } from "@/types";
import { toast } from "sonner";
import { mapSupabaseUserToUser } from "./mappers";

export const handleAuthStateChange = (
  event: string,
  session: any,
  setUser: (user: User | null) => void
) => {
  console.log("Auth state changed:", event);
  
  if (session?.user) {
    const userData = mapSupabaseUserToUser(session.user);
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("sb-last-auth-time", new Date().toISOString());
    
    // If login event, show toast
    if (event === 'SIGNED_IN') {
      toast.success("Login successful!");
    }
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("sb-last-auth-time");
    toast.success("You've been logged out successfully.");
  } else if (event === 'TOKEN_REFRESHED') {
    // Do nothing special here, just log it
    console.log("Auth token refreshed");
  } else if (!session) {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("sb-last-auth-time");
  }
};
