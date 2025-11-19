import { useState, useCallback } from 'react';

interface UseInputHistoryProps {
  userMessages: readonly string[];
  onSubmit: (value: string) => void;
  isActive: boolean;
  currentQuery: string;
  onChange: (value: string) => void;
}

export function useInputHistory({
  userMessages,
  onSubmit: _onSubmit,
  isActive,
  currentQuery: _currentQuery,
  onChange,
}: UseInputHistoryProps) {
  const [historyIndex, setHistoryIndex] = useState(-1);

  const navigateUp = useCallback(() => {
    if (!isActive || userMessages.length === 0) return;

    const newIndex = historyIndex === -1 
      ? userMessages.length - 1 
      : Math.max(0, historyIndex - 1);
    
    setHistoryIndex(newIndex);
    onChange(userMessages[newIndex]!);
  }, [isActive, userMessages, historyIndex, onChange]);

  const navigateDown = useCallback(() => {
    if (!isActive || userMessages.length === 0) return;

    if (historyIndex === -1) return;

    const newIndex = historyIndex + 1;
    
    if (newIndex >= userMessages.length) {
      setHistoryIndex(-1);
      onChange('');
    } else {
      setHistoryIndex(newIndex);
      onChange(userMessages[newIndex]!);
    }
  }, [isActive, userMessages, historyIndex, onChange]);

  return {
    navigateUp,
    navigateDown,
    historyIndex,
  };
}