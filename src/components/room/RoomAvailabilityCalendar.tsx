
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";

interface RoomAvailabilityCalendarProps {
  checkIn: string;
  checkOut: string;
  handleCheckInChange: (date: Date) => void;
  handleCheckOutChange: (date: Date) => void;
  isDateDisabled: (date: Date) => boolean;
}

const RoomAvailabilityCalendar = ({
  checkIn,
  checkOut,
  handleCheckInChange,
  handleCheckOutChange,
  isDateDisabled,
}: RoomAvailabilityCalendarProps) => {
  return (
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
  );
};

export default RoomAvailabilityCalendar;
