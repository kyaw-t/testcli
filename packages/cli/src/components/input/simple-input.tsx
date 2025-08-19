import { Box, Text } from 'ink';
import { useState } from 'react';

interface SimpleInputProps {
  onCommand: (command: string) => Promise<void>;
}

export function SimpleInput(_: SimpleInputProps) {
  const [input, setInput] = useState('');

  // for now, just show a static prompt - we'll add real input handling later
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1}>
      <Text>
        {'> '}
        {input}
        <Text backgroundColor="white"> </Text>
      </Text>

      <Box marginLeft={2}>
        <Text dimColor>
          type &apos;/help&apos; to see commands (input coming soon)
        </Text>
      </Box>
    </Box>
  );
}
