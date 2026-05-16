export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  image?: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  lastMessageAt: number;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: number;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}
