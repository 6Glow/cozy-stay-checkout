
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/types";

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const calculateNights = (checkIn: string, checkOut: string) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateItemTotal = (price: number, checkIn: string, checkOut: string) => {
  const nights = calculateNights(checkIn, checkOut);
  return price * nights;
};

export const calculateTaxes = (totalPrice: number) => {
  return Math.round(totalPrice * 0.1);
};

export const calculateGrandTotal = (totalPrice: number) => {
  const taxes = calculateTaxes(totalPrice);
  return totalPrice + taxes;
};

export const handleInitiateCheckout = (
  user: any, 
  items: CartItem[], 
  navigate: ReturnType<typeof useNavigate>
) => {
  if (!user) {
    toast.error("Please log in to proceed to checkout");
    localStorage.setItem("checkoutRedirect", "/cart");
    navigate("/login?from=checkout");
    return false;
  }
  
  if (items.length === 0) {
    toast.error("Your cart is empty");
    return false;
  }
  
  return true;
};
