
import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface DateRangeDisplayProps {
  checkIn: string;
  checkOut: string;
}

const DateRangeDisplay = ({ checkIn, checkOut }: DateRangeDisplayProps) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  const calculateNights = () => {
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <motion.div 
      className="bg-gray-50 dark:bg-gray-800 p-3 mb-4 rounded-md border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
        <div className="w-full md:w-1/2">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-1 text-hotel-primary" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-in</p>
          </div>
          <motion.div 
            className="text-lg font-medium text-hotel-primary"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {format(checkInDate, "MMM dd, yyyy")}
          </motion.div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-1 text-hotel-secondary" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-out</p>
          </div>
          <motion.div 
            className="text-lg font-medium text-hotel-secondary"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            {format(checkOutDate, "MMM dd, yyyy")}
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-center text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        Stay duration: <span className="font-medium">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</span>
      </motion.div>
    </motion.div>
  );
};

export default DateRangeDisplay;
