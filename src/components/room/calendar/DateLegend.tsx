
import React from "react";

const DateLegend = () => {
  return (
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
  );
};

export default DateLegend;
