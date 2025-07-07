
import { supabase } from '@/integration/supabase/clients';
import type { Database } from '@/integration/supabase/types';

// Type aliases for easier reference
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type FamilyRow = Database['public']['Tables']['families']['Row'];
type FamilyInsert = Database['public']['Tables']['families']['Insert'];
type ChoreRow = Database['public']['Tables']['chores']['Row'];
type ChoreInsert = Database['public']['Tables']['chores']['Insert'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type ShoppingItemRow = Database['public']['Tables']['shopping_items']['Row'];
type ShoppingItemInsert = Database['public']['Tables']['shopping_items']['Insert'];

// Local types that match the existing localStorage interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  password?: string;
  families: string[];
  currentFamilyId: string | null;
}

export interface Family {
  id: string;
  name: string;
  members: {
    userId: string;
    name: string;
    initials: string;
  }[];
}

export interface Chore {
  id: string;
  title: string;
  familyId: string;
  assignedUserId: string;
  dueDate: string;
  isComplete: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  familyId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ShoppingItem {
  id: string;
  familyId: string;
  name: string;
  addedById: string;
  isComplete: boolean;
  addedAt: string;
}

// Helper functions
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Mapping functions between Supabase and local types
const mapProfileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.name,
  initials: profile.initials,
  families: profile.families || [],
  currentFamilyId: profile.current_family_id,
});

const mapUserToProfileInsert = (user: User): ProfileInsert => ({
  id: user.id,
  email: user.email,
  name: user.name,
  initials: user.initials,
  families: user.families,
  current_family_id: user.currentFamilyId,
});

const mapFamilyRowToFamily = (familyRow: FamilyRow): Family => ({
  id: familyRow.id,
  name: familyRow.name,
  members: (familyRow.members as any) || [],
});

const mapChoreRowToChore = (choreRow: ChoreRow): Chore => ({
  id: choreRow.id,
  title: choreRow.title,
  familyId: choreRow.family_id,
  assignedUserId: choreRow.assigned_user_id,
  dueDate: choreRow.due_date,
  isComplete: choreRow.is_complete,
  createdAt: choreRow.created_at,
});

const mapChoreToChoreInsert = (chore: Chore): ChoreInsert => ({
  id: chore.id,
  title: chore.title,
  family_id: chore.familyId,
  assigned_user_id: chore.assignedUserId,
  due_date: chore.dueDate,
  is_complete: chore.isComplete,
  created_at: chore.createdAt,
});

const mapMessageRowToMessage = (messageRow: MessageRow): Message => ({
  id: messageRow.id,
  familyId: messageRow.family_id,
  senderId: messageRow.sender_id,
  text: messageRow.text,
  timestamp: messageRow.timestamp,
});

const mapShoppingItemRowToShoppingItem = (itemRow: ShoppingItemRow): ShoppingItem => ({
  id: itemRow.id,
  familyId: itemRow.family_id,
  name: itemRow.name,
  addedById: itemRow.added_by_id,
  isComplete: itemRow.is_complete,
  addedAt: itemRow.added_at,
});

// User/Profile functions
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) throw new Error(`Failed to get users: ${error.message}`);
  return data.map(mapProfileToUser);
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw new Error(`Failed to get user by ID: ${error.message}`);
  }
  
  return mapProfileToUser(data);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
  
  return mapProfileToUser(data);
};

export const saveUser = async (user: User): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(mapUserToProfileInsert(user))
    .select()
    .single();
  
  if (error) throw new Error(`Failed to save user: ${error.message}`);
  return mapProfileToUser(data);
};

// Family functions
export const getFamilies = async (): Promise<Family[]> => {
  const { data, error } = await supabase
    .from('families')
    .select('*');
  
  if (error) throw new Error(`Failed to get families: ${error.message}`);
  return data.map(mapFamilyRowToFamily);
};

export const getFamilyById = async (familyId: string): Promise<Family | null> => {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw new Error(`Failed to get family by ID: ${error.message}`);
  }
  
  return mapFamilyRowToFamily(data);
};

