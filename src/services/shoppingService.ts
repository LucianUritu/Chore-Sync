import { supabase } from '@/integration/supabase/clients';
import type { Database } from '@/integration/supabase/types';
import type { ShoppingItem } from '@/services/types';

type ShoppingItemInsert = Database['public']['Tables']['shopping_items']['Insert'];

export const getShoppingItemsByFamilyId = async (familyId: string): Promise<ShoppingItem[]> => {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('family_id', familyId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      familyId: item.family_id,
      addedByUserId: item.added_by_id,
      isComplete: item.is_complete,
      addedAt: item.added_at
    }));
  } catch (error: any) {
    console.error('Error getting shopping items:', error);
    throw new Error(`Failed to get shopping items: ${error.message}`);
  }
};

export const saveShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'addedAt'>): Promise<void> => {
  try {
    const itemData: ShoppingItemInsert = {
      name: item.name,
      family_id: item.familyId,
      added_by_id: item.addedByUserId,
      is_complete: item.isComplete
    };

    const { error } = await supabase
      .from('shopping_items')
      .insert(itemData);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error saving shopping item:', error);
    throw new Error(`Failed to save shopping item: ${error.message}`);
  }
};

export const toggleShoppingItemComplete = async (itemId: string): Promise<void> => {
  try {
    // First get the current item
    const { data: currentItem, error: fetchError } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the completion status
    const { error } = await supabase
      .from('shopping_items')
      .update({ is_complete: !currentItem.is_complete })
      .eq('id', itemId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error toggling shopping item completion:', error);
    throw new Error(`Failed to toggle shopping item completion: ${error.message}`);
  }
};

export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting shopping item:', error);
    throw new Error(`Failed to delete shopping item: ${error.message}`);
  }
};
