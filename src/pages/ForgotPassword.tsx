
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { forgotPassword, isLoading } = useAuth();

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Forgot your password?</CardTitle>
              <CardDescription className="text-center">
                {isSubmitted
                  ? "Check your email for a reset link"
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>
            {!isSubmitted ? (
              <>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {error && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-hotel-primary hover:bg-hotel-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send reset link"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center">
                    Remember your password?{" "}
                    <Link to="/login" className="text-hotel-secondary hover:underline">
                      Sign in
                    </Link>
                  </div>
                </CardFooter>
              </>
            ) : (
              <CardContent className="pt-2">
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
                  <p>
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions in the email.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-500">
                    Didn't receive an email? Check your spam folder or try again.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Try again
                    </Button>
                    <Link to="/login">
                      <Button>Back to login</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;
