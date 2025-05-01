
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { CheckCircle } from "lucide-react";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  
  useEffect(() => {
    // Clear the cart when checkout is successful
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('clearCart') === 'true') {
      clearCart(true); // Silent clear without toast notification
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We have sent the confirmation details to your email.
            Your room is now reserved for your selected dates.
          </p>
          <div className="space-y-4">
            <Link to="/account">
              <Button 
                className="w-full bg-hotel-primary hover:bg-hotel-primary/90"
              >
                View My Bookings
              </Button>
            </Link>
            <Link to="/rooms">
              <Button 
                variant="outline" 
                className="w-full"
              >
                Browse More Rooms
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
