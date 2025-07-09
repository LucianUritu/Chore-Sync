
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { User, Family } from '@/types/auth.types';

interface FamilyActionsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  families: Family[];
  setFamilies: (families: Family[]) => void;
  currentFamily: Family | null;
  setCurrentFamily: (family: Family | null) => void;
  refreshUserAndFamilies: () => Promise<void>;
}

export const useFamilyActions = ({
  user,
  setUser,
  families,
  setFamilies,
  currentFamily,
  setCurrentFamily,
  refreshUserAndFamilies
}: FamilyActionsProps) => {
  const { toast } = useToast();

  const switchFamily = async (familyId: string) => {
    if (!user) return;

    try {
      // Update current family in database
      const { error } = await supabase
        .from('profiles')
        .update({ current_family_id: familyId })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh all data from database
      await refreshUserAndFamilies();

      const family = families.find(f => f.id === familyId);
      console.log('Switched to family:', family);

      toast({
        title: "Family switched",
        description: `Switched to ${family?.name || 'family'}`,
      });
    } catch (error: any) {
      console.error('Error switching family:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to switch family",
        variant: "destructive",
      });
    }
  };

  const updateUserName = async (newName: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to update name');
    }

    try {
      const newInitials = newName.substring(0, 2).toUpperCase();
      
      // Update user in database
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          name: newName,
          initials: newInitials
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update user in all families
      for (const family of families) {
        const updatedMembers = family.members.map(member =>
          member.userId === user.id
            ? { ...member, name: newName, initials: newInitials }
            : member
        );

        const { error: familyError } = await supabase
          .from('families')
          .update({ members: updatedMembers })
          .eq('id', family.id);

        if (familyError) throw familyError;
      }

      // Update state
      const updatedUser = { ...user, name: newName, initials: newInitials };
      setUser(updatedUser);

      const updatedFamilies = families.map(family => ({
        ...family,
        members: family.members.map(member =>
          member.userId === user.id
            ? { ...member, name: newName, initials: newInitials }
            : member
        )
      }));
      setFamilies(updatedFamilies);

      if (currentFamily) {
        const updatedCurrentFamily = updatedFamilies.find(f => f.id === currentFamily.id);
        if (updatedCurrentFamily) {
          setCurrentFamily(updatedCurrentFamily);
        }
      }

      toast({
        title: "Name updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating user name:', error);
      throw new Error(`Failed to update name: ${error.message}`);
    }
  };

  return {
    switchFamily,
    updateUserName
  };
};
