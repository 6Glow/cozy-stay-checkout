
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
          {/* Cart */}
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-hotel-accent text-[10px] font-medium text-black">
                {items.length}
              </span>
            )}
          </Link>

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
