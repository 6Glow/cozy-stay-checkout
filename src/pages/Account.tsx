
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProfileTab from "@/components/account/ProfileTab";
import BookingsTab from "@/components/account/BookingsTab";
import SecurityTab from "@/components/account/SecurityTab";

const Account = () => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      await logout();
      navigate("/");
      toast.success("Your account has been deleted successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
      return Promise.reject(error);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 mb-4 w-full max-w-md">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <ProfileTab 
                user={user} 
                updateProfile={updateProfile} 
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="bookings">
              <BookingsTab userId={user.id} />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityTab 
                logout={logout}
                handleDeleteAccount={handleDeleteAccount}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Account;
