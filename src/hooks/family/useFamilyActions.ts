
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
      console.log('🔄 Switching to family:', familyId);
      
      // Update current family in database
      const { error } = await supabase
        .from('profiles')
        .update({ current_family_id: familyId })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating current family:', error);
        throw error;
      }

      // Find the selected family
      const selectedFamily = families.find(f => f.id === familyId);
      
      if (selectedFamily) {
        // Update local state immediately
        const updatedUser = { ...user, currentFamilyId: familyId };
        setUser(updatedUser);
        setCurrentFamily(selectedFamily);
        
        console.log('🟢 Family switched successfully to:', selectedFamily.name);
        
        // Refresh data to ensure sync
        await refreshUserAndFamilies();
        
        toast({
          title: "Family switched",
          description: `Switched to ${selectedFamily.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error switching family:', error);
      toast({
        title: "Error switching family",
        description: error.message || "Failed to switch family",
        variant: "destructive",
      });
    }
  };

  const updateUserName = async (newName: string) => {
    if (!user) return;

    try {
      const newInitials = newName.substring(0, 2).toUpperCase();
      
      // Update in database
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          name: newName,
          initials: newInitials
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update user in all families they belong to
      for (const familyId of user.families) {
        const family = families.find(f => f.id === familyId);
        if (family) {
          const updatedMembers = family.members.map(member => 
            member.userId === user.id 
              ? { ...member, name: newName, initials: newInitials }
              : member
          );

          const { error: familyError } = await supabase
            .from('families')
            .update({ members: updatedMembers })
            .eq('id', familyId);

          if (familyError) {
            console.error('Error updating family member:', familyError);
          }
        }
      }

      // Refresh all data from database
      await refreshUserAndFamilies();

      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully",
      });

    } catch (error: any) {
      console.error('Error updating user name:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return {
    switchFamily,
    updateUserName
  };
};
