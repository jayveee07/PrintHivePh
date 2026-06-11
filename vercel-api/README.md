# Print Hive PH Groq Chat on Vercel

Use this if you want Firebase Hosting to stay on the free Spark plan.

The serverless route is:

```text
api/ai-chat.js
```

## Deploy

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add these Vercel environment variables:

```text
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

4. Deploy on Vercel.
5. Copy your Vercel URL and set the Firebase frontend endpoint:

```text
VITE_AI_CHAT_ENDPOINT=https://your-vercel-project.vercel.app/api/ai-chat
```

6. Rebuild and deploy Firebase Hosting:

```text
npm run build
firebase deploy --only hosting
```
