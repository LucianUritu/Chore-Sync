
import { supabase } from '@/integration/supabase/clients';

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  initials: string;
  joined_at: string;
}

export const addMemberToFamily = async (familyId: string, userId: string, name: string, initials: string): Promise<void> => {
  console.log('Adding member to family:', { familyId, userId, name, initials });
  
  try {
    const { error } = await supabase
      .from('family_members')
      .insert({
        family_id: familyId,
        user_id: userId,
        name,
        initials
      });

    if (error) {
      console.error('Detailed error adding member to family:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error
      });
      throw new Error(`Failed to add member to family: ${error.message || 'Unknown database error'}`);
    }
    
    console.log('Successfully added member to family');
  } catch (err: any) {
    console.error('Catch block error:', err);
    throw err;
  }
};

export const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId);

    if (error) {
      console.error('Error getting family members:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to get family members: ${error.message || 'Unknown database error'}`);
    }

    return data || [];
  } catch (err: any) {
    console.error('Catch block error in getFamilyMembers:', err);
    return [];
  }
};

export const removeMemberFromFamily = async (familyId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('family_id', familyId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing member from family:', error);
    throw new Error(`Failed to remove member from family: ${error.message || 'Unknown database error'}`);
  }
};

export const updateMemberInfo = async (familyId: string, userId: string, name: string, initials: string): Promise<void> => {
  const { error } = await supabase
    .from('family_members')
    .update({ name, initials })
    .eq('family_id', familyId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating member info:', error);
    throw new Error(`Failed to update member info: ${error.message || 'Unknown database error'}`);
  }
};
