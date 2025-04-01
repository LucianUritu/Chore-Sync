
import React from "react";
import StatusCard from "@/components/ui/StatusCard";
import { CalendarIcon, Clock, Check, Users } from "lucide-react";

const StatusOverview = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <StatusCard 
        title="Total Chores" 
        count={12} 
        color="blue" 
        icon={CalendarIcon} 
      />
      <StatusCard 
        title="In Progress" 
        count={3} 
        color="yellow" 
        icon={Clock} 
      />
      <StatusCard 
        title="Completed" 
        count={8} 
        color="green" 
        icon={Check} 
      />
      <StatusCard 
        title="Roommates" 
        count={4} 
        color="purple" 
        icon={Users} 
      />
    </div>
  );
};

export default StatusOverview;
