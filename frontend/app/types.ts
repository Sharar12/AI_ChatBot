export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  file?: File;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  thinking?: string;
  isThinking?: boolean;
  model?: string;
  feedback?: 'like' | 'dislike' | null;
  webSearchUsed?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: string;
  pinned?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'Gemini' | 'Claude' | 'OpenAI' | 'DeepSeek' | 'OpenCode';
  tagline: string;
  badge: string;
  badgeColor: string;
  iconColor: string;
  supportsThinking?: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  systemPrompt: string;
  temperature: number;
  soundEnabled: boolean;
  deepThinkDefault: boolean;
  webSearchDefault: boolean;
  backendApiUrl: string;
  useBackendApi: boolean;
  apiKey?: string;
  apiProvider?: 'gemini' | 'openai' | 'openrouter' | 'opencode';
}
