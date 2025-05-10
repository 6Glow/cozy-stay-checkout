
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types";
import { formatDate, calculateNights } from "@/utils/cartUtils";

interface CartItemProps {
  item: CartItemType;
  onRemove: (roomId: string) => void;
}

const CartItemComponent = ({ item, onRemove }: CartItemProps) => {
  const nights = calculateNights(item.checkIn, item.checkOut);
  const itemTotal = item.room.price * nights;
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/4">
          <img
            src={item.room.images[0]}
            alt={item.room.name}
            className="w-full h-24 object-cover rounded"
          />
        </div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <div>
              <h3 className="font-semibold text-lg">{item.room.name}</h3>
              <p className="text-gray-600 text-sm">
                {formatDate(item.checkIn)} - {formatDate(item.checkOut)} • {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
              <p className="text-gray-600 text-sm">
                {item.guests} {item.guests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <p className="font-semibold">${itemTotal}</p>
              <p className="text-gray-500 text-sm">${item.room.price} per night</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Link to={`/rooms/${item.room.id}`} className="text-hotel-secondary hover:underline text-sm">
              View Details
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onRemove(item.room.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;
