# FlyRank Capstone — Briefly AI

Briefly is a production-minded frontend that turns rough project notes into a structured action brief. Step 1 sends the user's notes to a server-side AI route and Step 2 renders validated structured output: a title, summary, actions, owners, timing, and risks.

## Why this project
The product solves a real workflow: turning scattered notes into something a team can execute. The browser never receives model credentials. The `/api/brief` route uses the Vercel AI SDK and AI Gateway when available, validates the returned JSON shape, and uses a deterministic structured fallback if the model is unavailable or returns malformed output.

## Run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Production notes
- Semantic labels and accessible controls support keyboard and assistive-technology use.
- Input length is validated before generation.
- AI output is constrained to structured fields and validated before rendering.
- The UI shows loading and error states without losing the user's notes.
- The app is responsive and uses the existing lightweight frontend architecture.
- AI credentials stay server-side.

## AI integration
The client calls `POST /api/brief` with the Step 1 notes. The Vercel Function calls a model through the Vercel AI SDK / AI Gateway and asks for strict JSON. The server validates the result before returning it. When the model is unavailable, the same endpoint produces a clearly marked deterministic structured fallback so the Step 1 → Step 2 experience remains usable.

## Deployment
The GitHub repository is connected to Vercel, so pushes to `main` trigger a new production deployment.
