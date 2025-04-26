
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Room } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (room: Room, checkIn: string, checkOut: string, guests: number) => void;
  removeFromCart: (roomId: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Calculate total price
  const totalPrice = items.reduce((acc, item) => {
    const checkIn = new Date(item.checkIn);
    const checkOut = new Date(item.checkOut);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    return acc + (item.room.price * nights);
  }, 0);
  
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);
  
  const addToCart = (room: Room, checkIn: string, checkOut: string, guests: number) => {
    // Check if room is already in cart
    const existingItemIndex = items.findIndex(item => item.room.id === room.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        checkIn,
        checkOut,
        guests
      };
      setItems(updatedItems);
      toast.success("Booking details updated!");
    } else {
      // Add new item
      setItems([...items, { room, checkIn, checkOut, guests }]);
      toast.success(`${room.name} added to cart!`);
    }
  };
  
  const removeFromCart = (roomId: string) => {
    setItems(items.filter(item => item.room.id !== roomId));
    toast.info("Item removed from cart");
  };
  
  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared");
  };
  
  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    totalPrice
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
