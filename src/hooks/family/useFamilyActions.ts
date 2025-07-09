
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { User, Family } from '@/types/auth.types';
import { updateMemberInfo } from '@/services/familyMemberService';

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
      
      // Update current family in database first
      const { error } = await supabase
        .from('profiles')
        .update({ current_family_id: familyId })
        .eq('id', user.id);

      if (error) {
        console.error('🔴 Error updating current family in database:', error);
        throw error;
      }

      // Find the selected family
      const selectedFamily = families.find(f => f.id === familyId);
      
      if (selectedFamily) {
        // Update local state immediately for responsive UI
        const updatedUser = { ...user, currentFamilyId: familyId };
        setUser(updatedUser);
        setCurrentFamily(selectedFamily);
        
        console.log('🟢 Family switched successfully to:', selectedFamily.name);
        
        toast({
          title: "Family switched",
          description: `Switched to ${selectedFamily.name}`,
        });

        // Refresh data to ensure everything is in sync
        await refreshUserAndFamilies();
      } else {
        console.error('🔴 Selected family not found in families list');
        throw new Error('Selected family not found');
      }
    } catch (error: any) {
      console.error('🔴 Error switching family:', error);
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
      const newInitials = newName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
      
      console.log('🔄 Updating user name:', { oldName: user.name, newName, newInitials });
      
      // Update in profiles table
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          name: newName,
          initials: newInitials
        })
        .eq('id', user.id);

      if (userError) {
        console.error('🔴 Error updating user profile:', userError);
        throw userError;
      }

      // Update user in all families they belong to using family_members table
      for (const familyId of user.families) {
        try {
          await updateMemberInfo(familyId, user.id, newName, newInitials);
          console.log('🟢 Updated member info in family:', familyId);
        } catch (error) {
          console.error('🔴 Error updating member info in family:', familyId, error);
        }
      }

      // Refresh all data from database to reflect changes
      await refreshUserAndFamilies();

      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully",
      });

    } catch (error: any) {
      console.error('🔴 Error updating user name:', error);
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
