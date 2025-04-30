
import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ShoppingCart, CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RoomBookingFormProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  handleCheckInChange: (date: Date) => void;
  handleCheckOutChange: (date: Date) => void;
  isDateDisabled: (date: Date) => boolean;
  isLoading: boolean;
}

const RoomBookingForm = ({
  room,
  checkIn,
  checkOut,
  handleCheckInChange,
  handleCheckOutChange,
  isDateDisabled,
  isLoading,
}: RoomBookingFormProps) => {
  const { addToCart } = useCart();
  const [guests, setGuests] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calculate number of nights and total price
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalPrice = room.price * nights;

  const handleAddToCart = () => {
    // Check if the selected dates are available
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    // Check each day in the range to see if any are booked
    let currentDate = new Date(start);
    let isAvailable = true;
    
    while (currentDate <= end) {
      if (isDateDisabled(currentDate)) {
        isAvailable = false;
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (!isAvailable) {
      toast.error("Selected dates are not available. Please choose different dates.");
      return;
    }
    
    addToCart(room, checkIn, checkOut, guests);
    toast.success(`${room.name} added to cart for ${format(new Date(checkIn), "MMM dd, yyyy")} to ${format(new Date(checkOut), "MMM dd, yyyy")}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-2xl font-bold">${room.price}</span>
          <span className="text-gray-500"> / night</span>
        </div>
        <Badge className="bg-hotel-accent text-black">Best Rate</Badge>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="check-in">Check-in</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(new Date(checkIn), "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(checkIn)}
                  onSelect={(date) => {
                    if (date) {
                      handleCheckInChange(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  disabled={[
                    { before: new Date() },
                    isDateDisabled,
                  ]}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-out">Check-out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(new Date(checkOut), "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(checkOut)}
                  onSelect={(date) => {
                    if (date) handleCheckOutChange(date);
                  }}
                  disabled={[
                    { before: addDays(new Date(checkIn), 1) },
                    isDateDisabled,
                  ]}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={room.capacity}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
          />
          <p className="text-xs text-gray-500">
            Max capacity: {room.capacity} guests
          </p>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">${room.price} x {nights} {nights === 1 ? "night" : "nights"}</span>
            <span>${totalPrice}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Taxes & fees</span>
            <span>${Math.round(totalPrice * 0.1)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>${totalPrice + Math.round(totalPrice * 0.1)}</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-hotel-primary hover:bg-hotel-primary/90"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RoomBookingForm;
