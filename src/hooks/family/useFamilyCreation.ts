
import { supabase } from '@/integration/supabase/clients';
import { useToast } from '@/hooks/use-toast';
import { User, Family } from '@/types/auth.types';
import { addMemberToFamily } from '@/services/familyMemberService';

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
      
      console.log('🔵 Creating family:', { name, familyId, joinCode });

      // Save family to database first
      const { error: familyError } = await supabase
        .from('families')
        .insert({
          id: familyId,
          name,
          join_code: joinCode
        });

      if (familyError) {
        console.error('🔴 Error saving family to database:', familyError);
        throw familyError;
      }

      console.log('🟢 Family saved to database successfully');

      // Add creator as first family member (this is now the primary source of truth)
      await addMemberToFamily(familyId, user.id, user.name, user.initials);
      console.log('🟢 Added creator as family member');

      // Try to update user profile preference but don't fail if RLS blocks it
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            current_family_id: familyId
          })
          .eq('id', user.id);

        if (updateError) {
          console.log('🟡 Could not update profile preference (RLS), but family was created:', updateError.message);
        } else {
          console.log('🟢 Updated user profile with new family preference');
        }
      } catch (profileError: any) {
        console.log('🟡 Profile preference update failed, but family was created successfully:', profileError.message);
      }

      // Refresh all data from database to ensure sync
      await refreshUserAndFamilies();

      toast({
        title: "Family created successfully",
        description: `${name} has been created with join code: ${joinCode}`,
      });

      console.log('🟢 Family creation completed successfully');
      
      const newFamily: Family = {
        id: familyId,
        name,
        members: [{
          userId: user.id,
          name: user.name,
          initials: user.initials
        }]
      };
      
      return newFamily;
    } catch (error: any) {
      console.error('🔴 Error creating family:', error);
      toast({
        title: "Error creating family",
        description: error.message || "Failed to create family",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    createFamily
  };
};
