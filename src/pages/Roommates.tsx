import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Home, Star, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getChoresByFamilyId, Chore } from "@/services/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoommateStats {
  userId: string;
  name: string;
  initials: string;
  completedChores: number;
  totalChores: number;
  completionRate: number;
  isTopPerformer: boolean;
}

const RoommateBadge = ({ roommate }: { roommate: RoommateStats }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-16 w-16 border-2 border-white">
          <AvatarFallback className="bg-choresync-purple text-white text-xl">
            {roommate.initials}
          </AvatarFallback>
        </Avatar>
        {roommate.isTopPerformer && (
          <div className="absolute -top-1 -right-1 bg-choresync-yellow rounded-full p-1">
            <Star size={12} className="text-white" />
          </div>
        )}
      </div>
      <span className="mt-2 font-medium">{roommate.name}</span>
    </div>
  );
};

const RoommateCard = ({ roommate }: { roommate: RoommateStats }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center">
      <Avatar className="h-12 w-12 mr-4">
        <AvatarFallback className="bg-choresync-purple text-white">
          {roommate.initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold">{roommate.name}</h3>
          {roommate.isTopPerformer && (
            <div className="bg-choresync-yellow rounded-full p-1">
              <Star size={12} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-choresync-darkGray">
            {roommate.totalChores} chores
          </span>
          <span className="text-sm font-medium">{roommate.completionRate}%</span>
        </div>
        
        <Progress value={roommate.completionRate} className="h-1.5" />
      </div>
    </div>
  );
};

const Roommates = () => {
  const { user, currentFamily, createFamily } = useAuth();
  const [roommateStats, setRoommateStats] = useState<RoommateStats[]>([]);
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  
  // Calculate roommate stats whenever family changes
  useEffect(() => {
    if (!currentFamily) return;
    
    // Get all chores for the current family
    const familyChores = getChoresByFamilyId(currentFamily.id);
    
    // Calculate stats for each member
    const stats = currentFamily.members.map(member => {
      const memberChores = familyChores.filter(
        chore => chore.assignedUserId === member.userId
      );
      
      const completedChores = memberChores.filter(chore => chore.isComplete).length;
      const totalChores = memberChores.length;
      const completionRate = totalChores ? Math.round((completedChores / totalChores) * 100) : 0;
      
      return {
        userId: member.userId,
        name: member.name,
        initials: member.initials,
        completedChores,
        totalChores,
        completionRate,
        isTopPerformer: false, // Will set later
      };
    });
    
    // Determine top performer(s)
    if (stats.length > 0) {
      const maxRate = Math.max(...stats.map(s => s.completionRate));
      stats.forEach(s => {
        s.isTopPerformer = s.completionRate === maxRate && s.completionRate > 0;
      });
    }
    
    setRoommateStats(stats);
  }, [currentFamily]);
  
  const handleAddFamily = async () => {
    if (newFamilyName.trim()) {
      await createFamily(newFamilyName.trim());
      setNewFamilyName("");
      setIsAddFamilyOpen(false);
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">No Family Selected</h1>
        <p className="text-center mb-6">
          You need to create or join a family to see roommates.
        </p>
        <Button onClick={() => setIsAddFamilyOpen(true)}>
          <Plus size={16} className="mr-1" />
          Create a Family
        </Button>
        
        <Dialog open={isAddFamilyOpen} onOpenChange={setIsAddFamilyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Family</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="familyName" className="text-sm font-medium">
                  Family Name
                </label>
                <Input
                  id="familyName"
                  placeholder="Enter family name"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddFamilyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFamily}>
                  Create Family
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roommates</h1>
        <Button 
          size="icon"
          variant="outline"
          onClick={() => setIsAddFamilyOpen(true)}
        >
          <Plus size={18} />
        </Button>
      </div>
      
      <div className="flex justify-around mb-8">
        {roommateStats.slice(0, 3).map((roommate, index) => (
          <RoommateBadge key={roommate.userId} roommate={roommate} />
        ))}
      </div>
      
      <h2 className="font-bold text-lg mb-4">Chore Completion</h2>
      <div className="space-y-4">
        {roommateStats.map((roommate) => (
          <RoommateCard key={roommate.userId} roommate={roommate} />
        ))}
      </div>
      
      <Dialog open={isAddFamilyOpen} onOpenChange={setIsAddFamilyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Family</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="familyName" className="text-sm font-medium">
                Family Name
              </label>
              <Input
                id="familyName"
                placeholder="Enter family name"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddFamilyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFamily}>
                Create Family
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roommates;
