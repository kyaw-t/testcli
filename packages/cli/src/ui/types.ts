// basic ui types for ruby cli

export type MessageType = 'user' | 'assistant' | 'info' | 'error' | 'system';

export interface HistoryItem {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export type StreamingState = 'idle' | 'responding' | 'error';

export interface ChatState {
  history: HistoryItem[];
  streamingState: StreamingState;
  currentResponse?: string;
}

export interface InputState {
  value: string;
  focused: boolean;
}