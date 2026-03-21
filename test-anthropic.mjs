import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  console.log('Testing Anthropic API Key...');
  console.log('Key prefix:', process.env.ANTHROPIC_API_KEY?.substring(0, 10));
  
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 10,
      messages: [
        { role: 'user', content: 'Hello, are you active?' }
      ],
    });
    console.log('SUCCESS!');
    console.log('Response:', message.content[0].text);
  } catch (err) {
    console.error('FAILED!');
    if (err.status === 400 && err.message?.includes('balance')) {
      console.error('Reason: Credit balance is really too low on Anthropic side.');
    } else {
      console.error('Error details:', err);
    }
  }
}

main();
