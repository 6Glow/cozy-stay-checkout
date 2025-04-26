
import { Room } from "@/types";

export const rooms: Room[] = [
  {
    id: "1",
    name: "Deluxe King Room",
    description: "Spacious room with a king-sized bed, featuring city views, a work desk, and a modern bathroom with premium amenities.",
    price: 189,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ],
    amenities: [
      "King Bed",
      "City View",
      "Free WiFi",
      "Smart TV",
      "Mini Fridge",
      "Coffee Maker",
      "Work Desk",
      "Air Conditioning"
    ],
    rating: 4.8
  },
  {
    id: "2",
    name: "Executive Suite",
    description: "Luxurious suite featuring a separate living area, premium bedding, an oversized soaking tub, and panoramic views of the city skyline.",
    price: 329,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1568495248636-6432b97bd949?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ],
    amenities: [
      "King Bed",
      "Separate Living Area",
      "Panoramic Views",
      "Premium Bedding",
      "Oversized Soaking Tub",
      "Free WiFi",
      "Smart TV",
      "Mini Bar",
      "Coffee Maker",
      "Work Desk",
      "Air Conditioning",
      "Bathrobe & Slippers"
    ],
    rating: 4.9
  },
  {
    id: "3",
    name: "Twin Room",
    description: "Comfortable room with two twin beds, ideal for friends or colleagues traveling together.",
    price: 149,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ],
    amenities: [
      "Two Twin Beds",
      "Garden View",
      "Free WiFi",
      "Smart TV",
      "Coffee Maker",
      "Work Desk",
      "Air Conditioning"
    ],
    rating: 4.6
  },
  {
    id: "4",
    name: "Family Suite",
    description: "Spacious suite with a king bed in the main bedroom and a sofa bed in the living area, perfect for families.",
    price: 269,
    capacity: 4,
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1594560913095-8cf34bae6e29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ],
    amenities: [
      "King Bed",
      "Sofa Bed",
      "Separate Living Area",
      "Two Bathrooms",
      "Free WiFi",
      "Smart TV",
      "Mini Fridge",
      "Coffee Maker",
      "Dining Area",
      "Air Conditioning"
    ],
    rating: 4.7
  },
  {
    id: "5",
    name: "Penthouse Suite",
    description: "Our most luxurious accommodation featuring a spacious layout with premium furnishings, a private terrace, and breathtaking views.",
    price: 599,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1551105378-78e609e1d468?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ],
    amenities: [
      "King Bed",
      "Private Terrace",
      "Premium Furnishings",
      "Panoramic Views",
      "Separate Living & Dining Areas",
      "Full Kitchen",
      "Jacuzzi",
      "Free WiFi",
      "Smart Home System",
      "Premium Entertainment System",
      "Mini Bar",
      "Coffee Maker",
      "Bathrobe & Slippers",
      "Concierge Service"
    ],
    rating: 5.0
  },
  {
    id: "6",
    name: "Standard Queen Room",
    description: "Cozy room with a queen bed, perfect for solo travelers or couples seeking comfort without the extra space.",
    price: 129,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1568495248636-6432b97bd949?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ],
    amenities: [
      "Queen Bed",
      "Free WiFi",
      "Smart TV",
      "Coffee Maker",
      "Work Desk",
      "Air Conditioning"
    ],
    rating: 4.5
  }
];
