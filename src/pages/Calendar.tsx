import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getChoresByDate, toggleChoreCompletion, Chore } from "@/services/database";
import AddChoreForm from "@/components/chores/AddChoreForm";

const Calendar = () => {
  const { currentFamily } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chores, setChores] = useState<Chore[]>([]);
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  
  // Load chores whenever selected date or family changes
  useEffect(() => {
    if (!currentFamily) return;
    
    // Get chores for the selected date
    const dateChores = getChoresByDate(
      currentFamily.id, 
      selectedDate.toISOString()
    );
    
    setChores(dateChores);
  }, [selectedDate, currentFamily]);

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
  
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleToggleCompletion = (choreId: string) => {
    toggleChoreCompletion(choreId);
    
    // Refresh chores
    if (currentFamily) {
      const updatedChores = getChoresByDate(
        currentFamily.id, 
        selectedDate.toISOString()
      );
      setChores(updatedChores);
    }
  };
  
  const handleAddChore = () => {
    setIsAddChoreOpen(true);
  };
  
  const handleChoreAdded = () => {
    setIsAddChoreOpen(false);
    
    // Refresh chores
    if (currentFamily) {
      const updatedChores = getChoresByDate(
        currentFamily.id, 
        selectedDate.toISOString()
      );
      setChores(updatedChores);
    }
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
          <div 
            key={index} 
            className="flex flex-col items-center"
            onClick={() => handleDayClick(day)}
          >
            <span className="text-xs text-gray-500 mb-1">{format(day, 'EEE')}</span>
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm 
              ${isSameDay(day, selectedDate) 
                ? 'bg-choresync-blue text-white' 
                : isSameDay(day, new Date())
                  ? 'bg-gray-200' 
                  : 'hover:bg-gray-100 cursor-pointer'}`}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <CalendarIcon className="mr-2" size={20} />
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <Button 
            size="sm" 
            onClick={handleAddChore}
            className="flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add Chore
          </Button>
        </div>
        
        {chores.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No chores scheduled for this day
          </div>
        ) : (
          chores.map((chore) => {
            // Find assigned user
            const assignedUser = currentFamily?.members.find(
              m => m.userId === chore.assignedUserId
            );
            
            if (!assignedUser) return null;
            
            return (
              <Card 
                key={chore.id} 
                className={`p-4 ${
                  !chore.isComplete && isSameDay(parseISO(chore.dueDate), new Date()) 
                    ? 'border-l-4 border-l-red-500' 
                    : ''
                }`}
                onClick={() => handleToggleCompletion(chore.id)}
              >
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    checked={chore.isComplete}
                    onChange={() => handleToggleCompletion(chore.id)}
                    className="mr-3 mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium mb-1 ${chore.isComplete ? 'line-through text-gray-500' : ''}`}>
                      {chore.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Due: {format(parseISO(chore.dueDate), 'h:mm a')}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-choresync-blue text-white flex items-center justify-center text-sm">
                    {assignedUser.initials}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
      
      <Dialog open={isAddChoreOpen} onOpenChange={setIsAddChoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Chore</DialogTitle>
          </DialogHeader>
          <AddChoreForm onComplete={handleChoreAdded} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
