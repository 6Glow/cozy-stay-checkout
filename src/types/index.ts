
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  amenities: string[];
  rating: number;
}

export interface CartItem {
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  room?: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}
