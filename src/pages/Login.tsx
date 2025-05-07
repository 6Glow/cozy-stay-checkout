
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import ForgotPasswordLink from "@/components/auth/ForgotPasswordLink";

const Login = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user && !isLoading) {
      // Check if we have a redirect stored from checkout
      const checkoutRedirect = localStorage.getItem("checkoutRedirect");
      
      if (checkoutRedirect) {
        localStorage.removeItem("checkoutRedirect");
        navigate(checkoutRedirect);
        return;
      }
      
      // Check for redirect URL parameter
      const params = new URLSearchParams(location.search);
      const redirectUrl = params.get('redirect');
      
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        // Default redirect to homepage
        navigate('/');
      }
    }
  }, [user, isLoading, navigate, location]);

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
      // Save the redirect URL to checkout in localStorage
      localStorage.setItem("checkoutRedirect", "/cart");
    }
  }, [location]);

  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect');
  
  // If redirectUrl is /cart, store it in localStorage for later use
  useEffect(() => {
    if (redirectUrl && redirectUrl.includes('/cart')) {
      localStorage.setItem("checkoutRedirect", redirectUrl);
    }
  }, [redirectUrl]);

  // If already logged in, redirect
  if (user && !isLoading) {
    return null; // Will redirect via the first useEffect
  }

  return (
    <AuthLayout 
      title="Sign in to your account"
      description="Enter your email and password to access your account"
      footer={<LoginFooter />}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <ForgotPasswordLink />
        </div>
        <LoginForm 
          redirectUrl={redirectUrl} 
          authError={authError}
          setAuthError={setAuthError}
        />
      </div>
    </AuthLayout>
  );
};

export default Login;
