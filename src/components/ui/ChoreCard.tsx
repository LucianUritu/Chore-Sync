import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

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
}

const ChoreCard: React.FC<ChoreCardProps> = ({
  title,
  dueDate,
  assignedUser,
  isDue,
  isComplete,
}) => {
  // Determine status and styling based on props
  let statusColor = '';
  let statusText = '';
  let StatusIcon = Clock;

  if (isComplete) {
    statusColor = 'bg-green-100 text-green-800';
    statusText = 'Completed';
    StatusIcon = CheckCircle;
  } else if (isDue) {
    statusColor = 'bg-red-100 text-red-800';
    statusText = 'Due Today';
    StatusIcon = AlertTriangle;
  } else {
    statusColor = 'bg-blue-100 text-blue-800';
    statusText = 'Upcoming';
    StatusIcon = Clock;
  }

  return (
    <Card className="p-4 mb-3 border-l-4 border-l-choresync-blue">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusColor}`}>
          <StatusIcon size={12} className="mr-1" />
          {statusText}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Due: {dueDate}</span>
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-choresync-blue text-white flex items-center justify-center text-xs mr-1">
            {assignedUser.initials}
          </div>
          <span>{assignedUser.name}</span>
        </div>
      </div>
    </Card>
  );
};

export default ChoreCard;