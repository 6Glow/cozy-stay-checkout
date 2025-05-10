
import React from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EmptyCart from "@/components/cart/EmptyCart";
import CartList from "@/components/cart/CartList";
import CartSummary from "@/components/cart/CartSummary";
import { useCheckoutSession } from "@/hooks/useCheckoutSession";
import { calculateTaxes } from "@/utils/cartUtils";

const Cart = () => {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { 
    isProcessing, 
    processingError, 
    isSessionValid, 
    handleCheckout 
  } = useCheckoutSession();
  
  const handleProceedToCheckout = () => {
    handleCheckout(items, totalPrice);
  };
  
  if (items.length === 0) {
    return <EmptyCart />;
  }
  
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
        
        {!isSessionValid && (
          <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-700">Session Warning</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your session may have expired. <a href="/login?redirect=/cart" className="underline font-medium">Click here to log in again</a> before checking out.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CartList 
            items={items} 
            onRemove={removeFromCart} 
            onClearCart={() => clearCart()}
          />
          
          <div className="lg:col-span-1">
            <CartSummary 
              items={items}
              totalPrice={totalPrice}
              isProcessing={isProcessing}
              user={user}
              onCheckout={handleProceedToCheckout}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
