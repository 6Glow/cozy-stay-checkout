
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { rooms } from "@/data/rooms";
import RoomCard from "@/components/RoomCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const Rooms = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 600]);
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

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />
      
      <div className="bg-hotel-primary text-white py-16 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-hotel-primary/70 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-gradient-to-r from-white to-gray-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Rooms & Suites
          </motion.h1>
          <motion.p 
            className="text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover our luxurious accommodations designed for your comfort and relaxation
          </motion.p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <motion.div 
            className={`lg:col-span-1 space-y-8 transition-all duration-500 ${isFilterVisible ? 'sticky-filter' : ''}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Filters</h2>
              
              <div className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="search" className="dark:text-gray-200">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label className="dark:text-gray-200">Price Range ($ per night)</Label>
                  <div className="pt-4 px-2">
                    <Slider
                      defaultValue={[0, 600]}
                      min={0}
                      max={600}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm dark:text-gray-300">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="capacity" className="dark:text-gray-200">Guests</Label>
                  <Select value={capacity} onValueChange={setCapacity}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Any number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any number of guests</SelectItem>
                      <SelectItem value="1">1+ guests</SelectItem>
                      <SelectItem value="2">2+ guests</SelectItem>
                      <SelectItem value="3">3+ guests</SelectItem>
                      <SelectItem value="4">4+ guests</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="sortBy" className="dark:text-gray-200">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Recommended" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Guest Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    className="w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange([0, 600]);
                      setCapacity("");
                      setSortBy("recommended");
                    }}
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Room Listings */}
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
            
            <AnimatePresence>
              {sortedRooms.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                >
                  {sortedRooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <RoomCard room={room} />
                    </motion.div>
                  ))}
                </motion.div>
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
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange([0, 600]);
                      setCapacity("");
                    }}
                    className="dark:bg-hotel-primary dark:text-white"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Rooms;
