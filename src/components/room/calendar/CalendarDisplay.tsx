
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarDisplayProps {
  checkIn: string;
  checkOut: string;
  onSelect: (range: { from: Date; to: Date | undefined }) => void;
  isDateDisabled: (date: Date) => boolean;
}

const CalendarDisplay = ({ 
  checkIn, 
  checkOut, 
  onSelect, 
  isDateDisabled 
}: CalendarDisplayProps) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Custom day rendering to show booked dates with a different style
  const renderDay = (day: Date) => {
    const isBooked = isDateDisabled(day);
    const isCheckIn = isSameDay(day, checkInDate);
    const isCheckOut = isSameDay(day, checkOutDate);
    const isHovered = hoveredDate ? isSameDay(day, hoveredDate) : false;
    
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center rounded-md transition-colors",
          isBooked && "bg-gray-100",
          isCheckIn && "bg-hotel-primary text-white",
          isCheckOut && "bg-hotel-secondary text-white",
          isHovered && !isBooked && !isCheckIn && !isCheckOut && "bg-hotel-accent/20",
        )}
        onMouseEnter={() => setHoveredDate(day)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {day.getDate()}
        {isBooked && (
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-400 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-100">
      <Calendar
        mode="range"
        selected={{
          from: new Date(checkIn),
          to: new Date(checkOut),
        }}
        onSelect={(range) => {
          if (range?.from) {
            onSelect({
              from: range.from, 
              to: range.to
            });
          }
        }}
        disabled={[
          { before: new Date() },
          isDateDisabled,
        ]}
        numberOfMonths={2}
        className="border-0 rounded-md"
        classNames={{
          day_range_middle: "day-range-middle bg-hotel-accent/20 text-foreground",
          day_selected: "bg-hotel-primary text-primary-foreground hover:bg-hotel-primary hover:text-primary-foreground",
          day_today: "bg-accent/50 text-accent-foreground",
        }}
      />
    </div>
  );
};

export default CalendarDisplay;
