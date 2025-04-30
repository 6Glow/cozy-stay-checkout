
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rooms } from "@/data/rooms";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingCart, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isWithinInterval, parseISO, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const room = rooms.find((r) => r.id === id);
  const { addToCart } = useCart();
  
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [guests, setGuests] = useState(1);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  useEffect(() => {
    if (room) {
      fetchBookedDates();
    }
  }, [room]);
  
  const fetchBookedDates = async () => {
    if (!room) return;
    
    try {
      setIsLoading(true);
      // Modified query to only get bookings for the current room
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('room_id', room.id)
        .in('status', ['pending', 'paid', 'authorized']);
      
      if (error) {
        console.error('Error fetching booked dates:', error);
        return;
      }
      
      // Process the bookings to get all booked dates
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
    } catch (error) {
      console.error('Error in fetchBookedDates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      date.getFullYear() === bookedDate.getFullYear() &&
      date.getMonth() === bookedDate.getMonth() &&
      date.getDate() === bookedDate.getDate()
    );
  };
  
  const handleCheckInChange = (date: Date | undefined) => {
    if (!date) return;
    
    // If the selected date is already booked, don't allow it
    if (isDateBooked(date)) {
      toast.error("This date is already booked");
      return;
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    setCheckIn(formattedDate);
    
    // Reset check-out if it's before check-in
    const checkOutDate = new Date(checkOut);
    if (date > checkOutDate) {
      // Set check-out to the day after check-in
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(format(nextDay, "yyyy-MM-dd"));
    }
  };
  
  const handleCheckOutChange = (date: Date | undefined) => {
    if (!date) return;
    
    // If the selected date is already booked, don't allow it
    if (isDateBooked(date)) {
      toast.error("This date is already booked");
      return;
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    setCheckOut(formattedDate);
  };
  
  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Room not found</h2>
            <p className="mb-4">The room you're looking for doesn't exist or has been removed.</p>
            <Link to="/rooms">
              <Button>Browse All Rooms</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
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
      if (isDateBooked(currentDate)) {
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
  
  // Function to disable booked dates in the calendar
  const isDateDisabled = (date: Date) => {
    return isDateBooked(date);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/rooms" className="text-hotel-secondary hover:underline flex items-center">
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
              className="mr-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Rooms
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="font-medium">{room.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Up to {room.capacity} guests</span>
              </div>
            </div>
            
            <Carousel className="w-full">
              <CarouselContent>
                {room.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[16/9]">
                      <img
                        src={image}
                        alt={`${room.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
            
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="py-4">
                <p className="text-gray-700">{room.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-hotel-primary"
                    >
                      <path d="M2 12h20M2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8M2 12v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M12 2v6M8 4v2M16 4v2" />
                    </svg>
                    <span>King Bed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-hotel-primary"
                    >
                      <path d="M3 3h18M9.7 8c1.1 0 2.3 1.5 2.3 3s-1.2 3-2.3 3H8V8h1.7Z" />
                      <path d="M14.2 8c.4 0 .8.1 1.2.4.5.4.8 1.1.8 1.6 0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6h-1v2h-2V8h3Z" />
                      <path d="M3 21h18" />
                    </svg>
                    <span>{room.capacity} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-hotel-primary"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                    <span>42 m²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-hotel-primary"
                    >
                      <path d="M8 3v3M16 3v3M7 11h10M7 15h10M7 19h10" />
                      <path d="M3 7h18v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
                    </svg>
                    <span>Flexible Cancellation</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="amenities" className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
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
                        className="text-hotel-secondary"
                      >
                        <path d="m9 11-6 6v3h9l3-3" />
                        <path d="m17 5-1 1" />
                        <path d="M20.49 7.63 7.63 20.49a1.79 1.79 0 0 1-2.54 0l-.59-.59a1.79 1.79 0 0 1 0-2.54L17.37 4.49c.45-.45 1.22-.39 1.75.14l1.23 1.23c.54.54.59 1.3.14 1.77Z" />
                      </svg>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="py-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review this room!</p>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Add the availability calendar section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-hotel-primary" />
                Room Availability
              </h2>
              <p className="text-gray-600 mb-4">
                Check the calendar below for room availability. Dates in gray are already booked for this specific room.
              </p>
              <Calendar
                mode="range"
                selected={{
                  from: new Date(checkIn),
                  to: new Date(checkOut),
                }}
                onSelect={(range) => {
                  if (range?.from) {
                    handleCheckInChange(range.from);
                  }
                  if (range?.to) {
                    handleCheckOutChange(range.to);
                  }
                }}
                disabled={[
                  { before: new Date() },
                  isDateDisabled,
                ]}
                numberOfMonths={2}
                className="border rounded-md"
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
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
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RoomDetail;
