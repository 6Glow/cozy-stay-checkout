
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Menu, User, ShoppingCart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-hotel-primary to-hotel-secondary bg-clip-text text-transparent">
            CozyStay
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-hotel-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/rooms"
            className="text-sm font-medium text-gray-700 hover:text-hotel-primary transition-colors"
          >
            Rooms
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-gray-700 hover:text-hotel-primary transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-gray-700 hover:text-hotel-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Cart with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-hotel-accent text-[10px] font-medium text-black">
                    {items.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Your Cart</h3>
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500">Your cart is empty</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.room.id} className="flex items-center gap-3 text-sm">
                        <img 
                          src={item.room.images[0]} 
                          alt={item.room.name} 
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.room.name}</p>
                          <p className="text-xs text-gray-500">${item.room.price}/night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t">
                  <Link to="/cart">
                    <Button className="w-full bg-hotel-primary hover:bg-hotel-primary/90">
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/account">
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{user.firstName || user.email}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-hotel-primary text-hotel-primary hover:bg-hotel-primary/5"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-hotel-primary hover:bg-hotel-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-hotel-primary">CozyStay</SheetTitle>
                <SheetDescription>Luxury at your fingertips</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-6">
                <Link
                  to="/"
                  className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/rooms"
                  className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Rooms
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="border-t my-2"></div>
                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      className="px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
