import React, { useEffect, useState } from "react";
import { Plus, Check, Circle, Trash2 } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import StatusOverview from "@/components/home/StatusOverview";
import ChoreList from "@/components/home/ChoreList";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getChoresByFamilyId, Chore } from "@/services/database";
import { 
  getShoppingItemsByFamilyId, 
  saveShoppingItem, 
  toggleShoppingItemComplete, 
  deleteShoppingItem,
  ShoppingItem 
} from "@/services/database";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO, addDays } from "date-fns";

const Home = () => {
  const { user, currentFamily } = useAuth();
  const { toast } = useToast();
  const [todayChores, setTodayChores] = useState<Chore[]>([]);
  const [upcomingChores, setUpcomingChores] = useState<Chore[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

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

    // Load shopping items for current family
    const items = getShoppingItemsByFamilyId(currentFamily.id);
    setShoppingItems(items);
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

  const handleAddItem = () => {
    if (!currentFamily || !user) return;
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }
    
    // Create new shopping item
    const newItem: ShoppingItem = {
      id: `si-${Date.now()}`,
      familyId: currentFamily.id,
      name: newItemName.trim(),
      addedById: user.id,
      isComplete: false,
      addedAt: new Date().toISOString(),
    };
    
    // Save to database
    saveShoppingItem(newItem);
    
    // Update local state
    setShoppingItems(prev => [...prev, newItem]);
    setNewItemName("");
    setIsAddItemOpen(false);
    
    toast({
      title: "Success",
      description: "Item added to shopping list",
    });
  };

  const handleToggleComplete = (itemId: string) => {
    toggleShoppingItemComplete(itemId);
    
    // Update local state
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isComplete: !item.isComplete } 
          : item
      )
    );
  };
  
  const handleDeleteItem = (itemId: string) => {
    deleteShoppingItem(itemId);
    
    // Update local state
    setShoppingItems(prev => prev.filter(item => item.id !== itemId));
    
    toast({
      title: "Success",
      description: "Item removed from shopping list",
    });
  };
  
  // Sort items: incomplete first, then completed
  const sortedItems = [...shoppingItems].sort((a, b) => {
    if (a.isComplete === b.isComplete) return 0;
    return a.isComplete ? 1 : -1;
  });

  return (
    <div className="px-4 pb-20">
      {user && <HomeHeader />}
      <StatusOverview />
      <ChoreList title="Today's Chores" chores={mappedTodayChores} />
      <ChoreList title="Upcoming Chores" chores={mappedUpcomingChores} />
      
      {/* Shopping List Section */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Shopping List</h2>
          <Button 
            size="sm" 
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {sortedItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No items in your shopping list
            </div>
          ) : (
            sortedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center">
                  <button 
                    onClick={() => handleToggleComplete(item.id)}
                    className="mr-3 text-gray-500 hover:text-choresync-blue transition-colors"
                  >
                    {item.isComplete ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <span className={`flex-1 ${item.isComplete ? 'line-through text-gray-500' : ''}`}>
                    {item.name}
                  </span>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shopping Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input 
              placeholder="Item name" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
            <Button onClick={handleAddItem} className="w-full">
              Add to List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
