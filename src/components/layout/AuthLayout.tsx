
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-choresync-gray">
      <Outlet />
    </div>
  );
};

export default AuthLayout;