
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  
  useEffect(() => {
    // Clear the cart when checkout is successful
    if (searchParams.get('clearCart') === 'true') {
      clearCart(true); // Silent clear without toast notification
    }

    // Verify the payment status by checking bookings
    const verifyPayment = async () => {
      if (!user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Get the payment ID from local storage if available
        const pendingBooking = localStorage.getItem("pendingBooking");
        if (!pendingBooking) {
          setIsVerifying(false);
          return;
        }

        const pendingData = JSON.parse(pendingBooking);
        
        // Verify booking status in database
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error("Error fetching booking:", error);
        } else if (bookings && bookings.length > 0) {
          setBookingInfo(bookings[0]);
          
          // If booking is successful, clear the pending booking data
          localStorage.removeItem("pendingBooking");
        }
        
        setIsVerifying(false);
      } catch (err) {
        console.error("Error in verification:", err);
        setIsVerifying(false);
      }
    };

    // Delay a bit to allow webhook processing
    const timer = setTimeout(() => {
      verifyPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [clearCart, user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          {isVerifying ? (
            <div className="mb-6 flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-hotel-primary animate-spin" />
              <p className="mt-4 text-gray-600">Verifying your booking...</p>
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We have sent the confirmation details to your email.
            Your room is now reserved for your selected dates.
          </p>
          
          {bookingInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h2 className="font-semibold mb-2">Booking Details:</h2>
              <p><span className="font-medium">Check-in:</span> {new Date(bookingInfo.check_in).toLocaleDateString()}</p>
              <p><span className="font-medium">Check-out:</span> {new Date(bookingInfo.check_out).toLocaleDateString()}</p>
              <p><span className="font-medium">Guests:</span> {bookingInfo.guests}</p>
              <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">{bookingInfo.status}</span></p>
            </div>
          )}
          
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
