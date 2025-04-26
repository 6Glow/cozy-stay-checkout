
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { rooms } from "@/data/rooms";
import RoomCard from "@/components/RoomCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Rooms = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [capacity, setCapacity] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-hotel-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Rooms & Suites</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover our luxurious accommodations designed for your comfort and relaxation
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Price Range ($ per night)</Label>
                  <div className="pt-4 px-2">
                    <Slider
                      defaultValue={[0, 600]}
                      min={0}
                      max={600}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Guests</Label>
                  <Select value={capacity} onValueChange={setCapacity}>
                    <SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Recommended" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Guest Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  className="w-full"
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
              </div>
            </div>
          </div>
          
          {/* Room Listings */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {sortedRooms.length} {sortedRooms.length === 1 ? "room" : "rooms"} available
              </h2>
            </div>
            
            {sortedRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                <h3 className="text-lg font-medium mb-2">No rooms found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters to find available rooms.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setPriceRange([0, 600]);
                    setCapacity("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Rooms;
