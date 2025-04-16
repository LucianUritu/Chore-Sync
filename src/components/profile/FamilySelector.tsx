
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Plus, Users } from 'lucide-react';

const FamilySelector = () => {
  const { families, currentFamily, switchFamily, createFamily } = useAuth();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateFamily = async () => {
    if (newFamilyName.trim()) {
      await createFamily(newFamilyName);
      setNewFamilyName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Family</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus size={16} className="mr-2" /> New Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Family</DialogTitle>
                <DialogDescription>
                  Add a new family group to manage tasks together.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Family Name"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFamily}>
                  Create Family
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center">
          <Users size={20} className="mr-3 text-gray-500" />
          <div className="flex-1">
            <Select
              value={currentFamily?.id || ''}
              onValueChange={switchFamily}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a family" />
              </SelectTrigger>
              <SelectContent>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilySelector;