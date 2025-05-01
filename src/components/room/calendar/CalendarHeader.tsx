
import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarDays } from "lucide-react";

const CalendarHeader = () => {
  return (
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
  );
};

export default CalendarHeader;
