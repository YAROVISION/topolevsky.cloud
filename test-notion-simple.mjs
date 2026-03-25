import 'dotenv/config';
import { Client } from '@notionhq/client';

async function testSimple() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    console.log('Querying database:', databaseId);
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 1
    });
    
    console.log('✅ Query successful!');
    console.log('Number of results:', response.results.length);
    
    if (response.results.length > 0) {
      console.log('Properties found in results:', Object.keys(response.results[0].properties).join(', '));
    } else {
      console.log('No pages found in this database.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testSimple();
