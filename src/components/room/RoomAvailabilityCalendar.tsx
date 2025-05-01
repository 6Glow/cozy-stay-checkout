
import React from "react";
import CalendarHeader from "./calendar/CalendarHeader";
import DateRangeDisplay from "./calendar/DateRangeDisplay";
import CalendarDisplay from "./calendar/CalendarDisplay";
import DateLegend from "./calendar/DateLegend";

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
  
  const handleRangeSelect = (range: { from: Date; to: Date | undefined }) => {
    if (range.from) {
      handleCheckInChange(range.from);
    }
    if (range.to) {
      handleCheckOutChange(range.to);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <CalendarHeader />
      <DateRangeDisplay checkIn={checkIn} checkOut={checkOut} />
      <CalendarDisplay 
        checkIn={checkIn} 
        checkOut={checkOut} 
        onSelect={handleRangeSelect} 
        isDateDisabled={isDateDisabled} 
      />
      <DateLegend />
    </div>
  );
};

export default RoomAvailabilityCalendar;
