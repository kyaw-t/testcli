import { Box } from 'ink';
import { useEffect, useState } from 'react';
import type { AgentState, Message, Todo } from '../../types.tsx';
import { ChatArea } from './chat-area.tsx';
import { InteractiveInput } from '../input/interactive-input.tsx';
import { SimpleInput } from '../input/simple-input.tsx';
import { OptionSelector } from '../input/option-selector.tsx';
import { StatusBar } from '../ui/status-bar.tsx';
import { RubyBanner } from '../ui/ruby-banner.tsx';
// import { TodoPanel } from '../ui/todo-panel.tsx'; // kept for future use

interface ChatInterfaceProps {
  demoMode?: boolean;
}

export function ChatInterface({ demoMode = false }: ChatInterfaceProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOptionMode, setIsOptionMode] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const [agentState, setAgentState] = useState<AgentState>({
    isRunning: false,
    todos: [],
  });

  const addMessage = (
    type: Message['type'],
    content: string,
    metadata?: Message['metadata']
  ) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      type,
      content,
      metadata,
    };
    setMessages((prev) => [...prev, message]);
    
    // check if this message has options to trigger option mode
    if (metadata?.options && metadata.options.length > 0) {
      setIsOptionMode(true);
      setCurrentOptions(metadata.options);
    }
  };

  const updateTodos = (todos: Todo[]) => {
    setAgentState((prev) => ({ ...prev, todos }));
  };

  const handleOptionSelect = (option: string, index: number) => {
    // add user's selection as a message
    addMessage('user', `selected: ${option}`);
    
    // exit option mode
    setIsOptionMode(false);
    setCurrentOptions([]);
    
    // trigger agent response based on selection
    setTimeout(() => {
      addMessage('agent', `great choice! proceeding with "${option}"`);
    }, 300);
  };

  const handleOptionCancel = () => {
    setIsOptionMode(false);
    setCurrentOptions([]);
    addMessage('system', 'selection cancelled');
  };

  const handleCommand = async (command: string) => {
    // if it's a normal message (not a command), handle it differently
    if (!command.startsWith('/')) {
      addMessage('user', command);

      // simple predefined agent response
      setTimeout(() => {
        const responses = [
          "I'm a coding assistant! Use slash commands like /help to see what I can do.",
          "That's interesting! Try using /implement or /debug to get started with coding tasks.",
          "I'd love to help with your code! Use commands like /review or /test for development tasks.",
          'Thanks for chatting! I work best with specific commands - try typing / to see options.',
          'I understand! For coding assistance, use slash commands like /help to see what I can do.',
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        addMessage('agent', randomResponse);
      }, 500);
      return;
    }

    // handle slash commands
    const cleanCommand = command.startsWith('/') ? command.slice(1) : command;
    addMessage('user', `/${cleanCommand}`);
    setAgentState((prev) => ({
      ...prev,
      isRunning: true,
      currentCommand: cleanCommand,
      startTime: new Date(),
    }));

    // simulate realistic agent execution with better examples
    addMessage('agent', `analyzing request: "${cleanCommand}"`);

    // step 1: search and analysis
    setTimeout(() => {
      const initialTodos: Todo[] = [
        {
          id: '1',
          content: 'search for relevant files',
          status: 'in_progress',
          priority: 'high',
          timestamp: new Date(),
        },
        {
          id: '2',
          content: 'analyze existing implementation',
          status: 'pending',
          priority: 'high',
          timestamp: new Date(),
        },
        {
          id: '3',
          content: 'generate solution',
          status: 'pending',
          priority: 'medium',
          timestamp: new Date(),
        },
        {
          id: '4',
          content: 'run tests and validation',
          status: 'pending',
          priority: 'low',
          timestamp: new Date(),
        },
      ];
      updateTodos(initialTodos);

      addMessage(
        'tool',
        `searching for TypeScript components: **/*.tsx
/src/components/chat/message.tsx
/src/components/chat/chat-area.tsx  
/src/components/chat/chat-interface.tsx
/src/components/input/interactive-input.tsx
/src/app.tsx`,
        { toolName: 'Glob' }
      );
    }, 800);

    // step 2: detailed analysis
    setTimeout(() => {
      updateTodos((prev) =>
        prev.map((todo) =>
          todo.id === '1'
            ? { ...todo, status: 'completed' as const }
            : todo.id === '2'
              ? { ...todo, status: 'in_progress' as const }
              : todo
        )
      );

      addMessage(
        'tool',
        `reading file: src/components/chat/message.tsx
import { Box, Text } from 'ink';
import { ACCENT } from '../../theme/color.ts';
import type { Message as MessageType } from '../../types.tsx';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  // ... component implementation
}`,
        { toolName: 'Read' }
      );

      addMessage(
        'agent',
        'found existing Message component with proper typing'
      );
    }, 2500);

    // step 3: implementation
    setTimeout(() => {
      updateTodos((prev) =>
        prev.map((todo) =>
          todo.id === '2'
            ? { ...todo, status: 'completed' as const }
            : todo.id === '3'
              ? { ...todo, status: 'in_progress' as const }
              : todo
        )
      );

      addMessage('agent', 'generating improved implementation...');

      addMessage(
        'tool',
        `updated src/components/chat/message.tsx with enhanced formatting
    12          case 'user':
    13            return ACCENT;
    14          case 'agent':
-   15            return 'white';
+   15            return 'green';
    16          case 'tool':
-   17            return 'green';
+   17            return 'cyan';
    18          case 'system':
    19            return 'gray';
    20          default:
+   21        // add better symbol mapping
+   22        const getMessageSymbol = (type: MessageType['type']) => {
+   23          switch (type) {
+   24            case 'user': return '>';
+   25            case 'agent': return '∅';
+   26            case 'tool': return '◯';
+   27            case 'system': return '●';`,
        { toolName: 'Edit' }
      );
    }, 4200);

    // step 4: testing
    setTimeout(() => {
      updateTodos((prev) =>
        prev.map((todo) =>
          todo.id === '3'
            ? { ...todo, status: 'completed' as const }
            : todo.id === '4'
              ? { ...todo, status: 'in_progress' as const }
              : todo
        )
      );

      addMessage(
        'tool',
        `running type check and build validation
pnpm build
> ruby-cli@0.1.0 build
> node scripts/build.js

🔨 building with swc...
✅ build complete! transformed 24 files
Successfully compiled: 17 files with swc (31.42ms)`,
        { toolName: 'Bash' }
      );

      addMessage('agent', 'all tests passing, changes validated');
    }, 5800);

    // final step: completion
    setTimeout(() => {
      updateTodos((prev) =>
        prev.map((todo) => ({ ...todo, status: 'completed' as const }))
      );

      addMessage(
        'agent',
        `${cleanCommand} completed successfully! enhanced message formatting with proper colors and symbols`
      );
      
      // add an example option selection after completion
      setTimeout(() => {
        addMessage(
          'system',
          'what would you like to do next?',
          {
            options: [
              'run tests on the updated code',
              'review the changes made',
              'implement another feature',
              'optimize performance',
              'update documentation'
            ]
          }
        );
      }, 1000);
      setAgentState((prev) => ({
        ...prev,
        isRunning: false,
        currentCommand: undefined,
      }));
    }, 7200);
  };
  // auto-trigger demo command in demo mode
  useEffect(() => {
    if (demoMode) {
      setTimeout(() => handleCommand('implement-feature'), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  return (
    <Box
      flexDirection="column"
      height="100%"
      width="100%"
      paddingX={1}
      paddingY={2}
    >
      <RubyBanner demoMode={demoMode} />

      <Box flexGrow={1} flexDirection="row" width="full" minHeight={0}>
        <Box width="100%" flexDirection="column">
          <ChatArea messages={messages} />
        </Box>
      </Box>

      <Box marginTop={1} flexShrink={0}>
        <StatusBar agentState={agentState} />
      </Box>

      <Box flexDirection="column" flexShrink={0}>
        {isOptionMode ? (
          <OptionSelector 
            options={currentOptions}
            onSelect={handleOptionSelect}
            onCancel={handleOptionCancel}
          />
        ) : process.stdin.isTTY && typeof process.stdin.setRawMode === 'function' ? (
          <InteractiveInput onCommand={handleCommand} />
        ) : (
          <SimpleInput onCommand={handleCommand} />
        )}
      </Box>
    </Box>
  );
}
