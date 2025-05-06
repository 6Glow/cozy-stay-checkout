
import { User } from "@/types";

export const mapSupabaseUserToUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    firstName: supabaseUser.user_metadata?.firstName || "",
    lastName: supabaseUser.user_metadata?.lastName || "",
    phone: supabaseUser.user_metadata?.phone || "",
    createdAt: supabaseUser.created_at,
  };
};
