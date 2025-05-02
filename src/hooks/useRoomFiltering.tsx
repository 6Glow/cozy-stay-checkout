
import { useState, useEffect } from "react";
import { Room } from "@/types";

interface UseRoomFilteringProps {
  rooms: Room[];
}

const useRoomFiltering = ({ rooms }: UseRoomFilteringProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [capacity, setCapacity] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [lastScrollPos, setLastScrollPos] = useState(0);

  // Track scroll position for filter visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsFilterVisible(lastScrollPos > currentScrollPos || currentScrollPos < 50);
      setLastScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPos]);

  // Filter rooms based on search, price, and capacity
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];
    const matchesCapacity = capacity ? room.capacity >= parseInt(capacity) : true;
    
    return matchesSearch && matchesPrice && matchesCapacity;
  });
  
  // Sort rooms based on selected option
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch(sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0; // recommended (default order)
    }
  });

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 600]);
    setCapacity("");
  };

  return {
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
  };
};

export default useRoomFiltering;
