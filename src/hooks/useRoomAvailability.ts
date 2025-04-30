import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

interface UseRoomAvailabilityParams {
  roomId: string;
}

export const useRoomAvailability = ({ roomId }: UseRoomAvailabilityParams) => {
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchBookedDates();
    }
  }, [roomId]);

  const fetchBookedDates = async () => {
    try {
      setIsLoading(true);
      // Modified query to only get bookings for the current room
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('room_id', roomId)
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

  const handleCheckInChange = (date: Date) => {
    // If the selected date is already booked, find the next available date
    if (isDateBooked(date)) {
      const nextAvailableDate = findNextAvailableDate(date, bookedDates);
      toast.info(`Selected date is booked. Showing next available date: ${format(nextAvailableDate, "MMM dd, yyyy")}`);
      date = nextAvailableDate;
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    setCheckIn(formattedDate);
    
    // Reset check-out if it's before check-in
    const checkOutDate = new Date(checkOut);
    if (date >= checkOutDate) {
      // Find next available date after check-in
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextAvailableCheckOut = findNextAvailableDate(nextDay, bookedDates);
      setCheckOut(format(nextAvailableCheckOut, "yyyy-MM-dd"));
    }
  };

  const handleCheckOutChange = (date: Date) => {
    // If the selected date is already booked, find the next available date
    if (isDateBooked(date)) {
      const nextAvailableDate = findNextAvailableDate(date, bookedDates);
      toast.info(`Selected date is booked. Showing next available date: ${format(nextAvailableDate, "MMM dd, yyyy")}`);
      date = nextAvailableDate;
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    setCheckOut(formattedDate);
  };

  return {
    checkIn,
    checkOut,
    bookedDates,
    isLoading,
    isDateBooked,
    handleCheckInChange,
    handleCheckOutChange,
    fetchBookedDates,
  };
};
