import React, { useEffect, useState } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import StatusOverview from "@/components/home/StatusOverview";
import ChoreList from "@/components/home/ChoreList";
import { useAuth } from "@/hooks/useAuth";
import { getChoresByFamilyId, getChoresByDate, Chore } from "@/services/database";
import { format, isSameDay, parseISO, addDays } from "date-fns";

const Home = () => {
  const { user, currentFamily } = useAuth();
  const [todayChores, setTodayChores] = useState<Chore[]>([]);
  const [upcomingChores, setUpcomingChores] = useState<Chore[]>([]);

  useEffect(() => {
    if (!currentFamily) return;

    // Get today's date
    const today = new Date();
    
    // Load chores for current family
    const allChores = getChoresByFamilyId(currentFamily.id);
    
    // Filter today's chores
    const todayItems = allChores.filter(chore => 
      isSameDay(parseISO(chore.dueDate), today)
    );
    setTodayChores(todayItems);
    
    // Filter upcoming chores (next 7 days, excluding today)
    const upcomingItems = allChores.filter(chore => {
      const choreDate = parseISO(chore.dueDate);
      const isUpcoming = choreDate > today && 
        choreDate <= addDays(today, 7) &&
        !isSameDay(choreDate, today);
      return isUpcoming;
    });
    setUpcomingChores(upcomingItems);
  }, [currentFamily]);

  const formatChoreForDisplay = (chore: Chore) => {
    if (!currentFamily) return null;
    
    // Find assigned user from family members
    const assignedMember = currentFamily.members.find(
      member => member.userId === chore.assignedUserId
    );
    
    if (!assignedMember) return null;
    
    // Format the date
    const dueDate = parseISO(chore.dueDate);
    const formattedDate = isSameDay(dueDate, new Date()) 
      ? `Today, ${format(dueDate, 'h:mm a')}`
      : format(dueDate, 'MMM d, h:mm a');
    
    return {
      id: chore.id,
      title: chore.title,
      dueDate: formattedDate,
      assignedUser: {
        name: assignedMember.name,
        initials: assignedMember.initials,
      },
      isDue: isSameDay(dueDate, new Date()),
      isComplete: chore.isComplete,
    };
  };

  const mappedTodayChores = todayChores
    .map(formatChoreForDisplay)
    .filter(Boolean);
    
  const mappedUpcomingChores = upcomingChores
    .map(formatChoreForDisplay)
    .filter(Boolean);

  return (
    <div className="px-4 pb-20">
      {user && <HomeHeader />}
      <StatusOverview />
      <ChoreList title="Today's Chores" chores={mappedTodayChores} />
      <ChoreList title="Upcoming Chores" chores={mappedUpcomingChores} />
    </div>
  );
};

export default Home;
