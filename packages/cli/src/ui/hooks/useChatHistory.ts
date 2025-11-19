import { useState, useCallback } from 'react';
import type { HistoryItem, MessageType, ChatState } from '../types.js';

export function useChatHistory() {
  const [chatState, setChatState] = useState<ChatState>({
    history: [],
    streamingState: 'idle',
  });

  const addMessage = useCallback((type: MessageType, content: string) => {
    const newMessage: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      history: [...prev.history, newMessage],
    }));

    return newMessage.id;
  }, []);

  const addUserMessage = useCallback((content: string) => addMessage('user', content), [addMessage]);

  const addAssistantMessage = useCallback((content: string) => addMessage('assistant', content), [addMessage]);

  const addErrorMessage = useCallback((content: string) => addMessage('error', content), [addMessage]);

  const addInfoMessage = useCallback((content: string) => addMessage('info', content), [addMessage]);

  const clearHistory = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      history: [],
    }));
  }, []);

  const setStreamingState = useCallback((state: ChatState['streamingState']) => {
    setChatState(prev => ({
      ...prev,
      streamingState: state,
    }));
  }, []);

  return {
    history: chatState.history,
    streamingState: chatState.streamingState,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    addInfoMessage,
    clearHistory,
    setStreamingState,
  };
}