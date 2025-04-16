import { User, Family } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';
import { 
  saveFamily, 
  getFamilies,
  saveUser,
  getInitials 
} from '@/services/database';
import { supabase } from '@/integration/supabase/clients';

interface FamilyMethodsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
}

export const useFamilyMethods = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily
}: FamilyMethodsProps) => {
  const { toast } = useToast();

  const createFamily = async (name: string) => {
    if (!user) return;
    
    try {
      console.log("Creating family for user:", user.id, "with name:", name);
      
      // Create new family with UUID for proper database integration
      const newFamily: Family = {
        id: `f-${Date.now()}`,
        name,
        members: [{
          userId: user.id,
          name: user.name,
          initials: user.initials
        }]
      };
      
      // Save the family to Supabase
      console.log("Saving family to Supabase:", newFamily);
      await saveFamily(newFamily);
      
      // Update user's families array and current family
      const updatedUser = {
        ...user,
        families: [...user.families, newFamily.id],
        currentFamilyId: newFamily.id
      };
      
      // Save updated user to Supabase
      console.log("Updating user with new family:", updatedUser);
      await saveUser(updatedUser);
      setUser(updatedUser);
      
      // Update local state
      const updatedFamilies = [...families, newFamily];
      setFamilies(updatedFamilies);
      setCurrentFamily(newFamily);
      
      toast({
        title: "Family Created",
        description: `${name} has been created successfully.`,
      });
      
      return newFamily;
    } catch (error: any) {
      console.error("Error creating family:", error);
      toast({
        title: "Error Creating Family",
        description: error.message || "Failed to create family. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const switchFamily = async (familyId: string) => {
    if (!user) return;
    
    const family = families.find(f => f.id === familyId);
    
    if (family) {
      // Update current family
      setCurrentFamily(family);
      
      // Update user's current family
      const updatedUser = {
        ...user,
        currentFamilyId: familyId,
      };
      
      await saveUser(updatedUser);
      setUser(updatedUser);
      
      toast({
        title: "Family Switched",
        description: `You're now viewing ${family.name}.`,
      });
    }
  };

  const updateUserName = async (newName: string) => {
    if (!user) return;
    
    const newInitials = getInitials(newName);
    
    // Update user in Supabase
    const updatedUser = {
      ...user,
      name: newName,
      initials: newInitials
    };
    
    await saveUser(updatedUser);
    setUser(updatedUser);
    
    // Update user in all families
    const allFamilies = await getFamilies();
    const updatedFamilies = allFamilies.map(family => {
      const memberIndex = family.members.findIndex(m => m.userId === user.id);
      
      if (memberIndex >= 0) {
        const updatedMembers = [...family.members];
        updatedMembers[memberIndex] = {
          ...updatedMembers[memberIndex],
          name: newName,
          initials: newInitials
        };
        
        return {
          ...family,
          members: updatedMembers
        };
      }
      
      return family;
    });
    
    // Save updated families
    for (const family of updatedFamilies) {
      await saveFamily(family);
    }
    
    // Update families state
    const userFamilies = updatedFamilies.filter(f => 
      user.families.includes(f.id)
    );
    setFamilies(userFamilies);
    
    // Update current family
    if (user.currentFamilyId) {
      const currentFam = userFamilies.find(f => f.id === user.currentFamilyId) || null;
      setCurrentFamily(currentFam);
    }
    
    toast({
      title: "Profile Updated",
      description: "Your name has been updated successfully.",
    });
  };

  return {
    createFamily,
    switchFamily,
    updateUserName
  };
};
