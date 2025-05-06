
import React from "react";
import { Link } from "react-router-dom";

const ForgotPasswordLink = () => {
  return (
    <Link
      to="/forgot-password"
      className="text-sm text-hotel-secondary hover:underline"
    >
      Forgot password?
    </Link>
  );
};

export default ForgotPasswordLink;
