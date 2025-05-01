
import React from "react";
import { motion } from "framer-motion";

const DateLegend = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div className="flex items-center" variants={itemVariants}>
        <div className="w-3 h-3 rounded-full bg-hotel-primary mr-2"></div>
        <span>Check-in</span>
      </motion.div>
      <motion.div className="flex items-center" variants={itemVariants}>
        <div className="w-3 h-3 rounded-full bg-hotel-secondary mr-2"></div>
        <span>Check-out</span>
      </motion.div>
      <motion.div className="flex items-center" variants={itemVariants}>
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
        <span>Booked</span>
      </motion.div>
    </motion.div>
  );
};

export default DateLegend;
