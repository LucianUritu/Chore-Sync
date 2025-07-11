
import React, { useState } from "react";
import { Plus, Circle, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { 
  saveShoppingItem, 
  toggleShoppingItemComplete, 
  deleteShoppingItem 
} from "@/services/shoppingService";
import type { ShoppingItem } from "@/services/types";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListProps {
  shoppingItems: ShoppingItem[];
  onItemsChange: () => void;
}

const ShoppingList = ({ shoppingItems, onItemsChange }: ShoppingListProps) => {
  const { currentFamily, user } = useAuth();
  const { toast } = useToast();
  const [newItemName, setNewItemName] = useState("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Show only first 3 items for home view
  const displayItems = shoppingItems.slice(0, 3);
  // Sort items: incomplete first, then completed
  const sortedItems = [...displayItems].sort((a, b) => {
    if (a.isComplete === b.isComplete) return 0;
    return a.isComplete ? 1 : -1;
  });

  const handleAddItem = async () => {
    if (!currentFamily || !user) {
      console.error('🔴 Missing currentFamily or user:', { currentFamily: !!currentFamily, user: !!user });
      toast({
        title: "Error",
        description: "Please make sure you're logged in and have selected a family",
        variant: "destructive",
      });
      return;
    }
    
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔵 Adding shopping item:', {
        name: newItemName.trim(),
        familyId: currentFamily.id,
        userId: user.id
      });

      await saveShoppingItem({
        name: newItemName.trim(),
        familyId: currentFamily.id,
        addedByUserId: user.id,
        isComplete: false
      });
      
      setNewItemName("");
      setIsAddItemOpen(false);
      onItemsChange();
      
      toast({
        title: "Success",
        description: "Item added to shopping list",
      });
    } catch (error) {
      console.error('🔴 Error adding shopping item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (itemId: string) => {
    try {
      console.log('🔵 Toggling item completion:', itemId);
      await toggleShoppingItemComplete(itemId);
      onItemsChange();
    } catch (error) {
      console.error('🔴 Error toggling item completion:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      console.log('🔵 Deleting item:', itemId);
      await deleteShoppingItem(itemId);
      onItemsChange();
      
      toast({
        title: "Success",
        description: "Item removed from shopping list",
      });
    } catch (error) {
      console.error('🔴 Error deleting item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Shopping List</h2>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center"
            disabled={isLoading}
          >
            <Plus size={16} className="mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
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
        
        {shoppingItems.length > 3 && (
          <div className="text-center text-sm text-gray-500">
            +{shoppingItems.length - 3} more items
          </div>
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
              disabled={isLoading}
            />
            <Button 
              onClick={handleAddItem} 
              className="w-full"
              disabled={isLoading || !newItemName.trim()}
            >
              {isLoading ? "Adding..." : "Add to List"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;
