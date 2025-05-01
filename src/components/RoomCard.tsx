
import React from "react";
import { Link } from "react-router-dom";
import { Room } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RoomRating from "@/components/room/RoomRating";
import RoomFeatures from "@/components/room/RoomFeatures";
import RoomBookingDialog from "@/components/room/RoomBookingDialog";
import { motion } from "framer-motion";

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2 }
      }}
    >
      <Card className="room-card overflow-hidden border-transparent dark:border-gray-800 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="aspect-video relative overflow-hidden group">
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-hotel-accent text-black">
              ${room.price} / night
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl dark:text-white">{room.name}</CardTitle>
            <RoomRating rating={room.rating} />
          </div>
          <RoomFeatures amenities={room.amenities} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {room.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link to={`/rooms/${room.id}`}>
            <Button 
              variant="outline"
              className="transition-all duration-300 hover:bg-hotel-primary/10 hover:border-hotel-primary dark:hover:bg-hotel-primary/20"
            >
              View Details
            </Button>
          </Link>
          <RoomBookingDialog room={room} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RoomCard;
