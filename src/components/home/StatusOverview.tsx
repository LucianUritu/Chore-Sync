
import React from "react";
import StatusCard from "@/components/ui/StatusCard";
import { CalendarIcon, Clock, Check, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface StatusOverviewProps {
  completedChores: number;
  totalChores: number;
  shoppingItems: number;
}

const StatusOverview = ({ completedChores, totalChores, shoppingItems }: StatusOverviewProps) => {
  const { currentFamily } = useAuth();
  
  // Ensure we're counting all members correctly
  const memberCount = currentFamily?.members?.length || 0;
  
  console.log('StatusOverview - Member count:', {
    familyName: currentFamily?.name,
    memberCount,
    members: currentFamily?.members
  });
  
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <StatusCard 
        title="Total Chores" 
        count={totalChores} 
        color="blue" 
        icon={CalendarIcon} 
      />
      <StatusCard 
        title="In Progress" 
        count={totalChores - completedChores} 
        color="yellow" 
        icon={Clock} 
      />
      <StatusCard 
        title="Completed" 
        count={completedChores} 
        color="green" 
        icon={Check} 
      />
      <StatusCard 
        title="Family Members" 
        count={memberCount} 
        color="purple" 
        icon={Users} 
      />
    </div>
  );
};

export default StatusOverview;
