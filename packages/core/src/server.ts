/**
 * Ruby Core Server - HTTP/WebSocket API for distributed architecture
 * 
 * This server provides a distributed backend for Ruby CLI, allowing the CLI to run
 * on a different machine than the AI processing core. It exposes REST APIs for
 * session management and WebSocket streaming for real-time chat interactions.
 * 
 * Key features:
 * - REST API for session lifecycle management
 * - WebSocket streaming for real-time chat responses
 * - Tool confirmation flow through WebSocket messages
 * - Multi-provider AI support via ai-sdk
 * - Session-based conversation management
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { AiSdkProvider, type AiSdkConfig, type Message } from './providers/ai-sdk.js';
import { 
  getWeatherTool, 
  calculateTool, 
  setToolConfirmationHandler,
  type ToolConfirmationRequest,
  type ToolConfirmationResponse 
} from './tools/dummy-tools.js';
import type { Tool } from 'ai';

/**
 * Represents an active chat session with conversation state
 */
export interface ChatSession {
  /** Unique session identifier */
  id: string;
  /** Conversation history messages */
  messages: Message[];
  /** AI provider instance for this session */
  provider: AiSdkProvider;
  /** Available tools for this session */
  tools: Record<string, Tool>;
  /** System prompt for the session */
  systemPrompt?: string;
  /** Active WebSocket connection for real-time streaming */
  ws?: any;
}

/**
 * Configuration for the Ruby server
 */
export interface ServerConfig {
  /** Port to listen on */
  port: number;
  /** Host address to bind to */
  host: string;
  /** AI provider configuration */
  provider: AiSdkConfig;
}

/**
 * Ruby Core Server - Distributed AI backend with HTTP REST API and WebSocket streaming
 * 
 * This server manages chat sessions, handles AI provider interactions, and provides
 * real-time streaming responses through WebSocket connections. It supports tool
 * execution with user confirmation flows.
 */
export class RubyServer {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });
  private sessions = new Map<string, ChatSession>();
  private tools: Record<string, Tool>;
  private pendingConfirmations = new Map<string, {
    resolve: (response: ToolConfirmationResponse) => void;
    request: ToolConfirmationRequest;
  }>();

  /**
   * Creates a new Ruby server instance
   * @param config - Server configuration including port, host, and AI provider settings
   */
  constructor(private config: ServerConfig) {
    this.tools = {
      get_weather: getWeatherTool,
      calculate: calculateTool,
    };
    this.setupToolConfirmationHandler();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupToolConfirmationHandler() {
    setToolConfirmationHandler(async (request: ToolConfirmationRequest): Promise<ToolConfirmationResponse> => {
      // find the session that's currently streaming
      const activeSession = Array.from(this.sessions.values()).find(s => s.ws);
      
      if (!activeSession || !activeSession.ws) {
        return { confirmed: true }; // auto-confirm if no active session
      }

      // generate confirmation id
      const confirmationId = Math.random().toString(36).substring(7);

      // send confirmation request to client
      activeSession.ws.send(JSON.stringify({
        type: 'tool_confirmation_request',
        confirmationId,
        toolName: request.toolName,
        args: request.args,
        message: request.message,
      }));

      // wait for response
      return new Promise((resolve) => {
        this.pendingConfirmations.set(confirmationId, { resolve, request });
        
        // timeout after 30 seconds
        setTimeout(() => {
          if (this.pendingConfirmations.has(confirmationId)) {
            this.pendingConfirmations.delete(confirmationId);
            resolve({ confirmed: false, reason: 'timeout' });
          }
        }, 30000);
      });
    });
  }

  private setupRoutes() {
    this.app.use(express.json());

    // create new chat session
    this.app.post('/api/sessions', async (req, res) => {
      try {
        const { systemPrompt } = req.body;
        const sessionId = Math.random().toString(36).substring(7);
        
        const provider = new AiSdkProvider(this.config.provider);
        await provider.initialize();

        const session: ChatSession = {
          id: sessionId,
          messages: [],
          provider,
          tools: this.tools,
          systemPrompt,
        };

        this.sessions.set(sessionId, session);
        
        res.json({ sessionId });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'unknown error' });
      }
    });

    // get session messages
    this.app.get('/api/sessions/:sessionId/messages', (req, res) => {
      const session = this.sessions.get(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: 'session not found' });
      }
      res.json({ messages: session.messages });
    });

    // add message to session
    this.app.post('/api/sessions/:sessionId/messages', (req, res) => {
      const session = this.sessions.get(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: 'session not found' });
      }

      const { role, content } = req.body;
      session.messages.push({ role, content });
      
      res.json({ success: true });
    });

    // delete session
    this.app.delete('/api/sessions/:sessionId', (req, res) => {
      const deleted = this.sessions.delete(req.params.sessionId);
      res.json({ success: deleted });
    });

    // health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', sessions: this.sessions.size });
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('client connected');

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'chat_stream') {
            await this.handleChatStream(ws, message);
          } else if (message.type === 'tool_confirmation') {
            await this.handleToolConfirmation(ws, message);
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'unknown error'
          }));
        }
      });

      ws.on('close', () => {
        console.log('client disconnected');
      });
    });
  }

  private async handleChatStream(ws: any, message: any) {
    const { sessionId, userMessage } = message;
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      ws.send(JSON.stringify({ type: 'error', error: 'session not found' }));
      return;
    }

    // set websocket connection for this session (for tool confirmations)
    session.ws = ws;

    // add user message
    session.messages.push({ role: 'user', content: userMessage });

    // start streaming response
    ws.send(JSON.stringify({ type: 'stream_start' }));

    let assistantMessage = '';

    try {
      for await (const chunk of session.provider.generateStream(session.messages, {
        systemPrompt: session.systemPrompt,
        tools: session.tools,
      })) {
        if (chunk.done) {
          // add complete assistant message to session
          if (assistantMessage.trim()) {
            session.messages.push({ role: 'assistant', content: assistantMessage.trim() });
          }
          // clear websocket connection
          session.ws = undefined;
          ws.send(JSON.stringify({ type: 'stream_end' }));
        } else {
          assistantMessage += chunk.content;
          ws.send(JSON.stringify({ 
            type: 'stream_chunk', 
            content: chunk.content 
          }));
        }
      }
    } catch (error) {
      // clear websocket connection on error
      session.ws = undefined;
      ws.send(JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'stream error'
      }));
    }
  }

  private async handleToolConfirmation(ws: any, message: any) {
    const { confirmationId, confirmed, reason } = message;
    
    const pending = this.pendingConfirmations.get(confirmationId);
    if (!pending) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'confirmation not found or expired'
      }));
      return;
    }

    // resolve the pending confirmation
    this.pendingConfirmations.delete(confirmationId);
    pending.resolve({ confirmed, reason });

    ws.send(JSON.stringify({
      type: 'tool_confirmation_received',
      confirmationId
    }));
  }

  async start() {
    return new Promise<void>((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`ruby server listening on ${this.config.host}:${this.config.port}`);
        resolve();
      });
    });
  }

  async stop() {
    return new Promise<void>((resolve) => {
      this.wss.close(() => {
        this.server.close(() => {
          console.log('ruby server stopped');
          resolve();
        });
      });
    });
  }
}

// factory function
export async function createRubyServer(config: ServerConfig): Promise<RubyServer> {
  const server = new RubyServer(config);
  return server;
}