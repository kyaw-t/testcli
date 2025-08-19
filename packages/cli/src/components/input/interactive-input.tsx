import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { ACCENT } from '../../theme/color.ts';
import type { Command } from '../../types.tsx';
import { Autocomplete } from './autocomplete.tsx';

interface InteractiveInputProps {
  onCommand: (command: string) => Promise<void>;
}

export interface AutocompleteState {
  commands: Command[];
  selectedIndex: number;
}

// mock command list for now - we'll move this to a registry later
const availableCommands: Command[] = [
  {
    name: 'help',
    description: 'show available commands',
    usage: '/help',
    handler: async () => {},
  },
  {
    name: 'debug',
    description: 'debug current codebase',
    usage: '/debug [issue]',
    handler: async () => {},
  },
  {
    name: 'implement',
    description: 'implement new feature',
    usage: '/implement <feature>',
    handler: async () => {},
  },
  {
    name: 'review',
    description: 'code review',
    usage: '/review [files]',
    handler: async () => {},
  },
  {
    name: 'test',
    description: 'run or write tests',
    usage: '/test [pattern]',
    handler: async () => {},
  },
  {
    name: 'terraform-generate',
    description: 'run or write tests',
    usage: '/test [pattern]',
    handler: async () => {},
  },
  {
    name: 'try-juice',
    description: 'run or write tests',
    usage: '/test [pattern]',
    handler: async () => {},
  },
  {
    name: 'try-test',
    description: 'run or write tests',
    usage: '/test [pattern]',
    handler: async () => {},
  },
  {
    name: 'try-reserach',
    description: 'd or write tests',
    usage: '/test [pattern]',
    handler: async () => {},
  },
];

export function InteractiveInput({ onCommand }: InteractiveInputProps) {
  const [input, setInput] = useState('');
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(0);

  // filter commands based on current input
  const filteredCommands = availableCommands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(input.slice(1).toLowerCase()) ||
      cmd.description.toLowerCase().includes(input.slice(1).toLowerCase())
  );

  // handle keyboard navigation for autocomplete
  useInput((inp, key) => {
    if (showAutocomplete && filteredCommands.length > 0) {
      if (key.upArrow) {
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }

      if (key.downArrow) {
        setSelectedCommandIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (key.tab || key.return) {
        // select the highlighted command
        const selectedCommand = filteredCommands[selectedCommandIndex];
        if (selectedCommand) {
          const newValue = `/${selectedCommand.name}`;
          setInput(newValue);
          setShowAutocomplete(false);
          setSelectedCommandIndex(0);

          // force re-render to position cursor at end
          setForceRefresh((prev) => prev + 1);

          // if enter was pressed, execute the command
          if (key.return) {
            handleSubmit(selectedCommand.name);
          }
        }
        return;
      }
    }

    if (key.escape) {
      setShowAutocomplete(false);
      setSelectedCommandIndex(0);
      setInput('');
      setIsCommandMode(false);
      return;
    }
  });

  const handleInputChange = (value: string) => {
    setInput(value);
    const isCommand = value.startsWith('/');
    setIsCommandMode(isCommand);

    if (isCommand && value.length > 1) {
      setShowAutocomplete(true);
      setSelectedCommandIndex(0);
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleSubmit = async (commandOverride?: string) => {
    const commandToExecute =
      commandOverride || (isCommandMode ? input.slice(1) : input);

    if (!commandToExecute.trim()) return;

    // send both commands and regular messages to the handler
    await onCommand(commandToExecute);

    setInput('');
    setIsCommandMode(false);
    setShowAutocomplete(false);
    setSelectedCommandIndex(0);
  };

  return (
    <>
      <Box borderStyle="round" borderColor={ACCENT} paddingX={1}>
        <Text>{!isCommandMode && '>'}</Text>
        <TextInput
          key={forceRefresh}
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          // TODO: dynamic placeholders
          showCursor
        />
      </Box>

      <Box>
        <Text dimColor>
          {isCommandMode
            ? 'command mode: use ↑↓ to navigate, tab to autocomplete, enter to execute'
            : 'type / to enter command mode, or just chat normally            '}
        </Text>
      </Box>

      {/* autocomplete dropdown */}
      {showAutocomplete && (
        <Autocomplete
          autocomplete={{
            commands: filteredCommands,
            selectedIndex: selectedCommandIndex,
          }}
        />
      )}
    </>
  );
}
