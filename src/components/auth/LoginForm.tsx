
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  redirectUrl?: string | null;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const LoginForm = ({ redirectUrl, authError, setAuthError }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Clear errors when inputs change
  useEffect(() => {
    setErrors({});
    setAuthError(null);
  }, [email, password, setAuthError]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setAuthError(null);
    
    try {
      await login(email, password);
      
      // Check for a redirect URL in the query params or localStorage
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
      
      if (error?.message?.includes("Invalid login credentials")) {
        setAuthError("Invalid email or password. Please check your credentials and try again.");
      } else {
        setAuthError(error?.message || "Failed to login. Please check your credentials.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      
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
  );
};

export default LoginForm;
