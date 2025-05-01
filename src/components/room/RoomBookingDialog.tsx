import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RoomBookingDialogProps {
  room: Room;
}

const RoomBookingDialog = ({ room }: RoomBookingDialogProps) => {
  const { addToCart } = useCart();
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [guests, setGuests] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      fetchBookedDates();
    }
  }, [isDialogOpen, room.id]);

  const fetchBookedDates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('room_id', room.id)
        .in('status', ['pending', 'paid', 'authorized']);
      
      if (error) {
        console.error('Error fetching booked dates:', error);
        return;
      }
      
      // Process the bookings to get all booked dates for this room
      const allBookedDates: Date[] = [];
      
      if (data) {
        data.forEach(booking => {
          const checkInDate = new Date(booking.check_in);
          const checkOutDate = new Date(booking.check_out);
          
          // Add all dates between check-in and check-out to the booked dates array
          let currentDate = new Date(checkInDate);
          
          while (currentDate <= checkOutDate) {
            allBookedDates.push(new Date(currentDate));
            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
      }
      
      setBookedDates(allBookedDates);
      
      // After fetching the booked dates, set the initial check-in and check-out dates
      // to the nearest available dates
      setInitialAvailableDates(allBookedDates);
      
    } catch (error) {
      console.error('Error in fetchBookedDates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Find the nearest available date starting from a given date
  const findNextAvailableDate = (startDate: Date): Date => {
    let currentDate = new Date(startDate);
    
    // Keep incrementing the date until we find one that's not booked
    while (isDateBooked(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return currentDate;
  };
  
  // Set initial check-in and check-out dates to the nearest available dates
  const setInitialAvailableDates = (bookedDates: Date[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the nearest available check-in date from today
    const nextAvailableCheckIn = findNextAvailableDate(today);
    
    // Find the nearest available check-out date from the day after the check-in date
    const dayAfterCheckIn = new Date(nextAvailableCheckIn);
    dayAfterCheckIn.setDate(dayAfterCheckIn.getDate() + 1);
    const nextAvailableCheckOut = findNextAvailableDate(dayAfterCheckIn);
    
    setCheckIn(format(nextAvailableCheckIn, "yyyy-MM-dd"));
    setCheckOut(format(nextAvailableCheckOut, "yyyy-MM-dd"));
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      date.getFullYear() === bookedDate.getFullYear() &&
      date.getMonth() === bookedDate.getMonth() &&
      date.getDate() === bookedDate.getDate()
    );
  };

  const checkDateRangeAvailability = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      if (isDateBooked(currentDate)) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return true;
  };

  const handleAddToCart = () => {
    // Check if the selected dates are available for this specific room
    if (!checkDateRangeAvailability(checkIn, checkOut)) {
      toast.error("Selected dates are not available for this room. Please choose different dates.");
      return;
    }

    addToCart(room, checkIn, checkOut, guests);
    setIsDialogOpen(false);
    toast.success(`${room.name} added to cart for ${format(new Date(checkIn), "MMM dd, yyyy")} to ${format(new Date(checkOut), "MMM dd, yyyy")}`);
  };

  // Handle date change with automatic selection of next available date
  const handleDateChange = (type: 'check-in' | 'check-out', dateStr: string) => {
    const date = new Date(dateStr);
    
    // If the selected date is already booked, find the next available date
    if (isDateBooked(date)) {
      const nextAvailableDate = findNextAvailableDate(date);
      const formattedDate = format(nextAvailableDate, "yyyy-MM-dd");
      
      if (type === 'check-in') {
        setCheckIn(formattedDate);
        toast.info(`Selected check-in date is booked. Showing next available date: ${format(nextAvailableDate, "MMM dd, yyyy")}`);
        
        // If check-out is before or equal to new check-in, update it too
        const checkOutDate = new Date(checkOut);
        if (nextAvailableDate >= checkOutDate) {
          const nextDay = new Date(nextAvailableDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextAvailableCheckOut = findNextAvailableDate(nextDay);
          setCheckOut(format(nextAvailableCheckOut, "yyyy-MM-dd"));
        }
      } else {
        setCheckOut(formattedDate);
        toast.info(`Selected check-out date is booked. Showing next available date: ${format(nextAvailableDate, "MMM dd, yyyy")}`);
      }
    } else {
      // Date is available, use it directly
      if (type === 'check-in') {
        setCheckIn(dateStr);
        
        // If check-out is before or equal to new check-in, update it too
        const checkOutDate = new Date(checkOut);
        if (date >= checkOutDate) {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextAvailableCheckOut = findNextAvailableDate(nextDay);
          setCheckOut(format(nextAvailableCheckOut, "yyyy-MM-dd"));
        }
      } else {
        setCheckOut(dateStr);
      }
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-hotel-primary hover:bg-hotel-primary/90">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            Enter your booking details to add this room to your cart.
            {isLoading && " Loading availability..."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-in">Check-in Date</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  handleDateChange('check-in', e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-out">Check-out Date</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                min={
                  new Date(
                    new Date(checkIn).getTime() + 86400000
                  ).toISOString().split("T")[0]
                }
                onChange={(e) => {
                  handleDateChange('check-out', e.target.value);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
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
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddToCart} disabled={isLoading}>
            {isLoading ? "Loading..." : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomBookingDialog;
