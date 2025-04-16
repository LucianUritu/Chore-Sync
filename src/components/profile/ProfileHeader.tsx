
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const ProfileHeader = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-choresync-blue flex items-center justify-center text-white text-xl font-semibold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-red-500"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;