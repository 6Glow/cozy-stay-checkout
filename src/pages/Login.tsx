
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import ForgotPasswordLink from "@/components/auth/ForgotPasswordLink";

const Login = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();

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

  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect');

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
