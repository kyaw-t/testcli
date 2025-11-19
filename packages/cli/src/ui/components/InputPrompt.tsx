import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface InputPromptProps {
  onSubmit: (value: string) => void;
  userMessages: readonly string[];
  onClearScreen: () => void;
  placeholder?: string;
  focus?: boolean;
  inputWidth: number;
  disabled?: boolean;
}

export const InputPrompt = ({
  onSubmit,
  userMessages: _userMessages,
  onClearScreen: _onClearScreen,
  placeholder = 'type your message...',
  focus = true,
  inputWidth: _inputWidth,
  disabled = false,
}: InputPromptProps) => {
  const [input, setInput] = useState('');

  useInput((inputText, key) => {
    if (!focus || disabled) return;

    if (key.return) {
      if (input.trim()) {
        onSubmit(input.trim());
        setInput('');
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    if (inputText && !key.ctrl && !key.meta) {
      setInput(prev => prev + inputText);
    }
  });

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      <Text color="cyan">❯ </Text>
      <Box flexGrow={1}>
        {input.length === 0 ? (
          <Text dimColor>{placeholder}</Text>
        ) : (
          <Text>{input}</Text>
        )}
      </Box>
    </Box>
  );
};