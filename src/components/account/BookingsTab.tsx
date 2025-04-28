
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Booking, Room } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingsTabProps {
  userId: string;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, [userId]);

  const fetchUserBookings = async () => {
    if (!userId) return;
    
    setIsLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          room_id,
          check_in,
          check_out,
          guests,
          total_price,
          payment_id,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Fetch room details for each booking
      const bookingsWithRoomDetails = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', booking.room_id)
            .single();
            
          if (roomError && roomError.code !== 'PGRST116') {
            console.error('Error fetching room data:', roomError);
          }
          
          const bookingWithRoom: Booking = {
            id: booking.id,
            userId: booking.user_id,
            roomId: booking.room_id,
            room: roomData as Room | undefined,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            guests: booking.guests,
            totalPrice: booking.total_price,
            status: booking.status || '',
            paymentId: booking.payment_id,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at
          };
          
          return bookingWithRoom;
        })
      );
      
      setBookings(bookingsWithRoomDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
        <CardDescription>View and manage your bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingBookings ? (
          <div className="py-8 text-center text-gray-500">
            <p>Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>You don't have any bookings yet.</p>
            <Button 
              className="mt-4 bg-hotel-primary hover:bg-hotel-primary/90"
              onClick={() => navigate("/rooms")}
            >
              Browse Rooms
            </Button>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your recent bookings.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.room?.name || 'Room #' + booking.roomId}</TableCell>
                  <TableCell>
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </TableCell>
                  <TableCell>{booking.guests}</TableCell>
                  <TableCell>${booking.totalPrice}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsTab;
