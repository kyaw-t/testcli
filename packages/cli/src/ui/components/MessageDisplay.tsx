import React from 'react';
import { Box, Text } from 'ink';
import type { HistoryItem, MessageType } from '../types.js';

interface MessageDisplayProps {
  message: HistoryItem;
}

const getMessageColor = (type: MessageType): string => {
  switch (type) {
    case 'user':
      return 'blue';
    case 'assistant':
      return 'green';
    case 'error':
      return 'red';
    case 'info':
      return 'yellow';
    case 'system':
      return 'gray';
    default:
      return 'white';
  }
};

const getMessagePrefix = (type: MessageType): string => {
  switch (type) {
    case 'user':
      return '❯';
    case 'assistant':
      return '✦';
    case 'error':
      return '✖';
    case 'info':
      return 'ℹ';
    case 'system':
      return '⚙';
    default:
      return '•';
  }
};

export const MessageDisplay = ({ message }: MessageDisplayProps) => {
  const color = getMessageColor(message.type);
  const prefix = getMessagePrefix(message.type);

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color={color}>{prefix} </Text>
        <Text>{message.content}</Text>
      </Box>
    </Box>
  );
};