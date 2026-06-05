export type TimbreChatRole = "user" | "assistant";

export type TimbreChatMessage = {
  id: string;
  role: TimbreChatRole;
  content: string;
  settings?: string[];
  createdAt: string;
};

export type TimbreProject = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type TimbreChatPayload = {
  userId?: number;
  prompt: string;
  equipmentNames: string[];
  referenceAudioNames: string[];
  previousMessages: TimbreChatMessage[];
};

export type TimbreChatResponse = {
  message: TimbreChatMessage;
  summary: string;
};
