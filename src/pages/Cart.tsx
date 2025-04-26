
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Please log in to proceed to checkout");
      return;
    }
    
    setIsProcessing(true);
    
    // Mock payment process
    setTimeout(() => {
      toast.success("Order placed successfully!");
      clearCart();
      setIsProcessing(false);
      // In a real application, redirect to the payment gateway or confirmation page
    }, 1500);
  };
  
  // Format a date to display as "Apr 26, 2025"
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Calculate nights between two dates
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
  
  // Calculate taxes and total
  const taxes = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + taxes;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
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
