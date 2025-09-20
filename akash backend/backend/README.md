# Ayora Food Journal — Backend

Requirements: Node.js, npm, Postgres (or use Supabase/remote Postgres).

1. Copy .env.example to .env and set DATABASE_URL and AI_SERVICE_URL.
2. Install:
   npm install

3. Run migrations:
   npm run migrate

4. Start (dev):
   npm run dev

5. Start (prod):
   npm start

API:
- GET  /api/health
- POST /api/meals  { user_id, meal_type, food_name, quantity, unit }
- GET  /api/meals?user_id=1&limit=3
- GET  /api/meals/:id
- DELETE /api/meals/:id

## Quick test commands (curl examples)

Run migrations then start backend. If you used local Postgres and .env is set:

cd backend
npm install
cp .env.example .env
# edit .env to set DATABASE_URL, AI_SERVICE_URL
npm run migrate
npm run dev

Health check:

curl http://localhost:4000/api/health

Add a meal (assuming AI service returns something; if AI offline, nutrition will be zero):

curl -X POST http://localhost:4000/api/meals \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"meal_type":"breakfast","food_name":"apple","quantity":1,"unit":"piece"}'

Get last 3 meals:

curl "http://localhost:4000/api/meals?user_id=1&limit=3"

Delete a meal:

curl -X DELETE http://localhost:4000/api/meals/1

## Deploy notes (Render / Supabase / Vercel)

For Render deployment of backend: set DATABASE_URL environment variable in Render to your Supabase/managed Postgres connection string. Set AI_SERVICE_URL to the URL where your AI microservice is deployed (Render or Railway).

Set start command to node index.js.

Make sure to run migrations on first deploy: either run npm run migrate in Render console or convert migration into startup script.

## Troubleshooting & common fixes

If DATABASE_URL missing, the server exits — set it in .env.

If AI calls time out, backend still inserts default nutrition (0) and returns success — check AI URL.

If CORS issues on frontend, ensure frontend fetches http://<backend>/api/... and backend has app.use(cors()).

If connection pool errors appear, ensure the Postgres server accepts connections from your backend host (for Supabase: configure allowed IPs or use Render with private networking).

If you want, I can now:

(A) generate the same backend but using TypeScript

(B) add a simple test script to run automated E2E tests with Jest + supertest

(C) produce a ready-to-run docker-compose.yml that spins up Postgres + backend + ai stub
