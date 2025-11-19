import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  version: string;
  debug?: boolean;
}

export const Header = ({ version, debug }: HeaderProps) => (
  <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
    <Box flexDirection="column" width="100%">
      <Box justifyContent="center">
        <Text color="cyan" bold>
          ✦ Ruby CLI v{version} ✦
        </Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>
          ai-powered terminal assistant
          {debug && ' (debug mode)'}
        </Text>
      </Box>
    </Box>
  </Box>
);