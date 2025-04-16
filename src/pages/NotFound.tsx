
import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-choresync-gray">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-choresync-blue mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! We couldn't find that page.
        </p>
        <p className="text-choresync-darkGray mb-8">
          The page at <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code> doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-choresync-blue text-white px-6 py-3 rounded-full font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;