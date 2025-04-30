
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface RoomHeaderProps {
  name: string;
  rating: number;
  capacity: number;
}

const RoomHeader = ({ name, rating, capacity }: RoomHeaderProps) => {
  return (
    <div>
      <div className="mb-4">
        <Link to="/rooms" className="text-hotel-secondary hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Rooms
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-500"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">Up to {capacity} guests</span>
      </div>
    </div>
  );
};

export default RoomHeader;
