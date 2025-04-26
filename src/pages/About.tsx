
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-hotel-primary mb-8">About CozyStay</h1>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Hotel Exterior"
              className="rounded-lg shadow-lg"
            />
          </div>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Welcome to CozyStay, where luxury meets comfort. Established in 2010, we have been providing exceptional hospitality services to guests from around the world.
            </p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-hotel-primary">Our Mission</h2>
              <p className="text-gray-700">
                To provide our guests with an unforgettable stay experience through personalized service, luxurious accommodations, and attention to every detail.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-hotel-primary">Our Values</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Excellence in service</li>
                <li>Attention to detail</li>
                <li>Sustainable practices</li>
                <li>Guest satisfaction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
