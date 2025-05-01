
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { rooms } from "@/data/rooms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";

const FeaturedRooms = () => {
  // Take 3 highest-rated rooms
  const featuredRooms = [...rooms]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
    
  // For controlling animation
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  // Start animations when section comes into view
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  // Custom cursor position
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorActive, setCursorActive] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setCursorPos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };
  
  return (
    <section 
      className="py-16 md:py-24 relative overflow-hidden featured-room-section"
      ref={ref} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setCursorActive(true)}
      onMouseLeave={() => setCursorActive(false)}
    >
      {/* Custom cursor */}
      <motion.div 
        className="absolute w-12 h-12 pointer-events-none rounded-full mix-blend-difference z-40"
        style={{
          backgroundColor: "rgba(212, 175, 55, 0.3)",
          backdropFilter: "blur(4px)",
          border: "2px solid #D4AF37",
        }}
        animate={{
          x: cursorPos.x - 24,
          y: cursorPos.y - 24,
          scale: cursorActive ? 1 : 0,
          opacity: cursorActive ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Background decoration elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -right-20 top-20 w-64 h-64 rounded-full bg-hotel-accent/10 blur-3xl"
          animate={{ 
            y: [0, 30, 0], 
            opacity: [0.4, 0.6, 0.4] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -left-20 bottom-20 w-80 h-80 rounded-full bg-hotel-primary/10 blur-3xl"
          animate={{ 
            y: [0, -40, 0], 
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { duration: 0.6 } 
            }
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-gradient dark:text-white">
            Featured Accommodations
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Discover our most popular and highly-rated rooms, designed for an unforgettable stay experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room, i) => (
            <motion.div
              key={room.id}
              className="featured-room-card relative group"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { duration: 0.6, delay: i * 0.2 } 
                }
              }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="relative overflow-hidden rounded-lg aspect-[3/4] shadow-lg">
                {/* Parallax image effect */}
                <motion.div 
                  className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                >
                  <img 
                    src={room.images[0]} 
                    alt={room.name}
                    className="absolute w-full h-full object-cover"
                    style={{ filter: "brightness(0.85)" }}
                  />
                </motion.div>
                
                {/* Overlay with decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
                <div className="absolute top-4 left-4 flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx}
                      className={`w-4 h-4 ${idx < Math.floor(room.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill={idx < Math.floor(room.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-hotel-accent text-black">
                    ${room.price} / night
                  </Badge>
                </div>
                
                {/* Decorative graphic element */}
                <svg 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-white/10 group-hover:text-white/20 transition-colors duration-500" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1" />
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1" />
                </svg>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.h3 
                    className="text-xl md:text-2xl font-serif font-bold mb-2 group-hover:text-hotel-accent transition-colors"
                    whileHover={{ x: 10 }}
                  >
                    {room.name}
                  </motion.h3>
                  <p className="text-sm text-gray-200 line-clamp-2 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    {room.description.substring(0, 100)}...
                  </p>
                  <Link to={`/rooms/${room.id}`} className="group-hover:opacity-100 opacity-90 transition-opacity">
                    <Button 
                      variant="outline"
                      className="backdrop-blur-sm border-white text-white hover:bg-white/20"
                    >
                      <span>View Details</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <motion.div 
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0, 
                transition: { duration: 0.6, delay: 0.6 } 
              }
            }}
          >
            <Link to="/rooms">
              <Button 
                size="lg" 
                className="bg-hotel-primary hover:bg-hotel-primary/90 dark:bg-hotel-accent dark:text-black dark:hover:bg-hotel-accent/90"
              >
                View All Rooms
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
