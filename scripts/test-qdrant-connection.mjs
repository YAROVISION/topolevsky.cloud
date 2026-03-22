import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'https://qdrant.lexis.blog',
  apiKey: process.env.QDRANT_API_KEY,
  port: 443,
  checkCompatibility: false
});

console.log('Qdrant Client config:', {
  url: process.env.QDRANT_URL || 'https://qdrant.lexis.blog',
  apiKey: process.env.QDRANT_API_KEY ? 'present' : 'missing',
  port: 443
});

async function testConnection() {
  console.log(`Checking connection to Qdrant at: ${process.env.QDRANT_URL || 'https://qdrant.lexis.blog'} (port 443)...`);
  try {
    const collections = await qdrant.getCollections();
    console.log('✅ Qdrant connection successful!');
    console.log('Collections count:', collections.collections.length);
    collections.collections.forEach(c => console.log(` - ${c.name}`));
  } catch (error) {
    console.error('❌ Qdrant connection failed!');
    console.error('Error message:', error.message);
    console.error('Error cause:', error.cause);
    if (error.stack) console.error('Stack trace:', error.stack);
    console.log('\nHint: Check if the Qdrant instance is reachable at https://qdrant.lexis.blog.');
  }
}

testConnection();
