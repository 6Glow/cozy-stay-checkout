
import React from "react";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";
import RoomCard from "@/components/RoomCard";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import RoomListItem from "./RoomListItem";

interface RoomListingProps {
  sortedRooms: Room[];
  currentRooms: Room[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  clearFilters: () => void;
  viewMode: "grid" | "list";
}

const RoomListing = ({ 
  sortedRooms, 
  currentRooms, 
  currentPage, 
  setCurrentPage, 
  totalPages,
  clearFilters,
  viewMode
}: RoomListingProps) => {
  
  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderPaginationItems = () => {
    const items = [];
    
    // Calculate range of pages to show
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => handlePageClick(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="lg:col-span-3">
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold dark:text-white">
          {sortedRooms.length} {sortedRooms.length === 1 ? "room" : "rooms"} available
        </h2>
      </motion.div>
      
      {sortedRooms.length > 0 ? (
        <>
          <motion.div 
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }
          >
            {currentRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {viewMode === "grid" ? (
                  <RoomCard room={room} />
                ) : (
                  <RoomListItem room={room} />
                )}
              </motion.div>
            ))}
          </motion.div>
          
          {totalPages > 1 && (
            <motion.div 
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 ? handlePageClick(currentPage - 1) : null}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages ? handlePageClick(currentPage + 1) : null}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div 
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border dark:border-gray-700 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium mb-2 dark:text-white">No rooms found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters to find available rooms.
          </p>
          <Button
            onClick={clearFilters}
            className="dark:bg-hotel-primary dark:text-white"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default RoomListing;
