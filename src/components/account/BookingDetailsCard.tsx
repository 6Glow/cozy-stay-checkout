
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Info } from "lucide-react";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Booking } from "@/types";

interface BookingDetailsCardProps {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
  onModify: () => void;
  onAddToCalendar: () => void;
  onContactSupport: () => void;
}

const BookingDetailsCard: React.FC<BookingDetailsCardProps> = ({
  booking,
  onClose,
  onCancel,
  onModify,
  onAddToCalendar,
  onContactSupport
}) => {
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

  const isBookingActive = !['canceled', 'expired', 'refused', 'failed'].includes(booking.status.toLowerCase());

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{booking.room?.name || `Room #${booking.roomId}`}</CardTitle>
            <CardDescription>
              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({calculateNights(booking.checkIn, booking.checkOut)} nights)
            </CardDescription>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Reservation Details</h4>
            <div className="space-y-1 text-sm">
              <p>Guests: {booking.guests}</p>
              <p>Total: ${booking.totalPrice}</p>
              <p>Booking ID: {booking.id}</p>
              <p>Created: {formatDate(booking.createdAt)}</p>
              {booking.updatedAt && <p>Last Updated: {formatDate(booking.updatedAt)}</p>}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Hotel Information</h4>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>123 Luxury Boulevard, Downtown</span>
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </p>
              <p className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Luxury Hotel Resort & Spa</span>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Included Amenities</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Free Wi-Fi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Breakfast</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Parking</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Gym Access</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Cancellation Policy</h4>
          <div className="text-sm text-muted-foreground">
            <p>• Free cancellation up to 48 hours before check-in.</p>
            <p>• Cancellations within 48 hours of check-in date are subject to a penalty of the first night's charge.</p>
            <p>• No-shows will be charged the full amount of the reservation.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 flex-wrap">
        <Button variant="outline" onClick={onAddToCalendar}>
          <Calendar className="h-4 w-4 mr-1" />
          Add to Calendar
        </Button>
        <Button variant="outline" onClick={onContactSupport}>
          Contact Support
        </Button>
        {isBookingActive && (
          <>
            <Button variant="outline" onClick={onModify}>
              Modify Booking
            </Button>
            <Button variant="destructive" onClick={onCancel}>
              Cancel Booking
            </Button>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </CardFooter>
    </Card>
  );
};

export default BookingDetailsCard;
