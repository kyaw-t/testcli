// ai-sdk provider implementation for ruby core
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { Tool } from 'ai';
import { generateText, stepCountIs, streamText, type CoreMessage } from 'ai';

const bedrock = createAmazonBedrock({
  apiKey: process.env.BEDROCK_API_KEY,
  region: 'us-east-1',
});
export interface AiSdkConfig {
  provider: 'anthropic' | 'openai' | 'bedrock';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  // bedrock specific
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChunk {
  content: string;
  done?: boolean;
}

export class AiSdkProvider {
  private client: any;

  constructor(private config: AiSdkConfig) {}

  async initialize(): Promise<void> {
    switch (this.config.provider) {
      case 'anthropic':
        this.client = createAnthropic({
          apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY,
          baseURL: this.config.baseUrl,
        });
        break;

      case 'openai':
        this.client = createOpenAI({
          apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
          baseURL: this.config.baseUrl,
        });
        break;

      case 'bedrock':
        // using your working example approach
        this.client = createAmazonBedrock({
          apiKey: this.config.apiKey || process.env.BEDROCK_API_KEY,
          region: this.config.region || 'us-east-1',
        } as any);
        break;

      default:
        throw new Error(`unsupported provider: ${this.config.provider}`);
    }
  }

  async *generateStream(
    messages: Message[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      tools?: Record<string, Tool>;
    }
  ): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      throw new Error('provider not initialized');
    }

    const coreMessages: CoreMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const stream = streamText({
      model: bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
      // model: bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
      messages: coreMessages,
      system: options?.systemPrompt,
      // maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      tools: options?.tools,
      stopWhen: stepCountIs(3),
      // let model choose when to use tools
    });

    // use fullStream to see tool calls, results, and final text
    for await (const chunk of stream.fullStream) {
      if (chunk.type === 'text-delta') {
        yield { content: chunk.text };
      } else if (chunk.type === 'tool-call') {
        yield {
          content: `\n🔧 calling ${chunk.toolName}(${JSON.stringify(chunk.input, null, 2)})\n`,
        };
      } else if (chunk.type === 'tool-result') {
        yield {
          content: `✅ result: ${JSON.stringify(chunk.output, null, 2)}\n\n`,
        };
      } else if (chunk.type === 'finish') {
        // continue to get the final response
      }
    }

    yield { content: '', done: true };
  }

  async generate(
    messages: Message[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      tools?: Record<string, Tool>;
    }
  ): Promise<{ content: string; toolCalls?: any[]; toolResults?: any[] }> {
    if (!this.client) {
      throw new Error('provider not initialized');
    }

    const coreMessages: CoreMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    const result = await generateText({
      // model: this.client(this.config.model),
      model: bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
      messages: coreMessages,
      system: options?.systemPrompt,
      // maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      stopWhen: stepCountIs(3),
      tools: options?.tools,
    });

    return {
      content: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
    };
  }
}
