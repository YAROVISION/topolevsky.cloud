import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY
});

async function testConnection() {
  console.log(`Checking connection to Qdrant at: ${process.env.QDRANT_URL || 'http://localhost:6333'}...`);
  try {
    const collections = await qdrant.getCollections();
    console.log('✅ Qdrant connection successful!');
    console.log('Collections count:', collections.collections.length);
    collections.collections.forEach(c => console.log(` - ${c.name}`));
  } catch (error) {
    console.error('❌ Qdrant connection failed!');
    console.error('Error details:', error.message);
    console.log('\nHint: Check if the SSH tunnel is running and reachable.');
  }
}

testConnection();
