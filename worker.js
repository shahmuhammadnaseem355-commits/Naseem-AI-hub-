// Cloudflare Worker: keep GEMINI_API_KEY in Worker Secrets. Never expose it in index.html.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
function json(data, status=200) { return new Response(JSON.stringify(data), {status, headers:{...cors,'Content-Type':'application/json'}}); }
export default {
 async fetch(request, env) {
  if (request.method === 'OPTIONS') return new Response(null,{headers:cors});
  if (request.method !== 'POST') return json({error:'Use POST'},405);
  if (!env.GEMINI_API_KEY) return json({error:'Server API key is not configured.'},500);
  try {
   const body=await request.json();
   const allowed=['writer','translate','caption','script','summary'];
   if(!allowed.includes(body.tool)) return json({error:'Unknown tool.'},400);
   const prompt=String(body.prompt||'').slice(0,10000).trim();
   if(!prompt) return json({error:'Please enter text.'},400);
   const language=String(body.language||'English').slice(0,40);
   const instructions={
    writer:'Help the user write clear, useful content.',
    translate:'Translate the supplied text accurately. Preserve meaning and tone.',
    caption:'Create 3 engaging social media caption options with relevant hashtags.',
    script:'Write a short, engaging video script with a strong opening and clear ending.',
    summary:'Summarize the supplied text into clear key points.'
   };
   const contents=`${instructions[body.tool]} Output language: ${language}. Follow the user's request. Do not invent facts.\n\nUser input:\n${prompt}`;
   const model='gemini-3.8-flash';
   const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:contents}]}]})
   });
   const data=await response.json();
   if(!response.ok) return json({error:data.error?.message||'AI provider request failed.'},response.status);
   const text=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n').trim();
   return json({text:text||'No text was returned. Please try again.'});
  } catch(e) { return json({error:'Invalid request or temporary server error.'},400); }
 }
};
