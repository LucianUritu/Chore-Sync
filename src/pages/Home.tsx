
import React from "react";
import HomeHeader from "@/components/home/HomeHeader";
import StatusOverview from "@/components/home/StatusOverview";
import ChoreList from "@/components/home/ChoreList";

const Home = () => {
  // Sample data - in a real app this would come from an API or state management
  const todayChores = [
    {
      id: "1",
      title: "Clean kitchen countertops",
      dueDate: "Today, 3:00 PM",
      assignedUser: {
        name: "Emma",
        avatar: undefined,
        initials: "EM",
      },
      isDue: true,
      isComplete: false,
    },
    {
      id: "2",
      title: "Take out trash",
      dueDate: "Today, 7:00 PM",
      assignedUser: {
        name: "Jack",
        avatar: undefined,
        initials: "JK",
      },
      isDue: false,
      isComplete: true,
    },
  ];

  const upcomingChores = [
    {
      id: "3",
      title: "Vacuum living room",
      dueDate: "Tomorrow, 2:00 PM",
      assignedUser: {
        name: "Alex",
        avatar: undefined,
        initials: "AL",
      },
    },
    {
      id: "4",
      title: "Clean bathroom",
      dueDate: "May 12, 5:00 PM",
      assignedUser: {
        name: "Sarah",
        avatar: undefined,
        initials: "SA",
      },
    },
  ];

  return (
    <div className="px-4 pb-20">
      <HomeHeader 
        userName="Emma"
        userInitials="EM"
      />
      <StatusOverview />
      <ChoreList title="Today's Chores" chores={todayChores} />
      <ChoreList title="Upcoming Chores" chores={upcomingChores} />
    </div>
  );
};

export default Home;
