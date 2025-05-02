
import React from "react";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";
import RoomCard from "@/components/RoomCard";
import { motion } from "framer-motion";

interface RoomListingProps {
  sortedRooms: Room[];
  clearFilters: () => void;
}

const RoomListing = ({ sortedRooms, clearFilters }: RoomListingProps) => {
  return (
    <div className="lg:col-span-3">
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold dark:text-white">
          {sortedRooms.length} {sortedRooms.length === 1 ? "room" : "rooms"} available
        </h2>
      </motion.div>
      
      {sortedRooms.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {sortedRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <RoomCard room={room} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border dark:border-gray-700 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium mb-2 dark:text-white">No rooms found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters to find available rooms.
          </p>
          <Button
            onClick={clearFilters}
            className="dark:bg-hotel-primary dark:text-white"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default RoomListing;
