
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Room } from "@/types";

interface RoomTabsProps {
  room: Room;
}

const RoomTabs = ({ room }: RoomTabsProps) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="amenities">Amenities</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="py-4">
        <p className="text-gray-700">{room.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-hotel-primary"
            >
              <path d="M2 12h20M2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8M2 12v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M12 2v6M8 4v2M16 4v2" />
            </svg>
            <span>King Bed</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-hotel-primary"
            >
              <path d="M3 3h18M9.7 8c1.1 0 2.3 1.5 2.3 3s-1.2 3-2.3 3H8V8h1.7Z" />
              <path d="M14.2 8c.4 0 .8.1 1.2.4.5.4.8 1.1.8 1.6 0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6h-1v2h-2V8h3Z" />
              <path d="M3 21h18" />
            </svg>
            <span>{room.capacity} Guests</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-hotel-primary"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
            <span>42 m²</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-hotel-primary"
            >
              <path d="M8 3v3M16 3v3M7 11h10M7 15h10M7 19h10" />
              <path d="M3 7h18v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
            </svg>
            <span>Flexible Cancellation</span>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="amenities" className="py-4">
        <div className="grid grid-cols-2 gap-4">
          {room.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2">
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
                className="text-hotel-secondary"
              >
                <path d="m9 11-6 6v3h9l3-3" />
                <path d="m17 5-1 1" />
                <path d="M20.49 7.63 7.63 20.49a1.79 1.79 0 0 1-2.54 0l-.59-.59a1.79 1.79 0 0 1 0-2.54L17.37 4.49c.45-.45 1.22-.39 1.75.14l1.23 1.23c.54.54.59 1.3.14 1.77Z" />
              </svg>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="reviews" className="py-4">
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this room!</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RoomTabs;
