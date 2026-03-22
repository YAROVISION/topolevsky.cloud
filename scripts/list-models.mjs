import 'dotenv/config'
async function list() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    const names = data.models.map(m => m.name).filter(n => n.includes('gemini'));
    console.log('Available models:', names);
  } else {
    console.error('Error fetching models:', data);
  }
}
list();
