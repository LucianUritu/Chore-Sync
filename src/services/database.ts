// Local storage keys
const USERS_KEY = 'choresync_users';
const FAMILIES_KEY = 'choresync_families';
const CHORES_KEY = 'choresync_chores';
const MESSAGES_KEY = 'choresync_messages';
const SHOPPING_ITEMS_KEY = 'choresync_shopping_items';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  password?: string; // Optional password field
  families: string[]; // Array of family IDs
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
  dueDate: string; // ISO date string
  isComplete: boolean;
  createdAt: string; // ISO date string
}

export interface Message {
  id: string;
  familyId: string;
  senderId: string; 
  text: string;
  timestamp: string; // ISO date string
}

export interface ShoppingItem {
  id: string;
  familyId: string;
  name: string;
  addedById: string;
  isComplete: boolean;
  addedAt: string; // ISO date string
}

// Initialize storage if not exists
const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(FAMILIES_KEY)) {
    localStorage.setItem(FAMILIES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHORES_KEY)) {
    localStorage.setItem(CHORES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(MESSAGES_KEY)) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SHOPPING_ITEMS_KEY)) {
    localStorage.setItem(SHOPPING_ITEMS_KEY, JSON.stringify([]));
  }
};

// Helper to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Get raw shopping items without cleanup
const getRawShoppingItems = (): ShoppingItem[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(SHOPPING_ITEMS_KEY) || '[]');
};

// Clean up completed shopping items from previous days
export const cleanupShoppingItems = () => {
  const items = getRawShoppingItems(); // Use getRawShoppingItems instead of getShoppingItems to avoid infinite recursion
  const today = new Date().toDateString();
  
  const updatedItems = items.filter(item => {
    // Keep incomplete items
    if (!item.isComplete) return true;
    
    // Check if completed item is from a previous day
    const itemDate = new Date(item.addedAt).toDateString();
    return itemDate === today;
  });
  
  if (updatedItems.length < items.length) {
    localStorage.setItem(SHOPPING_ITEMS_KEY, JSON.stringify(updatedItems));
  }
};

// User functions
export const getUsers = (): User[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const saveUser = (user: User): User => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
};

// Family functions
export const getFamilies = (): Family[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(FAMILIES_KEY) || '[]');
};

export const getFamilyById = (familyId: string): Family | null => {
  const families = getFamilies();
  return families.find(family => family.id === familyId) || null;
};

export const saveFamily = (family: Family): Family => {
  const families = getFamilies();
  const existingIndex = families.findIndex(f => f.id === family.id);
  
  if (existingIndex >= 0) {
    families[existingIndex] = family;
  } else {
    families.push(family);
  }
  
  localStorage.setItem(FAMILIES_KEY, JSON.stringify(families));
  return family;
};

export const addUserToFamily = (userId: string, userName: string, userInitials: string, familyId: string): void => {
  const families = getFamilies();
  const familyIndex = families.findIndex(f => f.id === familyId);
  
  if (familyIndex >= 0) {
    const memberExists = families[familyIndex].members.some(m => m.userId === userId);
    
    if (!memberExists) {
      families[familyIndex].members.push({
        userId,
        name: userName,
        initials: userInitials
      });
      localStorage.setItem(FAMILIES_KEY, JSON.stringify(families));
    }
  }
};

// Chore functions
export const getChores = (): Chore[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(CHORES_KEY) || '[]');
};

export const getChoresByFamilyId = (familyId: string): Chore[] => {
  const chores = getChores();
  return chores.filter(chore => chore.familyId === familyId);
};

export const getChoresByDate = (familyId: string, date: string): Chore[] => {
  const chores = getChoresByFamilyId(familyId);
  return chores.filter(chore => {
    const choreDate = new Date(chore.dueDate).toDateString();
    const targetDate = new Date(date).toDateString();
    return choreDate === targetDate;
  });
};

export const saveChore = (chore: Chore): Chore => {
  const chores = getChores();
  const existingIndex = chores.findIndex(c => c.id === chore.id);
  
  if (existingIndex >= 0) {
    chores[existingIndex] = chore;
  } else {
    chores.push(chore);
  }
  
  localStorage.setItem(CHORES_KEY, JSON.stringify(chores));
  return chore;
};

export const deleteChore = (choreId: string): void => {
  const chores = getChores();
  const updatedChores = chores.filter(chore => chore.id !== choreId);
  localStorage.setItem(CHORES_KEY, JSON.stringify(updatedChores));
};

export const toggleChoreCompletion = (choreId: string): Chore | null => {
  const chores = getChores();
  const choreIndex = chores.findIndex(chore => chore.id === choreId);
  
  if (choreIndex >= 0) {
    chores[choreIndex].isComplete = !chores[choreIndex].isComplete;
    localStorage.setItem(CHORES_KEY, JSON.stringify(chores));
    return chores[choreIndex];
  }
  
  return null;
};

// Message functions
export const getMessages = (): Message[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
};

export const getMessagesByFamilyId = (familyId: string): Message[] => {
  const messages = getMessages();
  return messages
    .filter(message => message.familyId === familyId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const saveMessage = (message: Message): Message => {
  const messages = getMessages();
  messages.push(message);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  return message;
};

// Shopping list functions
export const getShoppingItems = (): ShoppingItem[] => {
  initializeStorage();
  // Run cleanup once per session, not on every call
  cleanupShoppingItems();
  return getRawShoppingItems();
};

export const getShoppingItemsByFamilyId = (familyId: string): ShoppingItem[] => {
  const items = getRawShoppingItems(); // Use the raw items without triggering cleanup
  return items.filter(item => item.familyId === familyId);
};

export const saveShoppingItem = (item: ShoppingItem): ShoppingItem => {
  const items = getRawShoppingItems(); // Use raw items
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  
  localStorage.setItem(SHOPPING_ITEMS_KEY, JSON.stringify(items));
  return item;
};

export const toggleShoppingItemComplete = (itemId: string): ShoppingItem | null => {
  const items = getRawShoppingItems(); // Use raw items
  const itemIndex = items.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    items[itemIndex].isComplete = !items[itemIndex].isComplete;
    localStorage.setItem(SHOPPING_ITEMS_KEY, JSON.stringify(items));
    return items[itemIndex];
  }
  
  return null;
};

export const deleteShoppingItem = (itemId: string): void => {
  const items = getRawShoppingItems(); // Use raw items
  const updatedItems = items.filter(item => item.id !== itemId);
  localStorage.setItem(SHOPPING_ITEMS_KEY, JSON.stringify(updatedItems));
};

// Auth helper functions
export const validateUserCredentials = (email: string, password: string): User | null => {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};
