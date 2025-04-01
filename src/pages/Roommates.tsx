
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Home, Star } from "lucide-react";

interface RoommateProps {
  name: string;
  avatar?: string;
  initials: string;
  completionRate: number;
  choreCount: number;
  isTopPerformer?: boolean;
}

const RoommateBadge = ({ roommate }: { roommate: RoommateProps }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-16 w-16 border-2 border-white">
          <AvatarImage src={roommate.avatar} alt={roommate.name} />
          <AvatarFallback className="bg-choresync-purple text-white text-xl">
            {roommate.initials}
          </AvatarFallback>
        </Avatar>
        {roommate.isTopPerformer && (
          <div className="absolute -top-1 -right-1 bg-choresync-yellow rounded-full p-1">
            <Star size={12} className="text-white" />
          </div>
        )}
      </div>
      <span className="mt-2 font-medium">{roommate.name}</span>
    </div>
  );
};

const RoommateCard = ({ roommate }: { roommate: RoommateProps }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center">
      <Avatar className="h-12 w-12 mr-4">
        <AvatarImage src={roommate.avatar} alt={roommate.name} />
        <AvatarFallback className="bg-choresync-purple text-white">
          {roommate.initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold">{roommate.name}</h3>
          {roommate.isTopPerformer && (
            <div className="bg-choresync-yellow rounded-full p-1">
              <Star size={12} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-choresync-darkGray">
            {roommate.choreCount} chores
          </span>
          <span className="text-sm font-medium">{roommate.completionRate}%</span>
        </div>
        
        <Progress value={roommate.completionRate} className="h-1.5" />
      </div>
    </div>
  );
};

const Roommates = () => {
  const roommates: RoommateProps[] = [
    {
      name: "Emma",
      initials: "EM",
      completionRate: 90,
      choreCount: 5,
      isTopPerformer: true,
    },
    {
      name: "Jack",
      initials: "JK",
      completionRate: 75,
      choreCount: 4,
    },
    {
      name: "Alex",
      initials: "AL",
      completionRate: 60,
      choreCount: 3,
    },
    {
      name: "Sarah",
      initials: "SA",
      completionRate: 85,
      choreCount: 4,
    },
  ];

  return (
    <div className="px-4 pb-20 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roommates</h1>
        <button className="bg-choresync-blue text-white rounded-full p-2">
          <Home size={18} />
        </button>
      </div>
      
      <div className="flex justify-around mb-8">
        {roommates.slice(0, 3).map((roommate, index) => (
          <RoommateBadge key={index} roommate={roommate} />
        ))}
      </div>
      
      <h2 className="font-bold text-lg mb-4">Chore Completion</h2>
      <div className="space-y-4">
        {roommates.map((roommate, index) => (
          <RoommateCard key={index} roommate={roommate} />
        ))}
      </div>
    </div>
  );
};

export default Roommates;
