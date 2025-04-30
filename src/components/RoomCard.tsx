
import React from "react";
import { Link } from "react-router-dom";
import { Room } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RoomRating from "@/components/room/RoomRating";
import RoomFeatures from "@/components/room/RoomFeatures";
import RoomBookingDialog from "@/components/room/RoomBookingDialog";

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  return (
    <Card className="room-card overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-hotel-accent text-black">${room.price} / night</Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <RoomRating rating={room.rating} />
        </div>
        <RoomFeatures amenities={room.amenities} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">
          {room.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to={`/rooms/${room.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        <RoomBookingDialog room={room} />
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
