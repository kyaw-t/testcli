import { Box, Text } from 'ink';
import { ACCENT } from '../../theme/color.ts';
import type { Message as MessageType } from '../../types.tsx';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const getMessageColor = (type: MessageType['type']) => {
    switch (type) {
      case 'user':
        return ACCENT;
      case 'agent':
        return 'white';
      case 'tool':
        return 'green';
      case 'system':
        return 'gray';
      default:
        return 'white';
    }
  };

  const getMessageSymbol = (type: MessageType['type']) => {
    switch (type) {
      case 'user':
        return '>';
      case 'agent':
        return '∅';
      case 'tool':
        return '◯';
      case 'system':
        return '●';
      default:
        return '◯';
    }
  };

  const renderToolMessage = (content: string, toolName?: string) => {
    const lines = content.split('\n');
    const [description, ...contentLines] = lines;

    return (
      <Box flexDirection="column">
        {/* tool name from metadata */}
        {toolName && (
          <Text color="cyan" bold>
            {toolName}
          </Text>
        )}
        
        {/* tool output description */}
        <Text color="gray" dimColor>
          ⎿ {description}
        </Text>

        {/* diff/content */}
        {contentLines.map((line, index) => {
          if (line.trim().startsWith('+')) {
            return (
              <Text key={index} color="green">
                {line}
              </Text>
            );
          } else if (line.trim().startsWith('-')) {
            return (
              <Text key={index} color="red">
                {line}
              </Text>
            );
          } else if (line.trim().match(/^\d+/)) {
            return (
              <Text key={index} color="gray" dimColor>
                {line}
              </Text>
            );
          } else {
            return <Text key={index}>{line}</Text>;
          }
        })}
      </Box>
    );
  };

  return (
    <Box key={message.id} marginBottom={1}>
      <Box marginRight={1}>
        <Text color={getMessageColor(message.type)} bold>
          {getMessageSymbol(message.type)}
        </Text>
      </Box>
      {message.type === 'tool' ? (
        renderToolMessage(message.content, message.metadata?.toolName)
      ) : (
        <Text>{message.content}</Text>
      )}
    </Box>
  );
}
