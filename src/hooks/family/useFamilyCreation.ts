
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { User, Family } from '@/types/auth.types';

interface FamilyCreationProps {
  user: User | null;
  refreshUserAndFamilies: () => Promise<void>;
}

export const useFamilyCreation = ({ user, refreshUserAndFamilies }: FamilyCreationProps) => {
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
      
      console.log('Creating family with join code:', { familyId, joinCode });
      
      const newFamily: Family = {
        id: familyId,
        name,
        members: [{
          userId: user.id,
          name: user.name,
          initials: user.initials
        }]
      };

      // Save family to database
      const { error: familyError } = await supabase
        .from('families')
        .insert({
          id: familyId,
          name,
          members: newFamily.members,
          join_code: joinCode
        });

      if (familyError) {
        console.error('Error saving family to database:', familyError);
        throw familyError;
      }

      // Update user's families and current family in database
      const updatedUserFamilies = [...user.families, familyId];
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          families: updatedUserFamilies,
          current_family_id: familyId
        })
        .eq('id', user.id);

      if (userError) {
        console.error('Error updating user profile:', userError);
        throw userError;
      }

      // Refresh all data from database to ensure sync
      await refreshUserAndFamilies();

      toast({
        title: "Family created successfully",
        description: `${name} has been created with join code: ${joinCode}`,
      });

      console.log('Family created successfully with join code:', joinCode);
      
      return newFamily;
    } catch (error: any) {
      console.error('Error creating family:', error);
      toast({
        title: "Error creating family",
        description: error.message || "Failed to create family",
        variant: "destructive",
      });
      throw new Error(`Failed to create family: ${error.message}`);
    }
  };

  return {
    createFamily
  };
};
