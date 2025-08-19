import React from 'react';
import { Box, Text } from 'ink';
import type { Todo } from '../../types.tsx';

interface TodoPanelProps {
  todos: Todo[];
}

export function TodoPanel({ todos }: TodoPanelProps) {
  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '⚡';
      case 'pending':
        return '□';
      default:
        return '□';
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'yellow';
      case 'pending':
        return 'gray';
      default:
        return 'white';
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'white';
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="red"
      width="100%"
      height="100%"
      padding={1}
    >
      <Box marginBottom={1}>
        <Text bold>todos</Text>
        {todos.length > 0 && <Text dimColor> ({todos.length})</Text>}
      </Box>

      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {todos.length === 0 ? (
          <Text dimColor>no active todos</Text>
        ) : (
          todos.map((todo) => (
            <Box key={todo.id} marginBottom={1}>
              <Box marginRight={1}>
                <Text color={getStatusColor(todo.status)}>
                  {getStatusIcon(todo.status)}
                </Text>
              </Box>
              <Box flexGrow={1}>
                <Text
                  strikethrough={todo.status === 'completed'}
                  dimColor={todo.status === 'completed'}
                >
                  {todo.content}
                </Text>
              </Box>
              <Box marginLeft={1}>
                <Text color={getPriorityColor(todo.priority)} dimColor>
                  {todo.priority}
                </Text>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
