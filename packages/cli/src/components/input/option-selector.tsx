import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { ACCENT } from '../../theme/color.ts';

interface OptionSelectorProps {
  options: string[];
  onSelect: (option: string, index: number) => void;
  onCancel?: () => void;
}

export function OptionSelector({ options, onSelect, onCancel }: OptionSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => prev > 0 ? prev - 1 : options.length - 1);
    } else if (key.downArrow) {
      setSelectedIndex(prev => prev < options.length - 1 ? prev + 1 : 0);
    } else if (key.return) {
      onSelect(options[selectedIndex], selectedIndex);
    } else if (key.escape && onCancel) {
      onCancel();
    } else {
      // number key selection (1-9)
      const num = parseInt(input);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        const index = num - 1;
        onSelect(options[index], index);
      }
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={ACCENT} paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color={ACCENT}>select an option:</Text>
      </Box>
      
      {options.map((option, index) => (
        <Box key={index} marginBottom={index === options.length - 1 ? 0 : 1}>
          <Text color={selectedIndex === index ? ACCENT : 'white'} bold={selectedIndex === index}>
            {selectedIndex === index ? '▶ ' : '  '}
            {index + 1}. {option}
          </Text>
        </Box>
      ))}
      
      <Box marginTop={1}>
        <Text dimColor>
          use ↑↓ to navigate, enter to select, or press number key (1-{options.length})
        </Text>
      </Box>
    </Box>
  );
}