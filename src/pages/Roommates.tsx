
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Chore, getChoresByFamilyId, toggleChoreCompletion } from "@/services/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Roommates = () => {
  const { currentFamily, user } = useAuth();
  const { toast } = useToast();
  const [chores, setChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchChores = async () => {
      if (!currentFamily) return;
      
      setIsLoading(true);
      try {
        const fetchedChores = await getChoresByFamilyId(currentFamily.id);
        setChores(fetchedChores);
      } catch (error) {
        console.error("Error fetching chores:", error);
        toast({
          title: "Error",
          description: "Failed to load chores. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChores();
  }, [currentFamily, toast]);

  const handleToggleComplete = async (choreId: string) => {
    try {
      const updatedChore = await toggleChoreCompletion(choreId);
      if (updatedChore) {
        // Update the local state with the updated chore
        setChores(prevChores => 
          prevChores.map(chore => 
            chore.id === choreId ? updatedChore : chore
          )
        );

        toast({
          title: updatedChore.isComplete ? "Chore completed" : "Chore marked incomplete",
          description: `${updatedChore.title} has been updated.`,
        });
      }
    } catch (error) {
      console.error("Error toggling chore completion:", error);
      toast({
        title: "Error",
        description: "Failed to update chore status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter chores based on active tab
  const filteredChores = activeTab === "all" 
    ? chores
    : chores.filter(chore => {
        // For "me" tab, show chores assigned to current user
        if (activeTab === "me" && user) {
          return chore.assignedUserId === user.id;
        }
        // For "others" tab, show chores assigned to others
        if (activeTab === "others" && user) {
          return chore.assignedUserId !== user.id;
        }
        return false;
      });
  
  // Group chores by assignee
  const choresByAssignee: Record<string, Chore[]> = {};
  
  filteredChores.forEach(chore => {
    const assigneeId = chore.assignedUserId;
    if (!choresByAssignee[assigneeId]) {
      choresByAssignee[assigneeId] = [];
    }
    choresByAssignee[assigneeId].push(chore);
  });

  // Find member names
  const getMemberName = (userId: string) => {
    if (!currentFamily) return "Unknown";
    
    const member = currentFamily.members.find(m => m.userId === userId);
    return member ? member.name : "Unknown";
  };

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

  return (
    <div className="bg-choresync-gray min-h-screen pb-20 px-4">
      <h1 className="text-2xl font-bold pt-6 mb-6 text-center">Roommate Chores</h1>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="me">My Chores</TabsTrigger>
          <TabsTrigger value="others">Others</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {Object.keys(choresByAssignee).map(assigneeId => (
            <div key={assigneeId} className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3">{getMemberName(assigneeId)}</h3>
              <div className="space-y-2">
                {choresByAssignee[assigneeId].map(chore => (
                  <ChoreItem 
                    key={chore.id} 
                    chore={chore} 
                    onToggleComplete={handleToggleComplete} 
                  />
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(choresByAssignee).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No chores found
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="me" className="space-y-4">
          {user && choresByAssignee[user.id] ? (
            choresByAssignee[user.id].map(chore => (
              <ChoreItem 
                key={chore.id} 
                chore={chore} 
                onToggleComplete={handleToggleComplete} 
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              You don't have any assigned chores
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="others" className="space-y-6">
          {Object.keys(choresByAssignee)
            .filter(assigneeId => user && assigneeId !== user.id)
            .map(assigneeId => (
              <div key={assigneeId} className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-semibold mb-3">{getMemberName(assigneeId)}</h3>
                <div className="space-y-2">
                  {choresByAssignee[assigneeId].map(chore => (
                    <ChoreItem 
                      key={chore.id} 
                      chore={chore} 
                      onToggleComplete={handleToggleComplete} 
                    />
                  ))}
                </div>
              </div>
            ))}
            
          {Object.keys(choresByAssignee)
            .filter(assigneeId => user && assigneeId !== user.id)
            .length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No chores assigned to others
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Chore item component
type ChoreItemProps = {
  chore: Chore;
  onToggleComplete: (choreId: string) => Promise<void>;
};

const ChoreItem = ({ chore, onToggleComplete }: ChoreItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggleComplete(chore.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-md ${
      chore.isComplete ? 'bg-green-50' : 'bg-gray-50'
    }`}>
      <div>
        <p className={`${chore.isComplete ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {chore.title}
        </p>
        <p className="text-xs text-gray-500">
          Due: {new Date(chore.dueDate).toLocaleDateString()}
        </p>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        disabled={isLoading}
        onClick={handleToggle}
      >
        {chore.isComplete ? 
          <CheckCircle className="text-green-500" /> : 
          <Circle className="text-gray-400" />
        }
      </Button>
    </div>
  );
};

export default Roommates;