/**
 * Ruby HTTP Client - WebSocket-enabled client for connecting to Ruby server
 * 
 * This client provides a distributed architecture where the CLI can run on a different
 * machine than the Ruby core server. It handles HTTP REST API calls for session
 * management and WebSocket streaming for real-time chat interactions.
 * 
 * Key features:
 * - Session lifecycle management (create, delete)
 * - Real-time streaming chat over WebSocket
 * - Tool confirmation flow integration
 * - Automatic connection and error handling
 */

import WebSocket from 'ws';

/**
 * Configuration for the Ruby HTTP client
 */
export interface HttpClientConfig {
  /** Base URL for the Ruby server (e.g., 'http://localhost:3001') */
  serverUrl: string;
  /** WebSocket URL override (auto-generated from serverUrl if not provided) */
  wsUrl?: string;
}

/**
 * A single chunk of streamed content
 */
export interface StreamChunk {
  /** Content text for this chunk */
  content: string;
  /** Whether this is the final chunk in the stream */
  done?: boolean;
}

/**
 * Tool confirmation request from server to client
 */
export interface ToolConfirmationRequest {
  /** Unique ID for this confirmation request */
  confirmationId: string;
  /** Name of the tool requesting confirmation */
  toolName: string;
  /** Arguments that will be passed to the tool */
  args: any;
  /** Human-readable confirmation message */
  message: string;
}

/**
 * Handler function for tool confirmation requests
 * @param request - The confirmation request details
 * @returns Promise resolving to true for confirm, false for deny
 */
export interface ConfirmationHandler {
  (request: ToolConfirmationRequest): Promise<boolean>;
}

/**
 * A conversation message
 */
export interface Message {
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** Text content of the message */
  content: string;
}

/**
 * Ruby HTTP Client - Handles communication with Ruby server over HTTP and WebSocket
 * 
 * This client manages the connection to a Ruby server, providing methods for session
 * management and real-time streaming chat. It automatically handles tool confirmations
 * and WebSocket message routing.
 */
export class RubyHttpClient {
  private baseUrl: string;
  private wsUrl: string;
  private confirmationHandler?: ConfirmationHandler;

  /**
   * Creates a new Ruby HTTP client
   * @param config - Client configuration with server URLs
   */
  constructor(config: HttpClientConfig) {
    this.baseUrl = config.serverUrl;
    this.wsUrl = config.wsUrl || config.serverUrl.replace('http', 'ws');
  }

  /**
   * Sets the handler for tool confirmation requests
   * @param handler - Function to call when tools request user confirmation
   */
  setConfirmationHandler(handler: ConfirmationHandler) {
    this.confirmationHandler = handler;
  }

  /**
   * Creates a new chat session on the server
   * @param systemPrompt - Optional system prompt to set the AI's behavior
   * @returns Promise resolving to the session ID
   */
  async createSession(systemPrompt?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt }),
    });

    if (!response.ok) {
      throw new Error(`failed to create session: ${response.statusText}`);
    }

    const { sessionId } = await response.json();
    return sessionId;
  }

  // get session messages
  async getMessages(sessionId: string): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/messages`);
    
    if (!response.ok) {
      throw new Error(`failed to get messages: ${response.statusText}`);
    }

    const { messages } = await response.json();
    return messages;
  }

  // add message to session
  async addMessage(sessionId: string, role: Message['role'], content: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content }),
    });

    if (!response.ok) {
      throw new Error(`failed to add message: ${response.statusText}`);
    }
  }

  /**
   * Streams a chat response over WebSocket with real-time tool confirmation support
   * 
   * This method establishes a WebSocket connection to the server and streams the AI's
   * response in real-time. It automatically handles tool confirmation requests by
   * calling the registered confirmation handler.
   * 
   * @param sessionId - ID of the chat session
   * @param userMessage - User's message to send
   * @yields StreamChunk objects containing response content
   * @throws Error if connection fails or streaming errors occur
   */
  async *chatStream(sessionId: string, userMessage: string): AsyncGenerator<StreamChunk> {
    const ws = new WebSocket(this.wsUrl);
    const self = this;

    let connected = false;
    let error: Error | null = null;
    let streamEnded = false;
    const messageQueue: any[] = [];
    let waitingForMessage = false;
    let waitingResolve: ((message: any) => void) | null = null;

    // global message handler
    const handleMessage = async (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        
        // handle tool confirmation requests
        if (parsed.type === 'tool_confirmation_request') {
          if (self.confirmationHandler) {
            const confirmed = await self.confirmationHandler({
              confirmationId: parsed.confirmationId,
              toolName: parsed.toolName,
              args: parsed.args,
              message: parsed.message,
            });

            // send confirmation response
            ws.send(JSON.stringify({
              type: 'tool_confirmation',
              confirmationId: parsed.confirmationId,
              confirmed,
            }));
          } else {
            // auto-confirm if no handler
            ws.send(JSON.stringify({
              type: 'tool_confirmation',
              confirmationId: parsed.confirmationId,
              confirmed: true,
            }));
          }
          return; // don't add to queue
        }
        
        // add to message queue
        messageQueue.push(parsed);
        
        // resolve waiting promise if any
        if (waitingForMessage && waitingResolve) {
          const message = messageQueue.shift();
          if (message) {
            waitingResolve(message);
            waitingForMessage = false;
            waitingResolve = null;
          }
        }
      } catch (err) {
        console.error('message parsing error:', err);
      }
    };

    // wait for connection
    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        connected = true;
        resolve();
      });
      
      ws.on('error', (err) => {
        error = err instanceof Error ? err : new Error(String(err));
        reject(error);
      });
    });

    if (!connected || error) {
      throw error || new Error('failed to connect to websocket');
    }

    // set up message handler
    ws.on('message', handleMessage);

    // send chat request
    ws.send(JSON.stringify({
      type: 'chat_stream',
      sessionId,
      userMessage,
    }));

    // yield chunks as they arrive
    yield* (async function* () {
      while (!streamEnded) {
        let message: any;
        
        if (messageQueue.length > 0) {
          message = messageQueue.shift();
        } else {
          // wait for next message
          message = await new Promise<any>((resolve, reject) => {
            waitingForMessage = true;
            waitingResolve = resolve;
            
            setTimeout(() => {
              if (waitingForMessage) {
                waitingForMessage = false;
                waitingResolve = null;
                reject(new Error('websocket timeout'));
              }
            }, 30000);
          });
        }

        if (message.type === 'stream_chunk') {
          yield { content: message.content };
        } else if (message.type === 'stream_end') {
          streamEnded = true;
          yield { content: '', done: true };
        } else if (message.type === 'error') {
          throw new Error(message.error);
        }
      }
    })();

    ws.close();
  }

  // delete session
  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`failed to delete session: ${response.statusText}`);
    }
  }

  // health check
  async health(): Promise<{ status: string; sessions: number }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// factory function
export function createRubyHttpClient(config: HttpClientConfig): RubyHttpClient {
  return new RubyHttpClient(config);
}