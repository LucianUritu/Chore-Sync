import { supabase } from '@/integration/supabase/clients';
import type { Database } from '@/integration/supabase/types';
import type { Message } from '@/services/types';

type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export const getMessagesByFamilyId = async (familyId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('family_id', familyId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return (data || []).map(message => ({
      id: message.id,
      familyId: message.family_id,
      senderId: message.sender_id,
      text: message.text,
      timestamp: message.timestamp
    }));
  } catch (error: any) {
    console.error('Error getting messages:', error);
    throw new Error(`Failed to get messages: ${error.message}`);
  }
};

export const saveMessage = async (message: Omit<Message, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const messageData: MessageInsert = {
      family_id: message.familyId,
      sender_id: message.senderId,
      text: message.text
    };

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error saving message:', error);
    throw new Error(`Failed to save message: ${error.message}`);
  }
};
