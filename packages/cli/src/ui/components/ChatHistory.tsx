import React from 'react';
import { Box } from 'ink';
import { MessageDisplay } from './MessageDisplay.js';
import type { HistoryItem } from '../types.js';

interface ChatHistoryProps {
  history: HistoryItem[];
}

export const ChatHistory = ({ history }: ChatHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column">
      {history.map((message) => (
        <MessageDisplay key={message.id} message={message} />
      ))}
    </Box>
  );
};