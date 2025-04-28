
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const toastShownRef = useRef(false);
  
  useEffect(() => {
    // Only show toast and clear cart once when component mounts
    if (!toastShownRef.current) {
      clearCart(true); // Pass true to clear cart silently without showing a toast
      toast.success("Payment successful! Thank you for your booking.");
      toastShownRef.current = true;
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          <Link to="/rooms">
            <Button className="bg-hotel-primary hover:bg-hotel-primary/90">
              Continue Browsing
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
