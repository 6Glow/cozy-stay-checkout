
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Info } from "lucide-react";
import { format, isSameDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <CalendarDays className="mr-2 h-5 w-5 text-hotel-primary" />
          Room Availability
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>
                Dates in gray are already booked. Click on a date to select your
                check-in, then click another date for check-out.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="bg-gray-50 p-3 mb-4 rounded-md border border-gray-100">
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
          <div className="w-full md:w-1/2">
            <p className="text-sm font-medium mb-1 text-gray-700">Check-in</p>
            <div className="text-lg font-medium text-hotel-primary">
              {format(checkInDate, "MMM dd, yyyy")}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-sm font-medium mb-1 text-gray-700">Check-out</p>
            <div className="text-lg font-medium text-hotel-secondary">
              {format(checkOutDate, "MMM dd, yyyy")}
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-gray-100">
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
          className="border-0 rounded-md"
          classNames={{
            day_range_middle: "day-range-middle bg-hotel-accent/20 text-foreground",
            day_selected: "bg-hotel-primary text-primary-foreground hover:bg-hotel-primary hover:text-primary-foreground",
            day_today: "bg-accent/50 text-accent-foreground",
          }}
        />
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-hotel-primary mr-2"></div>
          <span>Check-in</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-hotel-secondary mr-2"></div>
          <span>Check-out</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityCalendar;
