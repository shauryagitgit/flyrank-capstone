# FlyRank Capstone — Briefly AI

Briefly is a small production-minded frontend that turns rough project notes into a structured action brief. It demonstrates an AI-shaped workflow with validation, deterministic structured output, resilient error handling, accessible controls, and responsive UI.

## Why this project
The product solves a real frontend workflow: turning scattered notes into something a team can execute. The AI layer is intentionally represented by a deterministic local adapter in this submission so the demo is reliable without exposing an API key in the browser. The adapter has the same responsibility as an LLM boundary: validate input, return structured fields, and surface failures cleanly. A real provider can be swapped in behind this boundary.

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
- Semantic labels and live feedback support accessible interaction.
- Input length is validated before generation.
- Structured output is rendered into actions, owners, timing, and risks rather than an unbounded text blob.
- The UI contains loading and error states with a retry path.
- The implementation is dependency-light and responsive.
- No secrets are required in the client.

## AI integration path
For a hosted LLM, replace `mockAI()` with a server-side route such as `/api/brief`. Keep provider credentials server-side, validate the response against a schema, and fall back to a safe error message when the provider fails or returns malformed data.
