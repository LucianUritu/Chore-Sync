
import { User, Family } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';
import { 
  saveFamily, 
  getFamilies,
  saveUser,
  getInitials 
} from '@/services/database';

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
    
    // Create new family
    const newFamily: Family = {
      id: `f-${Date.now()}`,
      name,
      members: [{
        userId: user.id,
        name: user.name,
        initials: user.initials
      }]
    };
    
    // Save the family
    await saveFamily(newFamily);
    
    // Update user's families
    const updatedUser = {
      ...user,
      families: [...user.families, newFamily.id],
      currentFamilyId: newFamily.id
    };
    
    await saveUser(updatedUser);
    setUser(updatedUser);
    
    // Update families list and current family
    const updatedFamilies = [...families, newFamily];
    setFamilies(updatedFamilies);
    setCurrentFamily(newFamily);
    
    toast({
      title: "Family Created",
      description: `${name} has been created successfully.`,
    });
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
