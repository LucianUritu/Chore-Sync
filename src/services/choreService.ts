import { supabase } from '@/integration/supabase/clients';
import type { Database } from '@/integration/supabase/types';
import type { Chore } from '@/services/types';

type ChoreInsert = Database['public']['Tables']['chores']['Insert'];

export const getChoresByFamilyId = async (familyId: string): Promise<Chore[]> => {
  try {
    const { data, error } = await supabase
      .from('chores')
      .select('*')
      .eq('family_id', familyId)
      .order('due_date', { ascending: true });

    if (error) throw error;

    return (data || []).map(chore => ({
      id: chore.id,
      title: chore.title,
      familyId: chore.family_id,
      assignedUserId: chore.assigned_user_id,
      dueDate: chore.due_date,
      isComplete: chore.is_complete,
      createdAt: chore.created_at
    }));
  } catch (error: any) {
    console.error('Error getting chores:', error);
    throw new Error(`Failed to get chores: ${error.message}`);
  }
};

export const getChoresByDate = async (familyId: string, date: string): Promise<Chore[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('chores')
      .select('*')
      .eq('family_id', familyId)
      .gte('due_date', startOfDay.toISOString())
      .lte('due_date', endOfDay.toISOString())
      .order('due_date', { ascending: true });

    if (error) throw error;

    return (data || []).map(chore => ({
      id: chore.id,
      title: chore.title,
      familyId: chore.family_id,
      assignedUserId: chore.assigned_user_id,
      dueDate: chore.due_date,
      isComplete: chore.is_complete,
      createdAt: chore.created_at
    }));
  } catch (error: any) {
    console.error('Error getting chores by date:', error);
    throw new Error(`Failed to get chores by date: ${error.message}`);
  }
};

export const saveChore = async (chore: Omit<Chore, 'id' | 'createdAt'>): Promise<void> => {
  try {
    console.log('Saving chore:', chore);
    
    // Get the current user and session details
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }
    
    console.log('Current user:', user.id);
    console.log('Attempting to verify family:', chore.familyId);
    
    // Verify the family exists
    const { data: existingFamily, error: familyError } = await supabase
      .from('families')
      .select('id, name')
      .eq('id', chore.familyId)
      .single();
    
    if (familyError) {
      console.error('Family lookup error:', familyError);
      throw new Error('Family not found. Please refresh the app and try again.');
    }
    
    console.log('Family found:', existingFamily.name);
    
    // Generate a UUID for the chore
    const choreId = crypto.randomUUID();
    
    const choreData: ChoreInsert = {
      id: choreId,
      title: chore.title,
      family_id: chore.familyId,
      assigned_user_id: chore.assignedUserId,
      due_date: chore.dueDate,
      is_complete: chore.isComplete
    };
    
    console.log('Inserting chore data:', choreData);
    
    const { error } = await supabase
      .from('chores')
      .insert(choreData);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Chore saved successfully');
  } catch (error: any) {
    console.error('Error saving chore:', error);
    throw new Error(`Failed to save chore: ${error.message}`);
  }
};

export const toggleChoreCompletion = async (choreId: string): Promise<Chore | null> => {
  try {
    // First get the current chore
    const { data: currentChore, error: fetchError } = await supabase
      .from('chores')
      .select('*')
      .eq('id', choreId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the completion status
    const { data, error } = await supabase
      .from('chores')
      .update({ is_complete: !currentChore.is_complete })
      .eq('id', choreId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      familyId: data.family_id,
      assignedUserId: data.assigned_user_id,
      dueDate: data.due_date,
      isComplete: data.is_complete,
      createdAt: data.created_at
    };
  } catch (error: any) {
    console.error('Error toggling chore completion:', error);
    throw new Error(`Failed to toggle chore completion: ${error.message}`);
  }
};
