
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { User, Family } from '@/types/auth.types';

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateJoinCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createFamily = async (name: string): Promise<Family | undefined> => {
    if (!user) {
      throw new Error('User must be logged in to create a family');
    }

    try {
      const familyId = crypto.randomUUID();
      const joinCode = generateJoinCode();
      
      const newFamily: Family = {
        id: familyId,
        name,
        members: [{
          userId: user.id,
          name: user.name,
          initials: user.initials
        }]
      };

      // Save family to Supabase with join code
      const { error: familyError } = await supabase
        .from('families')
        .insert({
          id: familyId,
          name,
          members: newFamily.members,
          join_code: joinCode
        });

      if (familyError) throw familyError;

      // Update user's families and current family
      const updatedFamilies = [...families, newFamily];
      const updatedUser = {
        ...user,
        families: [...user.families, familyId],
        currentFamilyId: familyId
      };

      // Update user in database
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          families: updatedUser.families,
          current_family_id: familyId
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update state
      setUser(updatedUser);
      setFamilies(updatedFamilies);
      setCurrentFamily(newFamily);

      console.log('Family created successfully with join code:', joinCode);
      
      return newFamily;
    } catch (error: any) {
      console.error('Error creating family:', error);
      throw new Error(`Failed to create family: ${error.message}`);
    }
  };

  const switchFamily = async (familyId: string) => {
    if (!user) return;

    try {
      const family = families.find(f => f.id === familyId);
      if (!family) {
        throw new Error('Family not found');
      }

      // Update current family in database
      const { error } = await supabase
        .from('profiles')
        .update({ current_family_id: familyId })
        .eq('id', user.id);

      if (error) throw error;

      // Update state
      setCurrentFamily(family);
      setUser({ ...user, currentFamilyId: familyId });

      toast({
        title: "Family switched",
        description: `Switched to ${family.name}`,
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
    createFamily,
    switchFamily,
    updateUserName
  };
};
