import React from 'react';
import { Box, Text } from 'ink';
import type { AgentState } from '../../types.tsx';
import { ACCENT } from '../../theme/color.ts';

interface StatusBarProps {
  agentState: AgentState;
}

export function StatusBar({ agentState }: StatusBarProps) {
  const getElapsedTime = () => {
    if (!agentState.startTime) return '';
    const elapsed = Date.now() - agentState.startTime.getTime();
    const seconds = Math.floor(elapsed / 1000);
    return `${seconds}s`;
  };

  const todos = Array.isArray(agentState.todos) ? agentState.todos : [];
  const completedTodos = todos.filter(
    (todo) => todo.status === 'completed'
  ).length;
  const totalTodos = todos.length;

  return (
    <Box
      borderStyle="double"
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor={ACCENT}
      paddingX={1}
    >
      <Box flexGrow={1} width="100%" paddingY={0} paddingX={1}>
        <Text>
          <Text color={agentState.isRunning ? 'yellow' : 'green'}>
            {agentState.isRunning ? 'running' : 'idle'}
          </Text>
          {agentState.currentCommand && (
            <>
              {' '}
              | command: <Text color="blue">{agentState.currentCommand}</Text>
            </>
          )}
          {agentState.isRunning && agentState.startTime && (
            <>
              {' '}
              | time: <Text color="yellow">{getElapsedTime()}</Text>
            </>
          )}
        </Text>
      </Box>

      {totalTodos > 0 && (
        <Box marginLeft={2}>
          <Text>
            todos: <Text color="green">{completedTodos}</Text>/
            <Text>{totalTodos}</Text>
          </Text>
        </Box>
      )}
    </Box>
  );
}
