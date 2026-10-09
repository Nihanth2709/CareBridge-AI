<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/489a9419-345c-495a-98d7-2774e57fcbac

## Project structure

- `frontend/` contains the Vite/React app and its static data.
- `backend/` contains the Express API server.
- Root-level files contain shared tooling and project configuration.

There is no database layer in this project yet; the current hospital and sample data is bundled with the frontend.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
