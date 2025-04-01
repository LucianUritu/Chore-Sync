import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const HomeHeader = () => {
  const { user, currentFamily } = useAuth();

  if (!user) return null;

  return (
    <div className="pt-6 pb-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <div className="h-10 w-10 rounded-full bg-choresync-blue text-white flex items-center justify-center">
          {user.initials}
        </div>
      </div>
      
      {currentFamily && (
        <div className="flex items-center text-choresync-darkGray">
          <span>{currentFamily.name}</span>
          <ChevronDown size={16} className="ml-1" />
        </div>
      )}
    </div>
  );
};

export default HomeHeader;
