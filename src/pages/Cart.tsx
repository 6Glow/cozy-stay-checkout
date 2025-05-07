
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Check for authenticated user on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.log("No active session detected in Cart");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const handleProceedToCheckout = async () => {
    if (!user) {
      toast.error("Please log in to proceed to checkout");
      localStorage.setItem("checkoutRedirect", "/cart");
      navigate("/login?from=checkout");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      console.log("Checkout initiated for user:", user.id);
      
      // Calculate the price for each item
      const itemsWithTotalPrice = items.map(item => {
        const checkIn = new Date(item.checkIn);
        const checkOut = new Date(item.checkOut);
        const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
        const totalPrice = item.room.price * nights;
        return { ...item, totalPrice };
      });

      const taxes = Math.round(totalPrice * 0.1);
      const grandTotal = totalPrice + taxes;

      // Get current session to ensure we have a fresh token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to verify your session. Please log in again.");
      }
      
      if (!sessionData.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error("Failed to refresh session:", refreshError);
          localStorage.setItem("checkoutRedirect", "/cart");
          toast.error("Your session has expired. Please log in again.");
          navigate("/login?redirect=" + encodeURIComponent("/cart"));
          return;
        }
        
        sessionData.session = refreshData.session;
      }

      const accessToken = sessionData.session.access_token;
      console.log("Using access token:", accessToken ? "Token available" : "No token");
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: grandTotal,
          orderId: `order-${Date.now()}`,
          description: `Hotel Booking - ${items.length} room(s)`,
          redirectUrl: `${window.location.origin}/checkout/success?clearCart=true`,
          items: itemsWithTotalPrice,
          userId: user.id
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (error) {
        console.error("Payment function error:", error);
        
        // Check if the error is related to authentication
        if (error.message?.toLowerCase().includes('auth') || 
            error.message?.toLowerCase().includes('token') ||
            error.message?.toLowerCase().includes('unauthorized')) {
          
          // Try refreshing token one more time
          const { data: refreshResult } = await supabase.auth.refreshSession();
          if (refreshResult.session) {
            toast.info("Retrying payment...");
            
            const { data: retryData, error: retryError } = await supabase.functions.invoke('create-payment', {
              body: {
                amount: grandTotal,
                orderId: `order-${Date.now()}`,
                description: `Hotel Booking - ${items.length} room(s)`,
                redirectUrl: `${window.location.origin}/checkout/success?clearCart=true`,
                items: itemsWithTotalPrice,
                userId: user.id
              },
              headers: {
                Authorization: `Bearer ${refreshResult.session.access_token}`
              }
            });
            
            if (retryError) {
              throw retryError;
            }
            
            if (retryData?.checkoutUrl) {
              // Store the cart items in local storage as a backup
              localStorage.setItem("pendingBooking", JSON.stringify({
                items: itemsWithTotalPrice,
                userId: user.id,
                timestamp: new Date().toISOString()
              }));
              
              // Open the checkout URL directly
              window.location.href = retryData.checkoutUrl;
              return;
            }
          } else {
            throw new Error('Session refresh failed. Please log in again.');
          }
        } else {
          throw error;
        }
      }
      
      if (data?.checkoutUrl) {
        // Store the cart items in local storage as a backup
        localStorage.setItem("pendingBooking", JSON.stringify({
          items: itemsWithTotalPrice,
          userId: user.id,
          timestamp: new Date().toISOString()
        }));
        
        // Open the checkout URL directly
        window.location.href = data.checkoutUrl;
      } else {
        console.error("No checkout URL received:", data);
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (errorMessage.toLowerCase().includes('session') || 
          errorMessage.toLowerCase().includes('auth') || 
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('expired')) {
        localStorage.setItem("checkoutRedirect", "/cart");
        toast.error('Your session has expired. Please log in again.');
        navigate("/login?redirect=" + encodeURIComponent("/cart"));
      } else {
        setProcessingError('Failed to initiate payment. Please try again or contact support.');
        toast.error('Failed to initiate payment. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const calculateNights = (checkIn: string, checkOut: string) => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  if (items.length === 0) {
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
                className="text-gray-400"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any rooms to your cart yet.
            </p>
            <Link to="/rooms">
              <Button className="bg-hotel-primary hover:bg-hotel-primary/90">
                Browse Rooms
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const taxes = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + taxes;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {processingError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {processingError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {items.map((item, index) => {
                const nights = calculateNights(item.checkIn, item.checkOut);
                const itemTotal = item.room.price * nights;
                
                return (
                  <div 
                    key={item.room.id} 
                    className={`p-6 ${index > 0 ? 'border-t' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-1/4">
                        <img
                          src={item.room.images[0]}
                          alt={item.room.name}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.room.name}</h3>
                            <p className="text-gray-600 text-sm">
                              {formatDate(item.checkIn)} - {formatDate(item.checkOut)} • {nights} {nights === 1 ? 'night' : 'nights'}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {item.guests} {item.guests === 1 ? 'guest' : 'guests'}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 text-right">
                            <p className="font-semibold">${itemTotal}</p>
                            <p className="text-gray-500 text-sm">${item.room.price} per night</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <Link to={`/rooms/${item.room.id}`} className="text-hotel-secondary hover:underline text-sm">
                            View Details
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeFromCart(item.room.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Link to="/rooms">
                <Button variant="outline">Continue Booking</Button>
              </Link>
              <Button 
                variant="outline" 
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {items.map((item) => {
                const nights = calculateNights(item.checkIn, item.checkOut);
                const itemTotal = item.room.price * nights;
                
                return (
                  <div key={item.room.id} className="flex justify-between mb-2 text-sm">
                    <span>{item.room.name} ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                    <span>${itemTotal}</span>
                  </div>
                );
              })}
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Taxes & fees (10%)</span>
                  <span>${taxes}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>${grandTotal}</span>
                </div>
              </div>
              
              <Button
                className="w-full mt-6 bg-hotel-primary hover:bg-hotel-primary/90"
                disabled={isProcessing}
                onClick={handleProceedToCheckout}
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </Button>
              
              {!user && (
                <Alert className="mt-4 bg-blue-50 text-blue-800 border-blue-100">
                  <AlertDescription>
                    Please <Link to="/login?redirect=/cart" className="font-medium underline">login</Link> to checkout.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>By proceeding, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
