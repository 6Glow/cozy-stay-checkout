
import React from "react";
import { Link } from "react-router-dom";

const LoginFooter = () => {
  return (
    <div className="text-sm text-center">
      Don't have an account?{" "}
      <Link to="/register" className="text-hotel-secondary hover:underline">
        Create one
      </Link>
    </div>
  );
};

export default LoginFooter;
