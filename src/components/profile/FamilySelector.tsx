
import React, { useState, useEffect } from 'react';
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
import { Plus, Users, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integration/supabase/clients';

const FamilySelector = () => {
  const { families, currentFamily, switchFamily, createFamily } = useAuth();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isLoadingJoinCode, setIsLoadingJoinCode] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async () => {
    if (newFamilyName.trim()) {
      await createFamily(newFamilyName);
      setNewFamilyName('');
      setIsDialogOpen(false);
    }
  };

  const loadJoinCode = async () => {
    if (!currentFamily) return;
    
    setIsLoadingJoinCode(true);
    try {
      const { data: family, error } = await supabase
        .from('families')
        .select('join_code')
        .eq('id', currentFamily.id)
        .single();

      if (error) throw error;
      
      setJoinCode(family.join_code || '');
    } catch (error) {
      console.error('Error loading join code:', error);
      toast({
        title: "Error",
        description: "Failed to load join code.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingJoinCode(false);
    }
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      toast({
        title: "Join code copied!",
        description: "Share this code with others to invite them to your family.",
      });
    }
  };

  useEffect(() => {
    if (currentFamily) {
      loadJoinCode();
    }
  }, [currentFamily]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Family</h2>
          <div className="flex gap-2">
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
                    {family.name} ({family.members.length} members)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentFamily && (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Family Join Code</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyJoinCode}
                  disabled={isLoadingJoinCode || !joinCode}
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </Button>
              </div>
              <div className="text-lg font-mono bg-white rounded px-3 py-2 border">
                {isLoadingJoinCode ? "Loading..." : joinCode || "No code available"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this code with others to invite them to your family
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Family Members</h3>
              <div className="flex flex-wrap gap-2">
                {currentFamily.members.map((member) => (
                  <div key={member.userId} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <div className="w-6 h-6 bg-choresync-blue text-white rounded-full flex items-center justify-center text-xs mr-2">
                      {member.initials}
                    </div>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FamilySelector;
