import { Box } from 'ink';
import type { Message as MessageType } from '../../types.tsx';
import { Message } from './message.tsx';

interface ChatAreaProps {
  messages: MessageType[];
}

export function ChatArea({ messages }: ChatAreaProps) {
  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </Box>
  );
}
