
// Naseem AI Hub - Cloudflare Worker
// Keep GEMINI_API_KEY in Cloudflare Worker Secrets.

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Use POST request.' }, 405);
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'API key is not configured.' }, 500);
    }

    try {
      const body = await request.json();

      const allowed = [
        'writer',
        'translate',
        'caption',
        'script',
        'summary',
        'video_prompt'
      ];

      if (!allowed.includes(body.tool)) {
        return json({ error: 'Unknown tool.' }, 400);
      }

      const prompt = String(body.prompt || '')
        .slice(0, 10000)
        .trim();

      if (!prompt) {
        return json({ error: 'Please enter your idea or text.' }, 400);
      }

      const language = String(body.language || 'English').slice(0, 40);

      const instructions = {
        writer: 'Help the user write clear, useful content.',
        translate: 'Translate accurately and preserve meaning and tone.',
        caption: 'Create 3 engaging social media captions with hashtags.',
        script: 'Write a short, engaging video script with a strong opening and ending.',
        summary: 'Summarize the supplied text into clear key points.',

        video_prompt: `You are a professional AI video prompt creator.
Create a detailed, ready-to-use video generation prompt based on the user's idea.

Use this exact structure:

MUSIC:
Describe suitable background music and sound effects.

DURATION:
Specify the requested video duration.

PLATFORM:
Specify the target platform and aspect ratio.

CHARACTER DESCRIPTION:
Describe the characters, appearance, clothes and expressions.

SCENE OUTLINE:

OPENING:
Describe the first attention-grabbing scene.

DEVELOPMENT:
Describe what happens next, including camera movements.

CLIMAX:
Describe the most exciting or surprising moment.

ENDING:
Describe the final scene and ending shot.

VISUAL STYLE:
Describe lighting, camera quality, realism and visual effects.

Keep the scenes connected and visually consistent.
Make the prompt detailed but easy to copy into an AI video generator.
Do not claim that a video file has been generated.`
      };

      const contents = `${instructions[body.tool]}
Output language: ${language}.
Follow the user's requirements. Do not invent facts.

User input:
${prompt}`;

      const model = 'gemini-3.8-flash';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contents }] }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return json({
          error: data.error?.message || 'AI provider request failed.'
        }, response.status);
      }

      const result = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('\n')
        .trim();

      return json({
        text: result || 'No result returned. Please try again.'
      });

    } catch (error) {
      return json({
        error: 'Invalid request or temporary server error.'
      }, 400);
    }
  }
};
      
