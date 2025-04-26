
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rooms } from "@/data/rooms";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingCart } from "lucide-react";

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const room = rooms.find((r) => r.id === id);
  const { addToCart } = useCart();
  
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [guests, setGuests] = useState(1);
  
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
  
  // Calculate number of nights and total price
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalPrice = room.price * nights;

  const handleAddToCart = () => {
    addToCart(room, checkIn, checkOut, guests);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/rooms" className="text-hotel-secondary hover:underline flex items-center">
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
              className="mr-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Rooms
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="font-medium">{room.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Up to {room.capacity} guests</span>
              </div>
            </div>
            
            <Carousel className="w-full">
              <CarouselContent>
                {room.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[16/9]">
                      <img
                        src={image}
                        alt={`${room.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
            
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
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-bold">${room.price}</span>
                  <span className="text-gray-500"> / night</span>
                </div>
                <Badge className="bg-hotel-accent text-black">Best Rate</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="check-in">Check-in</Label>
                    <Input
                      id="check-in"
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check-out">Check-out</Label>
                    <Input
                      id="check-out"
                      type="date"
                      value={checkOut}
                      min={
                        new Date(
                          new Date(checkIn).getTime() + 86400000
                        ).toISOString().split("T")[0]
                      }
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Max capacity: {room.capacity} guests
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">${room.price} x {nights} {nights === 1 ? "night" : "nights"}</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Taxes & fees</span>
                    <span>${Math.round(totalPrice * 0.1)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${totalPrice + Math.round(totalPrice * 0.1)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-hotel-primary hover:bg-hotel-primary/90"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RoomDetail;
