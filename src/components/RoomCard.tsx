import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Room } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
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
    // Fetch booked dates for this specific room when dialog opens
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
  const findNextAvailableDate = (startDate: Date, bookedDates: Date[]): Date => {
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
    const nextAvailableCheckIn = findNextAvailableDate(today, bookedDates);
    
    // Find the nearest available check-out date from the day after the check-in date
    const dayAfterCheckIn = new Date(nextAvailableCheckIn);
    dayAfterCheckIn.setDate(dayAfterCheckIn.getDate() + 1);
    const nextAvailableCheckOut = findNextAvailableDate(dayAfterCheckIn, bookedDates);
    
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
      const nextAvailableDate = findNextAvailableDate(date, bookedDates);
      const formattedDate = format(nextAvailableDate, "yyyy-MM-dd");
      
      if (type === 'check-in') {
        setCheckIn(formattedDate);
        toast.info(`Selected check-in date is booked. Showing next available date: ${format(nextAvailableDate, "MMM dd, yyyy")}`);
        
        // If check-out is before or equal to new check-in, update it too
        const checkOutDate = new Date(checkOut);
        if (nextAvailableDate >= checkOutDate) {
          const nextDay = new Date(nextAvailableDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextAvailableCheckOut = findNextAvailableDate(nextDay, bookedDates);
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
          const nextAvailableCheckOut = findNextAvailableDate(nextDay, bookedDates);
          setCheckOut(format(nextAvailableCheckOut, "yyyy-MM-dd"));
        }
      } else {
        setCheckOut(dateStr);
      }
    }
  };

  return (
    <Card className="room-card overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-hotel-accent text-black">${room.price} / night</Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="text-sm">{room.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{room.amenities.length - 3} more
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">
          {room.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to={`/rooms/${room.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>

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
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
