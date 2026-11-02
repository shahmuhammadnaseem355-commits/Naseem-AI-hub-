NASEEM AI HUB — ANDROID SETUP NOTES

Files:
- index.html: the website front end
- worker.js: secure AI backend for Cloudflare Workers

IMPORTANT COST / LIMITS
- Static hosting can be free. AI usage is subject to the provider's free quota, rate limits, region and model availability. It is not unlimited or guaranteed free forever.
- Do not publish your Gemini API key in index.html or in a public GitHub repository.
- This starter uses text features only: writer, translator, captions, scripts and summaries. Image, voice and video generation require separate services and may cost money.

A) CREATE THE AI KEY
1. Open https://aistudio.google.com/ in Chrome and sign in.
2. Open API keys and create an API key.
3. Copy it privately. Do not send it to anyone or paste it into the website code.
4. Check current free-tier availability and quotas at https://ai.google.dev/gemini-api/docs/pricing .

B) DEPLOY THE BACKEND
1. Open https://dash.cloudflare.com/ and create/sign in to an account.
2. Open Workers & Pages, create a Worker, and choose the option to start/deploy a Worker.
3. Replace the starter code with all the contents of worker.js and deploy.
4. In the Worker settings, open Variables and Secrets. Add a secret named GEMINI_API_KEY and paste your key as its value. Save/deploy.
5. Copy the Worker URL, e.g. https://your-worker-name.your-subdomain.workers.dev .

C) PUBLISH THE WEBSITE
1. Open https://github.com/ in Chrome and create/sign in to an account.
2. Create a new PUBLIC repository named naseem-ai-hub.
3. Add/upload index.html from this folder to the repository root. Commit the file.
4. Open https://dash.cloudflare.com/ > Workers & Pages > Create > Pages > Connect to Git.
5. Connect GitHub and select naseem-ai-hub. For a plain HTML site, use no build command and set the build output directory to / (or the root directory, depending on the screen). Deploy.
6. Copy the published Pages URL.

D) CONNECT WEBSITE TO BACKEND
1. Open index.html in GitHub and tap Edit (pencil).
2. Find: const API_URL = "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE";
3. Replace only the text inside the quotes with your Worker URL.
4. Commit changes. Cloudflare Pages should redeploy automatically.
5. Open your Pages URL, choose AI Writer, enter a short prompt and test.

SAFETY / LAUNCH CHECKLIST
- Never put GEMINI_API_KEY in HTML, JavaScript, screenshots or public GitHub.
- Add rate limiting / abuse protection before sharing widely. A public demo can be abused and use up your free quota.
- Test with non-sensitive text. Check provider terms and privacy rules before handling visitor data.
- Add About, Contact, Privacy Policy and Terms pages before seeking ad monetization.
- A free subdomain is fine for testing; a custom domain usually costs money.
