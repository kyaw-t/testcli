import { Box, Text } from 'ink';
import type { AutocompleteState } from './interactive-input.tsx';
import { PRIMARY } from '../../theme/color.ts';

interface AutocompleteProps {
  autocomplete: AutocompleteState | null;
}

export function Autocomplete({ autocomplete }: AutocompleteProps) {
  if (!autocomplete || autocomplete.commands.length === 0) {
    return null;
  }

  const { commands, selectedIndex } = autocomplete;

  return (
    <Box flexDirection="column" marginTop={1} paddingX={1}>
      {commands.slice(0, 5).map((cmd, index) => (
        <Box key={cmd.name} paddingX={1}>
          <Text
            color={index === selectedIndex ? PRIMARY : 'white'}
            bold={index === selectedIndex}
          >
            /{cmd.name} - {cmd.description}
          </Text>
        </Box>
      ))}

      {commands.length > 5 && (
        <Box paddingX={1}>
          <Text dimColor>... and {commands.length - 5} more</Text>
        </Box>
      )}
    </Box>
  );
}
