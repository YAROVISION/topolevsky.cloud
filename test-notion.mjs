import 'dotenv/config';
import { Client } from '@notionhq/client';

async function testNotion() {
  const token = process.env.NOTION_TOKEN?.trim();
  const rawDatabaseId = process.env.NOTION_DATABASE_ID?.trim() || '';
  
  const databaseId = rawDatabaseId.includes('-') && rawDatabaseId.length > 32 
    ? rawDatabaseId.split('-').pop()?.trim() 
    : rawDatabaseId.trim();

  const notion = new Client({ auth: token });

  try {
    console.log('--- Initial Connection ---');
    console.log('Using ID:', databaseId);
    
    let obj = await notion.databases.retrieve({ database_id: databaseId });
    console.log('✅ Object retrieved!');
    console.log('Object Type:', obj.object);
    
    // Check if we need to switch to data_source ID
    if (!obj.properties && obj.data_sources && obj.data_sources.length > 0) {
      const dsId = obj.data_sources[0].id;
      console.log('⚠️ Properties missing. Switching to Data Source ID:', dsId);
      obj = await notion.databases.retrieve({ database_id: dsId });
      console.log('✅ Data Source Object retrieved!');
    }

    if (obj.properties) {
      console.log('\n--- Properties found ---');
      const propNames = Object.keys(obj.properties);
      console.log('Properties:', propNames.join(', '));
      
      const required = ['Status', 'Title', 'Summary', 'Slug', 'Date', 'Category'];
      required.forEach(p => {
        if (!obj.properties[p]) {
          console.warn(` ❌ MISSING: "${p}"`);
        } else {
          console.log(` ✅ FOUND: "${p}" (${obj.properties[p].type})`);
        }
      });
      
    console.log('\n--- Querying Data (No Filter) ---');
    const query = await notion.databases.query({
      database_id: databaseId, // Use the original ID
      page_size: 5
    });
    console.log(`Total results found: ${query.results.length}`);
    
    if (query.results.length > 0) {
        const first = query.results[0];
        console.log('\n--- First Result Properties ---');
        console.log('Available Properties:', Object.keys(first.properties).join(', '));
    } else {
        console.warn('⚠️ No records found in the database.');
    }
    } else {
      console.error('❌ Still no properties found on this object.');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testNotion();
