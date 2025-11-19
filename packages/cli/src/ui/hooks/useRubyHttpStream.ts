// ruby http streaming hook for distributed architecture
import { useState, useEffect } from 'react';
import {
  createRubyHttpClient,
  type RubyHttpClient,
  type StreamChunk,
  type ToolConfirmationRequest,
} from '@ruby/core';

export interface RubyHttpStreamConfig {
  serverUrl: string;
  systemPrompt?: string;
  onConfirmation?: (request: ToolConfirmationRequest) => Promise<boolean>;
}

export interface RubyHttpStreamState {
  isConnected: boolean;
  isStreaming: boolean;
  error: string | null;
  sessionId: string | null;
}

export function useRubyHttpStream(config: RubyHttpStreamConfig) {
  const [state, setState] = useState<RubyHttpStreamState>({
    isConnected: false,
    isStreaming: false,
    error: null,
    sessionId: null,
  });

  const [client, setClient] = useState<RubyHttpClient | null>(null);

  useEffect(() => {
    async function initializeClient() {
      try {
        const httpClient = createRubyHttpClient({
          serverUrl: config.serverUrl,
        });

        // set confirmation handler if provided
        if (config.onConfirmation) {
          httpClient.setConfirmationHandler(config.onConfirmation);
        }

        // test connection
        await httpClient.health();

        // create session
        const sessionId = await httpClient.createSession(config.systemPrompt);

        setClient(httpClient);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          sessionId,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          error: error instanceof Error ? error.message : 'connection failed',
        }));
      }
    }

    initializeClient();
  }, [config.serverUrl, config.systemPrompt]);

  const sendMessage = async function* (
    message: string
  ): AsyncGenerator<StreamChunk> {
    if (!client || !state.sessionId) {
      throw new Error('client not connected');
    }

    setState((prev) => ({ ...prev, isStreaming: true, error: null }));

    try {
      for await (const chunk of client.chatStream(state.sessionId, message)) {
        yield chunk;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'streaming error',
      }));
      console.log(error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isStreaming: false }));
    }
  };

  const disconnect = async () => {
    if (client && state.sessionId) {
      try {
        await client.deleteSession(state.sessionId);
      } catch (error) {
        console.warn('failed to delete session:', error);
      }
    }
    setState({
      isConnected: false,
      isStreaming: false,
      error: null,
      sessionId: null,
    });
    setClient(null);
  };

  return {
    ...state,
    sendMessage,
    disconnect,
  };
}
