#!/usr/bin/env node
// ruby server entry point
import 'dotenv/config';
import { createRubyServer } from './server.js';

async function main() {
  const server = await createRubyServer({
    port: parseInt(process.env.RUBY_SERVER_PORT || '3001'),
    host: process.env.RUBY_SERVER_HOST || 'localhost',
    provider: {
      provider: 'bedrock',
      model: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      region: 'us-east-1',
    },
  });

  await server.start();

  // graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nshutting down ruby server...');
    await server.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('failed to start ruby server:', error);
  process.exit(1);
});