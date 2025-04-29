
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
import { RefreshCw } from "lucide-react";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Booking, Room } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { rooms as roomsData } from "@/data/rooms";

interface BookingsTabProps {
  userId: string;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Set up a polling interval for real-time updates
  useEffect(() => {
    fetchUserBookings();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchUserBookings(false); // silent refresh
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId, refreshKey]);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchUserBookings();
  };

  const fetchUserBookings = async (showLoadingState = true) => {
    if (!userId) return;
    
    if (showLoadingState) {
      setIsLoadingBookings(true);
    }
    
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Map booking data to Booking type with room details
      const bookingsWithRoomDetails = (data || []).map((bookingData): Booking => {
        // Find room in our static data
        const roomDetails = roomsData.find(room => room.id === bookingData.room_id);
        
        const bookingWithRoom: Booking = {
          id: bookingData.id,
          userId: bookingData.user_id,
          roomId: bookingData.room_id,
          room: roomDetails, // Use the room from static data or undefined
          checkIn: bookingData.check_in,
          checkOut: bookingData.check_out,
          guests: bookingData.guests,
          totalPrice: bookingData.total_price,
          status: bookingData.status || '',
          paymentId: bookingData.payment_id,
          createdAt: bookingData.created_at,
          updatedAt: bookingData.updated_at
        };
        
        return bookingWithRoom;
      });
      
      setBookings(bookingsWithRoomDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (showLoadingState) {
        toast.error('Failed to load your bookings');
      }
    } finally {
      if (showLoadingState) {
        setIsLoadingBookings(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>View and manage your bookings</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleManualRefresh} 
          title="Refresh bookings"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
        </Button>
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
                <TableHead>Last Updated</TableHead>
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
                  <TableCell className="text-xs text-gray-500">
                    {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : 'N/A'}
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
