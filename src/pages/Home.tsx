
import React from "react";
import ChoreList from "@/components/home/ChoreList";
import HomeHeader from "@/components/home/HomeHeader";
import StatusOverview from "@/components/home/StatusOverview";
import { useAuth } from "@/hooks/useAuth";
import { getChoresByFamilyId, getShoppingItemsByFamilyId } from "@/services/database";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const { user, currentFamily } = useAuth();

  // Query for chores
  const { data: chores = [], isLoading: choreLoading } = useQuery({
    queryKey: ['chores', currentFamily?.id],
    queryFn: () => currentFamily ? getChoresByFamilyId(currentFamily.id) : [],
    enabled: !!currentFamily,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for live updates
  });

  // Query for shopping items
  const { data: shoppingItems = [], isLoading: shoppingLoading } = useQuery({
    queryKey: ['shopping-items', currentFamily?.id],
    queryFn: () => currentFamily ? getShoppingItemsByFamilyId(currentFamily.id) : [],
    enabled: !!currentFamily,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = choreLoading || shoppingLoading;
  
  // Calculate completed and total chores
  const completedChores = chores.filter(chore => chore.isComplete).length;
  const totalChores = chores.length;
  
  // Get today's chores
  const today = new Date().toISOString().split('T')[0];
  const todaysChores = chores.filter(chore => {
    const choreDate = new Date(chore.dueDate).toISOString().split('T')[0];
    return choreDate === today;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-choresync-gray">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-choresync-blue mb-4">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-choresync-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Transform chores to format expected by ChoreList component
  const formattedChores = todaysChores.map(chore => {
    // Find the member information for the assigned user
    const assignedMember = currentFamily?.members.find(
      member => member.userId === chore.assignedUserId
    );
    
    return {
      id: chore.id,
      title: chore.title,
      dueDate: chore.dueDate,
      isComplete: chore.isComplete,
      assignedUser: {
        name: assignedMember?.name || "Unknown",
        initials: assignedMember?.initials || "??"
      }
    };
  });

  return (
    <div className="bg-choresync-gray min-h-screen pb-20">
      <HomeHeader />
      
      <div className="px-4">
        <StatusOverview 
          completedChores={completedChores}
          totalChores={totalChores}
          shoppingItems={shoppingItems.length}
        />
        
        <ChoreList chores={formattedChores} isToday={true} />
      </div>
    </div>
  );
};

export default Home;
