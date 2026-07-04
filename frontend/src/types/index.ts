export interface User {
  id: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TrainingSession {
  sessionId: string;
  message: string;
  config: {
    industry: string;
    scenario: string;
    difficulty: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  history: ChatMessage[];
}
