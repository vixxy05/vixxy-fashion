export type Presence = "online" | "offline";

export type User = {
  id: string;
  name: string;
  avatar: string;
  presence: Presence;
};

export type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  members: User[];
  presence?: Presence;
  messages: Message[];
};

