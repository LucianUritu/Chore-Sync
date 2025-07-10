
import { supabase } from '@/integration/supabase/clients';
import type { Database } from '@/integration/supabase/types';
import type { Message } from '@/services/types';

type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export const getMessagesByFamilyId = async (familyId: string): Promise<Message[]> => {
  try {
    console.log('🔵 Fetching messages for family:', familyId);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('family_id', familyId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('🔴 Error fetching messages:', error);
      throw error;
    }

    console.log('🟢 Successfully fetched messages:', data?.length || 0);

    return (data || []).map(message => ({
      id: message.id,
      familyId: message.family_id,
      senderId: message.sender_id,
      text: message.text,
      timestamp: message.timestamp
    }));
  } catch (error: any) {
    console.error('🔴 Error getting messages:', error);
    throw new Error(`Failed to get messages: ${error.message}`);
  }
};

export const saveMessage = async (message: Omit<Message, 'id' | 'timestamp'>): Promise<void> => {
  try {
    console.log('🔵 Saving message to database:', message);
    
    const messageData: MessageInsert = {
      family_id: message.familyId,
      sender_id: message.senderId,
      text: message.text,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      console.error('🔴 Error inserting message:', error);
      throw error;
    }
    
    console.log('🟢 Message saved successfully');
  } catch (error: any) {
    console.error('🔴 Error saving message:', error);
    throw new Error(`Failed to save message: ${error.message}`);
  }
};

// Subscribe to real-time message updates for a specific family
export const subscribeToMessages = (familyId: string, onMessageReceived: (message: Message) => void) => {
  console.log('🔵 Setting up real-time subscription for family:', familyId);
  
  const subscription = supabase
    .channel(`messages-${familyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `family_id=eq.${familyId}`
      },
      (payload) => {
        console.log('🟢 New message received:', payload.new);
        
        const newMessage: Message = {
          id: payload.new.id,
          familyId: payload.new.family_id,
          senderId: payload.new.sender_id,
          text: payload.new.text,
          timestamp: payload.new.timestamp
        };
        
        onMessageReceived(newMessage);
      }
    )
    .subscribe();

  return subscription;
};
