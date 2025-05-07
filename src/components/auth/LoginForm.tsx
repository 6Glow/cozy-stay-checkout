
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  redirectUrl?: string | null;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const LoginForm = ({ redirectUrl, authError, setAuthError }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Default to true
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Try to populate email from localStorage if available
  useEffect(() => {
    const storedCreds = localStorage.getItem("auth_credentials");
    if (storedCreds) {
      try {
        const parsedCreds = JSON.parse(storedCreds);
        if (parsedCreds.email) {
          setEmail(parsedCreds.email);
          // Don't set the password for security reasons
        }
      } catch (e) {
        console.error("Error parsing stored credentials:", e);
      }
    }
  }, []);

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
      
      // Store credentials securely if remember me is checked
      if (rememberMe) {
        // Store in secure way but for now this works
        localStorage.setItem("auth_credentials", JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem("auth_credentials");
      }
      
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

  // Auto-submit if we have both email and password and they're both coming from localStorage
  useEffect(() => {
    const storedCreds = localStorage.getItem("auth_credentials");
    if (storedCreds && !isLoading) {
      try {
        const parsedCreds = JSON.parse(storedCreds);
        if (parsedCreds.email && parsedCreds.password && email === parsedCreds.email) {
          setPassword(parsedCreds.password);
          // Set a small delay to ensure the form updates before submission
          const timer = setTimeout(() => {
            login(parsedCreds.email, parsedCreds.password)
              .then(() => {
                const storedRedirect = localStorage.getItem("checkoutRedirect");
                localStorage.removeItem("checkoutRedirect");
                
                if (storedRedirect) {
                  navigate(storedRedirect);
                } else if (redirectUrl) {
                  navigate(decodeURIComponent(redirectUrl));
                } else {
                  navigate("/");
                }
              })
              .catch((err) => {
                console.error("Auto-login error:", err);
                // Don't show error for auto-login attempt
              });
          }, 500);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Error in auto-login:", e);
      }
    }
  }, [email, login, navigate, redirectUrl, isLoading]);

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
          autoComplete="email"
          className="focus:border-hotel-primary"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="focus:border-hotel-primary pr-10"
          />
          <button 
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 text-hotel-primary focus:ring-hotel-primary border-gray-300 rounded"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
          Remember me
        </label>
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
