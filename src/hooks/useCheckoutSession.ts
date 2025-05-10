
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CartItem } from '@/types';

export const useCheckoutSession = () => {
  const { user, login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(true);
  const navigate = useNavigate();
  
  // Check for authenticated user and session validity on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsSessionValid(false);
          return;
        }
        
        if (!data.session) {
          console.log("No active session detected in Cart");
          setIsSessionValid(false);
          
          // Check if we can auto-login
          const storedCreds = localStorage.getItem("auth_credentials");
          if (storedCreds) {
            try {
              const { email, password } = JSON.parse(storedCreds);
              const loginSuccess = await login(email, password, true);
              if (loginSuccess) {
                setIsSessionValid(true);
              } else {
                // Clear invalid credentials
                if (localStorage.getItem("rememberMe") !== "true") {
                  localStorage.removeItem("auth_credentials");
                }
              }
            } catch (err) {
              console.error("Auto-login error:", err);
            }
          }
        } else {
          setIsSessionValid(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionValid(false);
      }
    };
    
    checkAuthStatus();
  }, [login]);

  const handleCheckout = async (items: CartItem[], totalPrice: number) => {
    // Reset previous errors
    setProcessingError(null);
    
    // Check session validity first
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error("Your session has expired. Please log in again.");
        localStorage.setItem("checkoutRedirect", "/cart");
        navigate("/login?redirect=" + encodeURIComponent("/cart"));
        return;
      }
    } catch (err) {
      console.error("Session check error:", err);
      toast.error("Failed to verify your session. Please try again.");
      return;
    }
    
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
        // Try to refresh the session
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

      // Store the access token from the refreshed session
      const accessToken = sessionData.session.access_token;
      console.log("Using access token:", accessToken ? "Token available" : "No token");
      
      // Call the payment function with the fresh token
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
          const { data: refreshResult, error: refreshErr } = await supabase.auth.refreshSession();
          
          if (refreshErr || !refreshResult.session) {
            throw new Error('Session refresh failed. Please log in again.');
          }
          
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

  return {
    isSessionValid,
    isProcessing,
    processingError,
    handleCheckout
  };
};
