import React, { useEffect, useState } from "react";
import StatusCard from "@/components/ui/StatusCard";
import { CalendarIcon, Clock, Check, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getChoresByFamilyId, Chore } from "@/services/database";

const StatusOverview = () => {
  const { currentFamily } = useAuth();
  const [totalChores, setTotalChores] = useState(0);
  const [inProgressChores, setInProgressChores] = useState(0);
  const [completedChores, setCompletedChores] = useState(0);
  
  useEffect(() => {
    if (!currentFamily) return;
    
    const familyChores = getChoresByFamilyId(currentFamily.id);
    
    setTotalChores(familyChores.length);
    setInProgressChores(familyChores.filter(chore => !chore.isComplete).length);
    setCompletedChores(familyChores.filter(chore => chore.isComplete).length);
  }, [currentFamily]);

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
        count={inProgressChores} 
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
        count={currentFamily?.members.length || 0} 
        color="purple" 
        icon={Users} 
      />
    </div>
  );
};

export default StatusOverview;
