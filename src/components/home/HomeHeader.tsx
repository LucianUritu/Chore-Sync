
import React from "react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HomeHeaderProps {
  userName: string;
  userImage?: string;
  userInitials: string;
}

const HomeHeader = ({ userName, userImage, userInitials }: HomeHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6 pt-4">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={userImage} alt={userName} />
          <AvatarFallback className="bg-choresync-purple text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-choresync-darkGray text-sm">Hi there,</p>
          <h2 className="font-bold text-lg">{userName}</h2>
        </div>
      </div>
      <div className="flex items-center">
        <button className="rounded-full bg-white p-2 shadow-sm mr-3">
          <Search size={20} className="text-choresync-darkGray" />
        </button>
        <button className="rounded-full bg-white p-2 shadow-sm relative">
          <Bell size={20} className="text-choresync-darkGray" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-choresync-red rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export default HomeHeader;
