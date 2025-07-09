
import { supabase } from '@/integration/supabase/clients';
import { User, Family } from '@/types/auth.types';
import { getFamilyMembers } from '@/services/familyMemberService';

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

// Family Operations - Updated to use family_members table exclusively
export const getFamilies = async (): Promise<Family[]> => {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('id, name');
    
    if (error) throw error;
    
    // Get members for each family from the family_members table
    const families = await Promise.all((data || []).map(async (family) => {
      console.log('🔵 Loading members for family:', family.name, family.id);
      const members = await getFamilyMembers(family.id);
      console.log('🔵 Found members:', members.length, 'for family:', family.name);
      
      return {
        id: family.id,
        name: family.name,
        members: members.map(member => ({
          userId: member.user_id,
          name: member.name,
          initials: member.initials
        }))
      };
    }));
    
    console.log('🟢 Successfully loaded all families with members from family_members table');
    return families;
  } catch (error: any) {
    console.error('Error getting families:', error);
    throw new Error(`Failed to get families: ${error.message}`);
  }
};

export const saveFamily = async (family: Family): Promise<void> => {
  try {
    // Only save family basic info, members are handled separately in family_members table
    const { error } = await supabase
      .from('families')
      .upsert({
        id: family.id,
        name: family.name
      });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error saving family:', error);
    throw new Error(`Failed to save family: ${error.message}`);
  }
};

export const getFamilyById = async (familyId: string): Promise<Family | null> => {
  try {
    console.log('🔵 Getting family by ID:', familyId);
    
    const { data, error } = await supabase
      .from('families')
      .select('id, name')
      .eq('id', familyId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    // Get members from the family_members table
    console.log('🔵 Loading members for family:', data.name);
    const members = await getFamilyMembers(familyId);
    console.log('🔵 Found members:', members.length, 'for family:', data.name);
    
    return {
      id: data.id,
      name: data.name,
      members: members.map(member => ({
        userId: member.user_id,
        name: member.name,
        initials: member.initials
      }))
    };
  } catch (error: any) {
    console.error('Error getting family by ID:', error);
    return null;
  }
};
