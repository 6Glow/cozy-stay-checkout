
import React from "react";
import { useParams, Link } from "react-router-dom";
import { rooms } from "@/data/rooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import RoomHeader from "@/components/room/RoomHeader";
import RoomImageCarousel from "@/components/room/RoomImageCarousel";
import RoomTabs from "@/components/room/RoomTabs";
import RoomAvailabilityCalendar from "@/components/room/RoomAvailabilityCalendar";
import RoomBookingForm from "@/components/room/RoomBookingForm";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const room = rooms.find((r) => r.id === id);

  const {
    checkIn,
    checkOut,
    isLoading,
    isDateBooked,
    handleCheckInChange,
    handleCheckOutChange,
  } = useRoomAvailability({ 
    roomId: id || '' 
  });

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Room not found</h2>
            <p className="mb-4">The room you're looking for doesn't exist or has been removed.</p>
            <Link to="/rooms">
              <Button>Browse All Rooms</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <RoomHeader 
          name={room.name} 
          rating={room.rating} 
          capacity={room.capacity} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RoomImageCarousel 
              images={room.images} 
              roomName={room.name} 
            />
            
            <RoomTabs room={room} />
            
            <RoomAvailabilityCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              handleCheckInChange={handleCheckInChange}
              handleCheckOutChange={handleCheckOutChange}
              isDateDisabled={isDateBooked}
            />
          </div>
          
          <div className="lg:col-span-1">
            <RoomBookingForm
              room={room}
              checkIn={checkIn}
              checkOut={checkOut}
              handleCheckInChange={handleCheckInChange}
              handleCheckOutChange={handleCheckOutChange}
              isDateDisabled={isDateBooked}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RoomDetail;
