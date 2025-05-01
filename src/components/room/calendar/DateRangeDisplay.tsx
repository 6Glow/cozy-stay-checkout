
import React from "react";
import { format } from "date-fns";

interface DateRangeDisplayProps {
  checkIn: string;
  checkOut: string;
}

const DateRangeDisplay = ({ checkIn, checkOut }: DateRangeDisplayProps) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  return (
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
  );
};

export default DateRangeDisplay;
