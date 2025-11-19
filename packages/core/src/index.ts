// ruby core main entry point

// server architecture
export {
  RubyServer,
  createRubyServer,
  type ServerConfig,
  type ChatSession,
} from './server.js';

// http client for distributed architecture
export {
  RubyHttpClient,
  createRubyHttpClient,
  type HttpClientConfig,
  type ToolConfirmationRequest,
  type ConfirmationHandler,
} from './client-http.js';

// provider types
export { 
  AiSdkProvider,
  type AiSdkConfig,
  type Message,
  type StreamChunk,
} from './providers/ai-sdk.js';