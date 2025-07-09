
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
import { Plus, Users, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integration/supabase/clients';

const FamilySelector = () => {
  const { families, currentFamily, switchFamily, createFamily } = useAuth();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isLoadingJoinCode, setIsLoadingJoinCode] = useState(false);
  const [joinCodeCache, setJoinCodeCache] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async () => {
    if (newFamilyName.trim()) {
      try {
        console.log('Creating family:', newFamilyName);
        await createFamily(newFamilyName);
        
        setNewFamilyName('');
        setIsDialogOpen(false);
        
        // Note: join code will be loaded automatically via useEffect when currentFamily changes
      } catch (error) {
        console.error('Error creating family:', error);
      }
    }
  };

  const loadJoinCodeForFamily = async (familyId: string) => {
    // Check cache first
    if (joinCodeCache[familyId]) {
      setJoinCode(joinCodeCache[familyId]);
      return;
    }

    setIsLoadingJoinCode(true);
    try {
      console.log('Loading join code for family:', familyId);
      const { data: family, error } = await supabase
        .from('families')
        .select('join_code')
        .eq('id', familyId)
        .single();

      if (error) {
        console.error('Error loading join code:', error);
        setJoinCode('');
      } else {
        const code = family?.join_code || '';
        setJoinCode(code);
        // Cache the join code
        setJoinCodeCache(prev => ({
          ...prev,
          [familyId]: code
        }));
        console.log('Join code loaded and cached:', code);
      }
    } catch (error) {
      console.error('Error loading join code:', error);
      setJoinCode('');
    } finally {
      setIsLoadingJoinCode(false);
    }
  };

  const refreshFamilyData = async () => {
    if (!currentFamily?.id) return;
    
    setIsRefreshing(true);
    try {
      // Force refresh the family data from database
      const { data: familyData, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', currentFamily.id)
        .single();

      if (error) {
        console.error('Error refreshing family data:', error);
        toast({
          title: "Error",
          description: "Failed to refresh family data",
          variant: "destructive",
        });
      } else {
        console.log('Refreshed family data:', familyData);
        toast({
          title: "Family data refreshed",
          description: "Member list has been updated",
        });
        
        // The real-time subscriptions should pick up the changes automatically
        // But we can trigger a manual refresh if needed
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing family data:', error);
    } finally {
      setIsRefreshing(false);
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

  // Load join code when current family changes
  useEffect(() => {
    console.log('FamilySelector - useEffect triggered:', {
      currentFamilyId: currentFamily?.id,
      familiesCount: families.length,
      currentFamily: currentFamily?.name,
      membersCount: currentFamily?.members?.length || 0
    });
    
    if (currentFamily?.id) {
      console.log('Current family changed, loading join code for:', currentFamily.id);
      loadJoinCodeForFamily(currentFamily.id);
    } else {
      setJoinCode('');
    }
  }, [currentFamily?.id, families.length]); // Also depend on families.length to trigger when families update

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Family</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFamilyData}
              disabled={isRefreshing || !currentFamily}
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                    {family.name} ({family.members?.length || 0} members)
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Family Members ({currentFamily.members?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentFamily.members && currentFamily.members.length > 0 ? (
                  currentFamily.members.map((member) => (
                    <div key={member.userId} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 bg-choresync-blue text-white rounded-full flex items-center justify-center text-xs mr-2">
                        {member.initials}
                      </div>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No members found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FamilySelector;
