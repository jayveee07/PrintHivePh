# Print Hive PH Groq Chat Worker

Use this worker if you want to keep Firebase on the free Spark plan. Firebase Functions require Blaze, but Cloudflare Workers can host this small Groq proxy on a free plan.

## Deploy

1. Create a Cloudflare account.
2. Create a Worker.
3. Paste `groq-ai-chat.js` into the Worker editor.
4. Add these Worker environment variables:

```text
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

5. Deploy the Worker and copy its URL.
6. Set the website env before building:

```text
VITE_AI_CHAT_ENDPOINT=https://your-worker-name.your-account.workers.dev
```

7. Build and deploy Firebase Hosting:

```text
npm run build
firebase deploy --only firestore,hosting
```
