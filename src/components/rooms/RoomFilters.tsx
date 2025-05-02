
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface RoomFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  capacity: string;
  setCapacity: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  isFilterVisible: boolean;
}

const RoomFilters = ({
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  capacity,
  setCapacity,
  sortBy,
  setSortBy,
  isFilterVisible,
}: RoomFiltersProps) => {
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 600]);
    setCapacity("any");
    setSortBy("recommended");
  };

  return (
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
                <SelectItem value="any">Any number of guests</SelectItem>
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
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomFilters;
