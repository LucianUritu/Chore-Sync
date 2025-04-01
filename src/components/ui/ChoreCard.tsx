
import React from "react";
import { CalendarIcon, Clock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChoreCardProps {
  title: string;
  dueDate: string;
  assignedUser: {
    name: string;
    avatar?: string;
    initials: string;
  };
  isDue?: boolean;
  isComplete?: boolean;
  className?: string;
}

const ChoreCard = ({
  title,
  dueDate,
  assignedUser,
  isDue = false,
  isComplete = false,
  className,
}: ChoreCardProps) => {
  let statusColor = "bg-choresync-gray";
  let statusIcon = Clock;
  let statusText = "Upcoming";

  if (isDue) {
    statusColor = "bg-choresync-red";
    statusIcon = X;
    statusText = "Due Today";
  } else if (isComplete) {
    statusColor = "bg-choresync-green";
    statusIcon = Check;
    statusText = "Completed";
  }

  return (
    <div
      className={cn(
        "chore-card animate-fade-in relative",
        isDue && !isComplete ? "border-l-4 border-choresync-red" : "",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg pr-2">{title}</h3>
        <div
          className={cn(
            "flex items-center px-2 py-1 rounded-full text-xs font-medium text-white",
            statusColor
          )}
        >
          <statusIcon size={12} className="mr-1" />
          <span>{statusText}</span>
        </div>
      </div>

      <div className="flex items-center text-choresync-darkGray mb-3">
        <CalendarIcon size={14} className="mr-1" />
        <span className="text-sm">{dueDate}</span>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={assignedUser.avatar} alt={assignedUser.name} />
            <AvatarFallback className="bg-choresync-lightPurple text-white text-xs">
              {assignedUser.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{assignedUser.name}</span>
        </div>
        
        <button className="text-choresync-blue text-sm font-medium">
          Details
        </button>
      </div>
    </div>
  );
};

export default ChoreCard;
