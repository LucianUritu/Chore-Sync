import React from "react";
import ChoreCard from "@/components/ui/ChoreCard";

interface ChoreListProps {
  title?: string;
  chores: Array<{
    id: string;
    title: string;
    dueDate: string;
    assignedUser: {
      name: string;
      avatar?: string;
      initials: string;
    };
    isDue?: boolean;
    isComplete?: boolean;
  }>;
  isToday?: boolean;
}

const ChoreList = ({ title = "Chores", chores, isToday }: ChoreListProps) => {
  return (
    <div className="mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">{title}</h2>
        <button className="text-choresync-blue text-sm font-medium">See All</button>
      </div>
      <div className="space-y-4">
        {chores.map((chore) => (
          <ChoreCard
            key={chore.id}
            title={chore.title}
            dueDate={chore.dueDate}
            assignedUser={chore.assignedUser}
            isDue={chore.isDue}
            isComplete={chore.isComplete}
          />
        ))}
      </div>
    </div>
  );
};

export default ChoreList;
