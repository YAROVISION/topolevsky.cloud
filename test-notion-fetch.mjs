import 'dotenv/config';

async function notionFetch(path, body) {
	const token = process.env.NOTION_TOKEN?.trim()
	const url = `https://api.notion.com/v1/${path}`
	
	console.log(`[Notion Fetch] ${body ? 'POST' : 'GET'} ${url}`)
	
	const response = await fetch(url, {
		method: body ? 'POST' : 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28',
			'Content-Type': 'application/json',
		},
		body: body ? JSON.stringify(body) : undefined,
	})

	const data = await response.json()
	if (!response.ok) {
		console.error(`Notion API Error [${response.status}]:`, JSON.stringify(data, null, 2))
		return null
	}
	return data
}

async function testNotion() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  console.log('Testing Database:', databaseId);

  console.log('\n--- 1. Retrieving Database Schema ---');
  const db = await notionFetch(`databases/${databaseId}`);
  if (db) {
    console.log('✅ Database Title:', db.title?.[0]?.plain_text || 'Untitled');
    if (db.properties) {
        console.log('Properties found:', Object.keys(db.properties).join(', '));
    } else {
        console.warn('⚠️ No properties found in database object!');
    }
  }

  console.log('\n--- 2. Querying Published Posts ---');
  const query = await notionFetch(`databases/${databaseId}/query`, {
    filter: {
        property: 'Status',
        select: {
            equals: 'Published',
        },
    },
  });

  if (query) {
    console.log(`✅ Found ${query.results.length} published posts.`);
  } else {
    console.log('❌ Query failed.');
  }

  process.exit(0);
}

testNotion();
