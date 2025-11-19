// dummy tools for testing tool calls
import { tool } from 'ai';
import { z } from 'zod';

export interface ToolConfirmationRequest {
  toolName: string;
  args: any;
  message: string;
}

export interface ToolConfirmationResponse {
  confirmed: boolean;
  reason?: string;
}

// global confirmation handler - will be set by server
let confirmationHandler: ((request: ToolConfirmationRequest) => Promise<ToolConfirmationResponse>) | null = null;

export function setToolConfirmationHandler(handler: (request: ToolConfirmationRequest) => Promise<ToolConfirmationResponse>) {
  confirmationHandler = handler;
}

async function requestConfirmation(toolName: string, args: any, message: string): Promise<boolean> {
  if (!confirmationHandler) {
    return true; // auto-confirm if no handler
  }
  
  const response = await confirmationHandler({ toolName, args, message });
  return response.confirmed;
}

export const getWeatherTool = tool({
  description: 'Get the current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get weather for'),
    unit: z
      .enum(['celsius', 'fahrenheit'])
      .optional()
      .describe('Temperature unit'),
  }),
  execute: async ({ location, unit }) => {
    // request user confirmation
    const confirmed = await requestConfirmation(
      'get_weather',
      { location, unit },
      `fetch weather data for ${location}?`
    );

    if (!confirmed) {
      return {
        error: 'weather request cancelled by user',
        location,
      };
    }

    // simulate api call delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const temp = Math.floor(Math.random() * 30) + 10;
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'][
      Math.floor(Math.random() * 4)
    ];

    return {
      location,
      temperature: `${temp}°${unit === 'celsius' ? 'C' : 'F'}`,
      conditions,
      humidity: `${Math.floor(Math.random() * 40) + 40}%`,
    };
  },
});

export const calculateTool = tool({
  description: 'Perform basic mathematical calculations',
  inputSchema: z.object({
    operation: z
      .enum(['add', 'subtract', 'multiply', 'divide'])
      .describe('The operation to perform'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  execute: async ({ operation, a, b }) => {
    // simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 5000));

    let result: number;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Cannot divide by zero');
        }
        result = a / b;
        break;
    }

    return {
      operation,
      a,
      b,
      result,
      expression: `${a} ${operation} ${b} = ${result}`,
    };
  },
});
