
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CartItem } from "@/types";
import { calculateNights, calculateTaxes } from "@/utils/cartUtils";

interface CartSummaryProps {
  items: CartItem[];
  totalPrice: number;
  isProcessing: boolean;
  user: any;
  onCheckout: () => void;
}

const CartSummary = ({ 
  items, 
  totalPrice, 
  isProcessing, 
  user, 
  onCheckout 
}: CartSummaryProps) => {
  const taxes = calculateTaxes(totalPrice);
  const grandTotal = totalPrice + taxes;
  
  return (
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
        onClick={onCheckout}
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
  );
};

export default CartSummary;
