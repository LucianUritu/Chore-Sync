
export interface Chore {
  id: string;
  title: string;
  familyId: string;
  assignedUserId: string;
  dueDate: string;
  isComplete: boolean;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  familyId: string;
  addedByUserId: string;
  isComplete: boolean;
  addedAt: string;
}

export interface Message {
  id: string;
  familyId: string;
  senderId: string;
  text: string;
  timestamp: string;
}
