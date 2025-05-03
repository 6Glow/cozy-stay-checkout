
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;
  
  // Custom day rendering to show booked dates with a different style
  const renderDay = (day: Date) => {
    const isBooked = isDateDisabled(day);
    const isCheckIn = checkInDate ? isSameDay(day, checkInDate) : false;
    const isCheckOut = checkOutDate ? isSameDay(day, checkOutDate) : false;
    const isHovered = hoveredDate ? isSameDay(day, hoveredDate) : false;
    const isToday = isSameDay(day, new Date());
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full h-full flex items-center justify-center rounded-md transition-colors calendar-day-hover",
                isBooked && "bg-gray-200 cursor-not-allowed",
                isCheckIn && "bg-hotel-primary text-white",
                isCheckOut && "bg-hotel-secondary text-white",
                isHovered && !isBooked && !isCheckIn && !isCheckOut && "bg-hotel-accent/20",
                isToday && !isCheckIn && !isCheckOut && "ring-2 ring-hotel-accent/50",
              )}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span>{day.getDate()}</span>
              {isBooked && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isCheckIn && "Check-in date"}
            {isCheckOut && "Check-out date"}
            {isBooked && "Unavailable"}
            {!isCheckIn && !isCheckOut && !isBooked && "Available"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <motion.div 
      className="rounded-lg overflow-hidden border border-gray-100 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Calendar
        mode="range"
        selected={checkIn && checkOut ? {
          from: new Date(checkIn),
          to: new Date(checkOut),
        } : undefined}
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
        className="border-0 rounded-md pointer-events-auto"
        classNames={{
          day_range_middle: "day-range-middle bg-hotel-accent/20 text-foreground",
          day_selected: "bg-hotel-primary text-primary-foreground hover:bg-hotel-primary hover:text-primary-foreground",
          day_today: "bg-accent/50 text-accent-foreground",
        }}
        components={{
          Day: ({ date, ...props }) => renderDay(date),
        }}
      />
    </motion.div>
  );
};

export default CalendarDisplay;
