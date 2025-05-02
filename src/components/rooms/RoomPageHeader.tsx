
import React from "react";
import { motion } from "framer-motion";

const RoomPageHeader = () => {
  return (
    <div className="bg-hotel-primary text-white py-16 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-hotel-primary/70 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-gradient-to-r from-white to-gray-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Rooms & Suites
        </motion.h1>
        <motion.p 
          className="text-xl max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Discover our luxurious accommodations designed for your comfort and relaxation
        </motion.p>
      </div>
    </div>
  );
};

export default RoomPageHeader;
