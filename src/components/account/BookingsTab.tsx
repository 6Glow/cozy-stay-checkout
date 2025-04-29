
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  MessageSquare,
  Info,
  Filter,
  Clock,
  Edit,
  ChevronDown,
} from "lucide-react";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Booking, Room, PaymentStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { rooms as roomsData } from "@/data/rooms";
import BookingDetailsCard from "@/components/account/BookingDetailsCard";

interface BookingsTabProps {
  userId: string;
}

type SortField = "created_at" | "check_in" | "status";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | PaymentStatus;

const BookingsTab: React.FC<BookingsTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Set up a polling interval for real-time updates
  useEffect(() => {
    fetchUserBookings();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchUserBookings(false); // silent refresh
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId, refreshKey, sortField, sortOrder, filterStatus]);

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
      let query = supabase
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
      
      // Apply status filtering if not "all"
      if (filterStatus !== "all") {
        query = query.eq('status', filterStatus);
      }
      
      // Apply sorting
      const { data, error } = await query.order(sortField, { ascending: sortOrder === 'asc' });
        
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

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    
    setIsCancelling(true);
    try {
      // Update booking status to canceled
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', cancellingBookingId)
        .eq('user_id', userId); // Ensure user can only cancel their own bookings
        
      if (error) throw error;
      
      // Refresh bookings list
      fetchUserBookings();
      toast.success("Your booking has been canceled successfully");
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setCancellingBookingId(null);
    }
  };

  const openCancelDialog = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setShowCancelDialog(true);
  };

  const handleRepayment = (booking: Booking) => {
    // Navigate to cart with some params to pre-fill with this booking
    navigate(`/rooms/${booking.roomId}?repayment=true&bookingId=${booking.id}`);
  };

  const getStatusProgress = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 100;
      case 'open':
        return 50;
      case 'pending':
        return 30;
      case 'expired':
      case 'canceled':
      case 'failed':
      case 'refused':
        return 0;
      default:
        return 0;
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleModifyBooking = (booking: Booking) => {
    // Navigate to room detail page with pre-filled data for modification
    navigate(`/rooms/${booking.roomId}?modify=true&bookingId=${booking.id}`);
  };

  const handleAddToCalendar = (booking: Booking) => {
    if (!booking.room) return;
    
    // Create a Google Calendar event URL (most universally supported)
    const startDate = new Date(booking.checkIn);
    const endDate = new Date(booking.checkOut);
    
    const title = `Stay at ${booking.room.name}`;
    const details = `Your reservation at ${booking.room.name}\nCheck-in: ${formatDate(booking.checkIn)}\nCheck-out: ${formatDate(booking.checkOut)}\nGuests: ${booking.guests}`;
    const location = "Luxury Hotel Resort & Spa";
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/-|:|\.\d+/g, '')}/${endDate.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleContactSupport = () => {
    navigate('/contact', { state: { fromBookings: true } });
  };

  const handleShowOnMap = (roomId: string) => {
    navigate(`/rooms/${roomId}?showMap=true`);
  };

  const toggleSortOrder = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending when changing fields
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>View and manage your bookings</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${filterStatus === 'all' ? 'bg-muted' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${filterStatus === 'paid' ? 'bg-muted' : ''}`}
              onClick={() => setFilterStatus('paid')}
            >
              Paid
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${filterStatus === 'open' ? 'bg-muted' : ''}`}
              onClick={() => setFilterStatus('open')}
            >
              Pending
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleManualRefresh} 
            title="Refresh bookings"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm hover:shadow-md transition duration-200">
                  <CardContent className="p-0">
                    <Collapsible className="w-full">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 py-3 border-b">
                        <div className="flex-1 lg:flex lg:items-center lg:gap-4">
                          <div className="font-medium">
                            {booking.room?.name || `Room #${booking.roomId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({calculateNights(booking.checkIn, booking.checkOut)} nights)
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between lg:justify-end mt-2 lg:mt-0 gap-2">
                          <BookingStatusBadge status={booking.status} />
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Toggle details</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      
                      <CollapsibleContent>
                        <div className="p-4 bg-slate-50">
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Booking Progress</div>
                            <Progress value={getStatusProgress(booking.status)} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="text-sm font-medium">Reservation Details</div>
                              <div className="text-sm mt-1">
                                <div>Guests: {booking.guests}</div>
                                <div>Total: ${booking.totalPrice}</div>
                                <div>Booking ID: {booking.id.substring(0, 8)}...</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium">Hotel Location</div>
                              <div className="text-sm mt-1 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>123 Luxury Boulevard, Downtown</span>
                              </div>
                              <div className="text-sm mt-1 flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                <span>+1 (555) 123-4567</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium">Included Amenities</div>
                              <div className="text-sm mt-1 grid grid-cols-2 gap-x-2">
                                <div>✓ Free Wi-Fi</div>
                                <div>✓ Breakfast</div>
                                <div>✓ Parking</div>
                                <div>✓ Gym Access</div>
                              </div>
                            </div>
                          </div>
                          
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="cancellation-policy">
                              <AccordionTrigger className="text-sm">Cancellation Policy</AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm">
                                  <p className="mb-2">Free cancellation up to 48 hours before check-in.</p>
                                  <p className="mb-2">Cancellations within 48 hours of check-in date are subject to a penalty of the first night's charge.</p>
                                  <p>No-shows will be charged the full amount of the reservation.</p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {['canceled', 'failed', 'expired', 'refused'].includes(booking.status.toLowerCase()) ? (
                              <Button 
                                onClick={() => handleRepayment(booking)} 
                                className="bg-hotel-primary hover:bg-hotel-primary/90"
                              >
                                Book Again
                              </Button>
                            ) : booking.status.toLowerCase() === 'open' ? (
                              <Button 
                                onClick={() => handleRepayment(booking)} 
                                className="bg-hotel-primary hover:bg-hotel-primary/90"
                              >
                                Complete Payment
                              </Button>
                            ) : booking.status.toLowerCase() === 'paid' ? (
                              <Button 
                                onClick={() => openCancelDialog(booking.id)}
                                variant="outline"
                              >
                                Cancel Booking
                              </Button>
                            ) : null}
                            
                            <Button 
                              onClick={() => handleModifyBooking(booking)}
                              variant="outline"
                              disabled={['canceled', 'expired'].includes(booking.status.toLowerCase())}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modify
                            </Button>
                            
                            <Button 
                              onClick={() => handleAddToCalendar(booking)}
                              variant="outline"
                              disabled={['canceled', 'expired'].includes(booking.status.toLowerCase())}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Add to Calendar
                            </Button>
                            
                            <Button 
                              onClick={() => handleShowOnMap(booking.roomId)}
                              variant="outline"
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              View on Map
                            </Button>
                            
                            <Button 
                              onClick={handleContactSupport}
                              variant="outline"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact Support
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
                Please review our cancellation policy.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="text-sm font-medium mb-2">Cancellation Policy:</div>
              <div className="text-sm text-muted-foreground">
                <p>• Free cancellation up to 48 hours before check-in.</p>
                <p>• Cancellations within 48 hours of check-in date are subject to a penalty of the first night's charge.</p>
                <p>• No-shows will be charged the full amount of the reservation.</p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BookingsTab;
