export interface Message {
  id: string;
  timestamp: Date;
  type: 'user' | 'agent' | 'tool' | 'system';
  content: string;
  metadata?: {
    command?: string;
    toolName?: string;
    status?: 'running' | 'completed' | 'error';
    options?: string[];
  };
}

export interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  handler: (args?: string) => Promise<void>;
}

export interface AgentState {
  isRunning: boolean;
  currentCommand?: string;
  startTime?: Date;
  todos: Todo[];
}