export const saveFamily = async (family: Family): Promise<Family> => {
  const { data, error } = await supabase
    .from('families')
    .upsert({
      id: family.id,
      name: family.name,
      members: family.members,
    })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to save family: ${error.message}`);
  return mapFamilyRowToFamily(data);
};

export const addUserToFamily = async (
  userId: string,
  userName: string,
  userInitials: string,
  familyId: string
): Promise<void> => {
  // Get current family
  const family = await getFamilyById(familyId);
  if (!family) throw new Error('Family not found');
  
  // Check if user is already a member
  const memberExists = family.members.some(m => m.userId === userId);
  if (memberExists) return;
  
  // Add user to family members
  const updatedMembers = [
    ...family.members,
    { userId, name: userName, initials: userInitials }
  ];
  
  const { error } = await supabase
    .from('families')
    .update({
      members: updatedMembers,
    })
    .eq('id', familyId);
  
  if (error) throw new Error(`Failed to add user to family: ${error.message}`);
};

// Chore functions
export const getChores = async (): Promise<Chore[]> => {
  const { data, error } = await supabase
    .from('chores')
    .select('*');
  
  if (error) throw new Error(`Failed to get chores: ${error.message}`);
  return data.map(mapChoreRowToChore);
};

export const getChoresByFamilyId = async (familyId: string): Promise<Chore[]> => {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('family_id', familyId);
  
  if (error) throw new Error(`Failed to get chores by family ID: ${error.message}`);
  return data.map(mapChoreRowToChore);
};

export const getChoresByDate = async (familyId: string, date: string): Promise<Chore[]> => {
  const chores = await getChoresByFamilyId(familyId);
  return chores.filter(chore => {
    const choreDate = new Date(chore.dueDate).toDateString();
    const targetDate = new Date(date).toDateString();
    return choreDate === targetDate;
  });
};

export const saveChore = async (chore: Chore): Promise<Chore> => {
  const { data, error } = await supabase
    .from('chores')
    .upsert(mapChoreToChoreInsert(chore))
    .select()
    .single();
  
  if (error) throw new Error(`Failed to save chore: ${error.message}`);
  return mapChoreRowToChore(data);
};

export const deleteChore = async (choreId: string): Promise<void> => {
  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', choreId);
  
  if (error) throw new Error(`Failed to delete chore: ${error.message}`);
};

export const toggleChoreCompletion = async (choreId: string): Promise<Chore | null> => {
  // First get the current chore
  const { data: currentChore, error: selectError } = await supabase
    .from('chores')
    .select('*')
    .eq('id', choreId)
    .single();
  
  if (selectError) {
    if (selectError.code === 'PGRST116') return null;
    throw new Error(`Failed to get chore: ${selectError.message}`);
  }
  
  // Toggle completion status
  const { data, error } = await supabase
    .from('chores')
    .update({ is_complete: !currentChore.is_complete })
    .eq('id', choreId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to toggle chore completion: ${error.message}`);
  return mapChoreRowToChore(data);
};

// Message functions
export const getMessages = async (): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: true });
  
  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return data.map(mapMessageRowToMessage);
};

export const getMessagesByFamilyId = async (familyId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('family_id', familyId)
    .order('timestamp', { ascending: true });
  
  if (error) throw new Error(`Failed to get messages by family ID: ${error.message}`);
  return data.map(mapMessageRowToMessage);
};

export const saveMessage = async (message: Message): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      id: message.id,
      family_id: message.familyId,
      sender_id: message.senderId,
      text: message.text,
      timestamp: message.timestamp,
    })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to save message: ${error.message}`);
  return mapMessageRowToMessage(data);
};

// Shopping item functions
export const getShoppingItems = async (): Promise<ShoppingItem[]> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*');
  
  if (error) throw new Error(`Failed to get shopping items: ${error.message}`);
  return data.map(mapShoppingItemRowToShoppingItem);
};

export const getShoppingItemsByFamilyId = async (familyId: string): Promise<ShoppingItem[]> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('family_id', familyId);
  
  if (error) throw new Error(`Failed to get shopping items by family ID: ${error.message}`);
  return data.map(mapShoppingItemRowToShoppingItem);
};

export const saveShoppingItem = async (item: ShoppingItem): Promise<ShoppingItem> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .upsert({
      id: item.id,
      family_id: item.familyId,
      name: item.name,
      added_by_id: item.addedById,
      is_complete: item.isComplete,
      added_at: item.addedAt,
    })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to save shopping item: ${error.message}`);
  return mapShoppingItemRowToShoppingItem(data);
};

export const toggleShoppingItemComplete = async (itemId: string): Promise<ShoppingItem | null> => {
  // First get the current item
  const { data: currentItem, error: selectError } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('id', itemId)
    .single();
  
  if (selectError) {
    if (selectError.code === 'PGRST116') return null;
    throw new Error(`Failed to get shopping item: ${selectError.message}`);
  }
  
  // Toggle completion status
  const { data, error } = await supabase
    .from('shopping_items')
    .update({ is_complete: !currentItem.is_complete })
    .eq('id', itemId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to toggle shopping item completion: ${error.message}`);
  return mapShoppingItemRowToShoppingItem(data);
};

export const deleteShoppingItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', itemId);
  
  if (error) throw new Error(`Failed to delete shopping item: ${error.message}`);
};

// Cleanup function (kept for compatibility but not needed with database)
export const cleanupShoppingItems = async (): Promise<void> => {
  // In database version, we can implement automatic cleanup with SQL
  // For now, keep empty for compatibility
  console.log('Shopping items cleanup - not needed with database storage');
};

// Auth helper functions
export const validateUserCredentials = async (email: string, password: string): Promise<User | null> => {
  const user = await getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};
