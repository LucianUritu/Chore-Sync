
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ProfileButtonProps {
  isActive: boolean;
}

const ProfileButton = ({ isActive }: ProfileButtonProps) => {
  const { user } = useAuth();
  
  return (
    <Link
      to="/profile"
      className={cn(
        "nav-item transition-colors duration-200 flex flex-col items-center",
        isActive ? "text-choresync-blue" : "text-choresync-darkGray"
      )}
    >
      <div className="relative">
        <User size={20} className="mb-1" />
        {user && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </div>
      <span className="text-xs font-medium">Profile</span>
    </Link>
  );
};

export default ProfileButton;