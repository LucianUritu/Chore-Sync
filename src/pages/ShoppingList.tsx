import React, { useState, useEffect } from "react";
import { Plus, Check, Circle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { 
  getShoppingItemsByFamilyId, 
  saveShoppingItem, 
  toggleShoppingItemComplete, 
  deleteShoppingItem,
  ShoppingItem 
} from "@/services/database";
import { useToast } from "@/hooks/use-toast";

const ShoppingList = () => {
  const { currentFamily, user } = useAuth();
  const { toast } = useToast();
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  
  useEffect(() => {
    if (!currentFamily) return;
    
    // Load shopping items for current family
    const items = getShoppingItemsByFamilyId(currentFamily.id);
    setShoppingItems(items);
  }, [currentFamily]);

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
    <div className="container max-w-md mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping List</h1>
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

export default ShoppingList;
