// test http client e2e
import { createRubyHttpClient } from '@ruby/core';

async function testHttpFlow() {
  try {
    console.log('🧪 testing ruby http client...');

    const client = createRubyHttpClient({
      serverUrl: 'http://localhost:3001',
    });

    // set confirmation handler
    client.setConfirmationHandler(async (request) => {
      console.log(`\n🔧 tool confirmation requested:`);
      console.log(`   tool: ${request.toolName}`);
      console.log(`   message: ${request.message}`);
      console.log(`   args: ${JSON.stringify(request.args, null, 2)}`);
      
      // auto-confirm for testing
      console.log('✅ auto-confirming tool execution...\n');
      return true;
    });

    // test health
    const health = await client.health();
    console.log('✅ server health:', health);

    // create session
    const sessionId = await client.createSession(
      'you are ruby, a helpful ai assistant. you MUST use the available tools when users ask for weather information or calculations.'
    );
    console.log('✅ session created:', sessionId);

    console.log('\n🎯 testing weather tool with confirmation...');
    
    let response = '';
    for await (const chunk of client.chatStream(sessionId, 'what is the weather in tokyo?')) {
      if (chunk.done) {
        console.log('\n✅ streaming completed');
        break;
      } else {
        response += chunk.content;
        process.stdout.write(chunk.content);
      }
    }

    console.log('\n\nfull response:', response);

    // cleanup
    await client.deleteSession(sessionId);
    console.log('✅ session deleted');

  } catch (error) {
    console.error('❌ test failed:', error);
  }
}

testHttpFlow();