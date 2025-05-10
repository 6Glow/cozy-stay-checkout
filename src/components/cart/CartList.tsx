
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types";
import CartItemComponent from "./CartItem";

interface CartListProps {
  items: CartItemType[];
  onRemove: (roomId: string) => void;
  onClearCart: () => void;
}

const CartList = ({ items, onRemove, onClearCart }: CartListProps) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {items.map((item, index) => (
          <div 
            key={item.room.id} 
            className={`${index > 0 ? 'border-t' : ''}`}
          >
            <CartItemComponent item={item} onRemove={onRemove} />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between">
        <Link to="/rooms">
          <Button variant="outline">Continue Booking</Button>
        </Link>
        <Button 
          variant="outline" 
          className="text-red-500 border-red-500 hover:bg-red-50"
          onClick={onClearCart}
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default CartList;
