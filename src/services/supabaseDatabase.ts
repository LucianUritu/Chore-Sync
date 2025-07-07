
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';

// Helper function to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// User Profile Operations
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      initials: data.initials,
      families: data.families || [],
      currentFamilyId: data.current_family_id
    };
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        initials: user.initials,
        families: user.families,
        current_family_id: user.currentFamilyId
      });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error saving user:', error);
    throw new Error(`Failed to save user: ${error.message}`);
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      initials: data.initials,
      families: data.families || [],
      currentFamilyId: data.current_family_id
    };
  } catch (error: any) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Family Operations
export const getFamilies = async (): Promise<Family[]> => {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('*');
    
    if (error) throw error;
    
    // Convert Supabase data to Family interface with proper type casting
    return (data || []).map(family => ({
      id: family.id,
      name: family.name,
      members: Array.isArray(family.members) 
        ? (family.members as { userId: string; name: string; initials: string; }[])
        : []
    }));
  } catch (error: any) {
    console.error('Error getting families:', error);
    throw new Error(`Failed to get families: ${error.message}`);
  }
};

export const saveFamily = async (family: Family): Promise<void> => {
  try {
    const { error } = await supabase
      .from('families')
      .upsert({
        id: family.id,
        name: family.name,
        members: family.members
      });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error saving family:', error);
    throw new Error(`Failed to save family: ${error.message}`);
  }
};

export const getFamilyById = async (familyId: string): Promise<Family | null> => {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    // Convert Supabase data to Family interface with proper type casting
    return {
      id: data.id,
      name: data.name,
      members: Array.isArray(data.members) 
        ? (data.members as { userId: string; name: string; initials: string; }[])
        : []
    };
  } catch (error: any) {
    console.error('Error getting family by ID:', error);
    return null;
  }
};
