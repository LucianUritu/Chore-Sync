
import React, { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type ChoreType = {
  id: string;
  title: string;
  dueDate: string;
  assignedUser: {
    name: string;
    initials: string;
  };
  isDue?: boolean;
  isComplete?: boolean;
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Sample chores data
  const chores: ChoreType[] = [
    {
      id: "1",
      title: "Vacuum living room",
      dueDate: "2023-05-15",
      assignedUser: { name: "Alex Johnson", initials: "AJ" },
      isDue: true,
      isComplete: false
    },
    {
      id: "2",
      title: "Clean kitchen",
      dueDate: "2023-05-16",
      assignedUser: { name: "Sam Smith", initials: "SS" },
      isDue: false,
      isComplete: true
    },
    {
      id: "3",
      title: "Take out trash",
      dueDate: "2023-05-17",
      assignedUser: { name: "Jamie Williams", initials: "JW" },
      isDue: true,
      isComplete: false
    }
  ];

  const getWeekDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  };

  const weekDays = getWeekDates();

  const goToPreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex space-x-2">
          <button onClick={goToPreviousWeek} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6 text-center">
        {weekDays.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">{format(day, 'EEE')}</span>
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm 
              ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                ? 'bg-choresync-blue text-white' 
                : 'text-gray-800'}`}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="mr-2" size={20} />
          Upcoming Chores
        </h2>
        
        {chores.map((chore) => (
          <Card key={chore.id} className={`p-4 ${chore.isDue && !chore.isComplete ? 'border-l-4 border-l-red-500' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-1">{chore.title}</h3>
                <p className="text-sm text-gray-500">Due: {chore.dueDate}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-choresync-blue text-white flex items-center justify-center text-sm">
                {chore.assignedUser.initials}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
