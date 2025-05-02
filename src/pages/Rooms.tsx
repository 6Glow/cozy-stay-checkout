
import React from "react";
import { rooms } from "@/data/rooms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomFilters from "@/components/rooms/RoomFilters";
import RoomListing from "@/components/rooms/RoomListing";
import RoomPageHeader from "@/components/rooms/RoomPageHeader";
import ViewToggle from "@/components/rooms/ViewToggle";
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
    currentRooms,
    currentPage,
    setCurrentPage,
    totalPages,
    clearFilters,
    viewMode,
    setViewMode
  } = useRoomFiltering({ rooms });

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />
      
      <RoomPageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        
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
            currentRooms={currentRooms}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            clearFilters={clearFilters}
            viewMode={viewMode}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Rooms;
