
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginFormProps {
  redirectUrl?: string | null;
  authError?: string | null;
  setAuthError?: (error: string | null) => void;
}

// Login schema with both email and password
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Define the form data type based on the schema
type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = ({ redirectUrl, authError, setAuthError }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      // Try to prefill email from localStorage if available for better UX
      email: localStorage.getItem("lastEmail") || "",
      password: "",
    }
  });
  
  const onSubmit = async (formData: LoginFormData) => {
    if (authError && setAuthError) {
      setAuthError(null);
    }
    
    // Clear any previous login errors
    setLoginError(null);
    setIsLoading(true);
    
    // Save email for convenience
    localStorage.setItem("lastEmail", formData.email);
    
    try {
      const success = await login(formData.email, formData.password, rememberMe);
      
      if (success) {
        const checkoutRedirect = localStorage.getItem("checkoutRedirect");
        
        if (checkoutRedirect) {
          localStorage.removeItem("checkoutRedirect");
          navigate(checkoutRedirect);
        } else if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate("/");
        }
      } else {
        // If login wasn't successful, the error will be shown via toast
        // but we'll set a form error too for visibility
        setLoginError("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Login form error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-none shadow-none">
        <CardContent className="p-0 space-y-4">
          {(authError || loginError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {authError || loginError}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleShowPassword}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message as string}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-hotel-primary hover:bg-hotel-primary/90 mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
          
          <div className="text-sm text-center mt-4 text-muted-foreground">
            <p>Having trouble logging in? Try checking your email for verification.</p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default LoginForm;
