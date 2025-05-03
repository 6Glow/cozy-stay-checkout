import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MailIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear errors when inputs change
  useEffect(() => {
    setErrors({});
    setAuthError(null);
  }, [email, password]);

  // Check for redirect parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectFrom = params.get('from');
    const errorMsg = params.get('error');
    
    if (errorMsg) {
      setAuthError(decodeURIComponent(errorMsg));
    }
    
    if (redirectFrom === 'checkout') {
      setAuthError("You need to be logged in to complete your purchase. Please log in and try again.");
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendConfirmation = async () => {
    try {
      setIsResendingConfirmation(true);
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.auth.resend({
        type: 'signup',
        email
      });
      toast.success("Confirmation email sent. Please check your inbox.");
      setAuthError("Confirmation email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      setAuthError("Failed to send confirmation email. Please try again.");
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  // Modify handleSubmit to handle redirect back to cart
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setAuthError(null);
    setIsEmailNotConfirmed(false);
    
    try {
      await login(email, password);
      
      // Check for a redirect URL in the query params or localStorage
      const params = new URLSearchParams(location.search);
      const redirectUrl = params.get('redirect');
      const storedRedirect = localStorage.getItem("checkoutRedirect");
      
      // Clear the stored redirect
      localStorage.removeItem("checkoutRedirect");
      
      // First priority: checkout redirect from localStorage
      if (storedRedirect) {
        navigate(storedRedirect);
      } 
      // Second priority: URL parameter redirect
      else if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));
      } 
      // Default redirect to home
      else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error?.message?.includes("Email not confirmed") || error?.code === "email_not_confirmed") {
        setIsEmailNotConfirmed(true);
      } else if (error?.message?.includes("Invalid login credentials")) {
        setAuthError("Invalid email or password. Please check your credentials and try again.");
      } else {
        setAuthError(error?.message || "Failed to login. Please check your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              
              {isEmailNotConfirmed && (
                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                  <MailIcon className="h-4 w-4 mr-2" />
                  <AlertDescription className="flex flex-col">
                    <span>Email not confirmed. Please check your inbox for a confirmation link.</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-amber-800 underline justify-start"
                      onClick={handleResendConfirmation}
                      disabled={isResendingConfirmation}
                    >
                      {isResendingConfirmation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend confirmation email"
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
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
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-hotel-secondary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-hotel-primary hover:bg-hotel-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-hotel-secondary hover:underline">
                  Create one
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
