
import React from "react";
import { rooms } from "@/data/rooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomFilters from "@/components/rooms/RoomFilters";
import RoomListing from "@/components/rooms/RoomListing";
import RoomPageHeader from "@/components/rooms/RoomPageHeader";
import useRoomFiltering from "@/hooks/useRoomFiltering";

const Rooms = () => {
  const {
    searchTerm,
    setSearchTerm,
    priceRange,
    setPriceRange,
    capacity,
    setCapacity,
    sortBy,
    setSortBy,
    isFilterVisible,
    sortedRooms,
    clearFilters
  } = useRoomFiltering({ rooms });

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />
      
      <RoomPageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <RoomFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            capacity={capacity}
            setCapacity={setCapacity}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isFilterVisible={isFilterVisible}
          />
          
          <RoomListing 
            sortedRooms={sortedRooms}
            clearFilters={clearFilters}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Rooms;
