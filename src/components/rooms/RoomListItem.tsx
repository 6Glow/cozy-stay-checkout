
import React from "react";
import { Link } from "react-router-dom";
import { Room } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RoomRating from "@/components/room/RoomRating";
import RoomFeatures from "@/components/room/RoomFeatures";
import RoomBookingDialog from "@/components/room/RoomBookingDialog";
import { motion } from "framer-motion";

interface RoomListItemProps {
  room: Room;
}

const RoomListItem = ({ room }: RoomListItemProps) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 }
      }}
      className="bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative">
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-64 md:h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-hotel-accent text-black">
              ${room.price} / night
            </Badge>
          </div>
        </div>
        
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold dark:text-white">{room.name}</h3>
            <RoomRating rating={room.rating} />
          </div>
          
          <RoomFeatures amenities={room.amenities} />
          
          <p className="text-gray-600 dark:text-gray-300 my-3 flex-grow">
            {room.description}
          </p>
          
          <div className="flex justify-between items-center mt-4">
            <Link to={`/rooms/${room.id}`}>
              <Button 
                variant="outline"
                className="transition-all duration-300 hover:bg-hotel-primary/10 hover:border-hotel-primary dark:hover:bg-hotel-primary/20"
              >
                View Details
              </Button>
            </Link>
            <RoomBookingDialog room={room} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomListItem;
