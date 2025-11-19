import React, { useCallback, useEffect, useState } from 'react';
import { Box, useStdout, Text, useInput } from 'ink';
import type { Config } from '../config/config.js';
import { Header } from './components/Header.js';
import { ChatHistory } from './components/ChatHistory.js';
import { InputPrompt } from './components/InputPrompt.js';
import { useChatHistory } from './hooks/useChatHistory.js';
import { useRubyHttpStream } from './hooks/useRubyHttpStream.js';
import type { ToolConfirmationRequest } from '@ruby/core';

interface AppProps {
  config: Config;
}

export const App = ({ config }: AppProps) => {
  const { stdout } = useStdout();
  const {
    history,
    streamingState,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    clearHistory,
    setStreamingState,
  } = useChatHistory();

  const [currentResponse, setCurrentResponse] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    request: ToolConfirmationRequest;
    resolve: (confirmed: boolean) => void;
  } | null>(null);

  // confirmation handler for tool requests
  const handleToolConfirmation = useCallback(async (request: ToolConfirmationRequest): Promise<boolean> => {
    return new Promise((resolve) => {
      setPendingConfirmation({ request, resolve });
    });
  }, []);

  const { 
    isConnected, 
    isStreaming, 
    error, 
    sendMessage, 
    disconnect
  } = useRubyHttpStream({
    serverUrl: 'http://localhost:3001',
    systemPrompt: 'you are ruby, a helpful ai assistant. you MUST use the available tools when users ask for weather information or calculations. always call the get_weather tool for weather requests and the calculate tool for math problems.',
    onConfirmation: handleToolConfirmation,
  });

  // handle confirmation responses with keyboard input
  useInput((input, key) => {
    if (pendingConfirmation) {
      if (key.return) {
        // enter key - confirm
        pendingConfirmation.resolve(true);
        setPendingConfirmation(null);
      } else if (key.escape || input.toLowerCase() === 'n') {
        // escape or 'n' key - deny
        pendingConfirmation.resolve(false);
        setPendingConfirmation(null);
      }
    }
  });

  const handleUserInput = useCallback(async (input: string) => {
    if (!isConnected) {
      addErrorMessage('not connected to ruby');
      return;
    }

    // add user message to history
    addUserMessage(input);
    setStreamingState('responding');
    setCurrentResponse('');

    try {
      let fullResponse = '';
      
      for await (const chunk of sendMessage(input)) {
        if (chunk.done) {
          break;
        }
        fullResponse += chunk.content;
        setCurrentResponse(fullResponse);
      }

      // when streaming is done, add complete response to history
      if (fullResponse.trim()) {
        addAssistantMessage(fullResponse.trim());
      }
      setCurrentResponse('');
      setStreamingState('idle');
      
    } catch (err) {
      addErrorMessage(`streaming failed: ${err instanceof Error ? err.message : 'unknown error'}`);
      setStreamingState('idle');
      setCurrentResponse('');
    }
  }, [isConnected, sendMessage, addUserMessage, addAssistantMessage, addErrorMessage, setStreamingState]);

  const handleClearScreen = useCallback(() => {
    clearHistory();
    setCurrentResponse('');
  }, [clearHistory]);

  // get user messages for history
  const userMessages = history
    .filter(msg => msg.type === 'user')
    .map(msg => msg.content);

  // create display history with current streaming response
  const displayHistory = [...history];
  if (currentResponse && streamingState === 'responding') {
    displayHistory.push({
      id: 'streaming',
      type: 'assistant',
      content: currentResponse,
      timestamp: new Date(),
    });
  }

  return (
    <Box flexDirection="column" height="100%">
      <Header version={config.version} debug={config.debug} />
      
      {error && (
        <Box paddingX={1}>
          <Text color="red">❌ Ruby Error: {error}</Text>
        </Box>
      )}
      
      {!isConnected && (
        <Box paddingX={1}>
          <Text color="yellow">🔄 Connecting to Ruby...</Text>
        </Box>
      )}
      
      {pendingConfirmation && (
        <Box paddingX={1} paddingY={1} borderStyle="round" borderColor="yellow">
          <Box flexDirection="column">
            <Text color="yellow">🔧 Tool Confirmation Required</Text>
            <Text>Tool: {pendingConfirmation.request.toolName}</Text>
            <Text>Request: {pendingConfirmation.request.message}</Text>
            <Text>Args: {JSON.stringify(pendingConfirmation.request.args, null, 2)}</Text>
            <Text color="cyan">Press Enter to confirm, Esc or 'n' to deny</Text>
          </Box>
        </Box>
      )}
      
      <Box flexGrow={1} flexDirection="column">
        <ChatHistory history={displayHistory} />
      </Box>
      
      {isStreaming && (
        <Box paddingX={1}>
          <Text color="cyan">🤖 Ruby is typing...</Text>
        </Box>
      )}
      
      <InputPrompt 
        onSubmit={handleUserInput}
        userMessages={userMessages}
        onClearScreen={handleClearScreen}
        placeholder="type your message..."
        inputWidth={stdout.columns - 10}
        disabled={!isConnected || streamingState === 'responding' || !!pendingConfirmation}
      />
    </Box>
  );
};