// test calculation tool to see tool calls clearly
import { createRubyHttpClient } from '@ruby/core';

async function testCalcTool() {
  try {
    console.log('🧪 testing calculation tool...');

    const client = createRubyHttpClient({
      serverUrl: 'http://localhost:3001',
    });

    // auto-confirm handler
    client.setConfirmationHandler(async (request) => {
      console.log(`\n🔧 tool confirmation: ${request.toolName} - ${request.message}`);
      console.log('✅ auto-confirming...\n');
      return true;
    });

    // create session
    const sessionId = await client.createSession(
      'you are ruby, a helpful ai assistant. you MUST use the calculate tool for math problems.'
    );

    console.log('🧮 asking: calculate 123 + 456');
    
    for await (const chunk of client.chatStream(sessionId, 'calculate 123 + 456')) {
      if (chunk.done) {
        console.log('\n✅ done');
        break;
      } else {
        process.stdout.write(chunk.content);
      }
    }

    await client.deleteSession(sessionId);

  } catch (error) {
    console.error('❌ test failed:', error);
  }
}

testCalcTool();