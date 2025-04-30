
import React from "react";

interface RoomRatingProps {
  rating: number;
}

const RoomRating = ({ rating }: RoomRatingProps) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
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
        className="text-yellow-500"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span className="text-sm">{rating.toFixed(1)}</span>
    </div>
  );
};

export default RoomRating;
