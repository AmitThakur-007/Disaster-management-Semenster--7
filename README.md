# Community Disaster Watch

A community reporting application for Himalayan WhiteHouse International College, Putalisadak, Kathmandu, Nepal, affiliated with Purbanchal University.

## Foundation

React + Vite and plain CSS form the frontend. Node.js + Express provides the API. PostgreSQL stores accounts, reports, area subscriptions, notifications, sessions, review history, and analysis jobs. Prisma defines the database schema and migrations. Docker Compose packages the API (which also serves the built frontend), database, migration step, and background worker. Ollama runs the configurable language model on the host computer.

The current foundation includes resident registration and sign-in, photo reports, community browsing, administrator review for assigned wards, persistent in-app notifications, and weather-assisted text analysis. The incident lifecycle migration adds severity/location metadata, Reported/Verified/Rejected/Responding/Resolved states, traceable activity events, response organizations/teams, acknowledged assignments, and jurisdiction-scoped overview counts. External SMS/push, image interpretation, vLLM, and disaster prediction are not implemented.

## Quick local run (no Docker, no PostgreSQL)

The current code uses a built-in in-memory data store (`server/db.js`), so only Node.js 20.9+ is needed.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Demo accounts: `admin@disasterwatch.np` / `Administrator123!` (admin) and `responder@disasterwatch.np` / `ResponderPass123!` (responder). Register a new account to act as a resident. Data resets each time the server restarts. Ollama and internet are optional; the app falls back to built-in weather and a heuristic assessment.

## Run with Docker (PostgreSQL database)

```sh
docker compose up --build
```

Open http://localhost:3000. pgAdmin (database viewer) is at http://localhost:5050 and is pre-connected to the database. The `migrate` service creates the tables and seeds the wards, administrator, demo responder and a response team. Data persists in Docker volumes. Stop with `Ctrl+C` then `docker compose down` (add `-v` only to delete all data).

If `DATABASE_URL` is not set (for example `npm run dev`), the app uses the in-memory demo store instead.

## Start on this computer (PostgreSQL/Prisma variant, not wired up in this copy)

A local `.env` has been prepared with randomly generated project credentials. It is ignored by Git. Read `ADMIN_EMAIL` and `ADMIN_PASSWORD` there to sign in as the administrator; do not share or commit that file. Docker Desktop and the host Ollama service must be running.

```sh
npm install
npm run db:generate
docker compose up -d db
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://127.0.0.1:5173. `npm run dev` starts the frontend, API, and analysis worker. The default database port is 15432 to avoid interfering with another PostgreSQL installation. If you change `DB_PORT`, also update `DATABASE_URL` in `.env` for host development.

## Set up on a student's computer

Install Node.js 22.12 or newer, Docker Desktop with Linux containers, and Ollama. Copy `.env.example` to `.env`. Choose a unique database password and use the same value in `DATABASE_URL` and `POSTGRES_PASSWORD`. Set a unique administrator password of at least 12 characters. Set `OLLAMA_MODEL` to an installed model capable of structured text responses. Pull the configured model using `ollama pull llama3.2:latest` if required. Then follow the startup commands above.

The seed creates two initial Kathmandu ward areas and an administrator assigned to both. It does not reset existing administrator passwords. Ward coordinates are representative points for weather retrieval, not authoritative boundaries or the exact observation location. Students should verify and expand these areas with appropriate local data. Registration always creates a resident; administrator accounts are provisioned through the seed, never public registration.

## Run the containerized application

```sh
docker compose up --build -d
docker compose run --rm api node prisma/seed.js
```

Open http://127.0.0.1:3001. The migration service applies the committed schema before the API and worker start. Compose sets the API origin and database address for container networking. The worker connects to your existing host Ollama at `host.docker.internal:11434`, preserving your installed models.

On Windows, host Ollama may need to listen on an interface reachable from Docker rather than loopback alone. If the worker cannot reach it, configure Ollama's `OLLAMA_HOST` to a suitable host interface and restart Ollama. Restrict inbound access to the local Docker network; do not expose an unauthenticated inference endpoint publicly. Native development can continue using `127.0.0.1:11434` without this change.

```sh
docker compose ps
docker compose logs --tail 50 api worker
docker compose stop
```

Database and photo volumes survive container restarts and `docker compose down`. Do not use `down -v` unless you intend to delete project data. Stop native development before running the containerized API on the same port.

## Application workflow

1. Register a resident account.
2. Open Notifications and subscribe to a ward.
3. Submit a photo and description for that ward.
4. The database transaction saves the report, an analysis job, and notifications for subscribers and assigned administrators.
5. The worker fetches three past days and three forecast days (including today) from Open-Meteo, then asks Ollama for a structured assessment.
6. Sign in as the administrator to see assigned reports, weather provenance, assessment uncertainties, verification questions, and processing status.
7. Update the review status. The reporter and current subscribers receive an in-app update.

Notifications refresh every 20 seconds while signed in and can be refreshed manually. They are not SMS, email, or device push notifications. Subscriptions apply to future events. Community lists and inboxes currently show the latest 100 records; pagination is a student extension.

## Analysis and failure handling

The model reads the description and weather data. It does not inspect the photo, infer a verified disaster probability, or issue official alerts. Assessment text is visible only to assigned administrators; residents see processing status. Administrative status labels describe the review workflow, not a scientific confirmation of hazard or safety.

Weather data comes from [Open-Meteo](https://open-meteo.com/), with retrieval time, coordinates, units, and daily values saved alongside the assessment. Past dates are weather-model data, not verified local measurements. The analysis uses weather retrieved at processing time; reported time is supplied separately. The service requires internet access for weather retrieval. Review provider terms before public or commercial deployment.

Jobs are claimed atomically in PostgreSQL. The worker applies timeouts, retries three times with increasing delay, and records errors. A failed job can be retried by an assigned administrator. Jobs interrupted by a worker crash are recovered after five minutes. Report submission remains independent of weather and Ollama availability. Processing is at least once; a recovered job may run inference again. No separate message broker is needed for this scope.

Passwords use salted scrypt hashes. Browser sessions use random tokens in HttpOnly, SameSite cookies; only token hashes are stored. API writes check the exact origins in `APP_ORIGINS` (a comma-separated allowlist); legacy `APP_ORIGIN` remains the single-origin fallback. Local development allows the documented `localhost` and `127.0.0.1` URLs, and Compose sets the matching port-3001 origins. If you change the URL used in the browser, add that exact origin to the allowlist. Authentication requests are rate limited. Uploads are size limited, decoded, resized, re-encoded as JPEG, and stripped of metadata. Public registration cannot choose an administrator role. Report status changes are stored in review history.

For internet deployment, configure HTTPS and `COOKIE_SECURE=true`, set the actual `APP_ORIGIN`, verify proxy/rate-limit settings, establish backup and retention policies, and add account recovery, monitoring, and stronger operational controls. This base is not integrated with an actual government authority. An administrator here is an application role.

## Code-reading guide

| File | What students should study |
|---|---|
| `src/main.jsx` | Components, forms, state, account flows, polling, and API requests |
| `src/styles.css` | Responsive layout and accessible controls |
| `server/app.js` | Routes, permissions, transactions, uploads, and notifications |
| `server/auth.js` | Password hashes, session tokens, and cookies |
| `prisma/schema.prisma` | Relations, unique constraints, and indexes |
| `prisma/migrations/` | Versioned database changes |
| `server/analysis.js` | Weather retrieval, prompting, output schema, and validation |
| `server/jobs.js` | Atomic claims, retries, and worker recovery |
| `compose.yaml`, `Dockerfile` | Networking, persistent volumes, images, and service startup |

Prisma 6 is pinned for the straightforward schema/client workflow used here. Patched `effect` and `deepmerge-ts` versions are overridden in Prisma's configuration tooling. Keep the lockfile; repeat schema generation, migration checks, and the dependency audit when updating tooling.

## Verification

```sh
npm test
npm run build
node --env-file=.env scripts/verify.js
```

Unit checks cover password verification, upload fields/signatures/size, invalid model output, and missing weather data. The integration check uses PostgreSQL and isolated temporary records to exercise authentication, roles, area permissions, image storage, notifications, review history, worker success/failure, private assessments, and logout. Run it against a dedicated development database with no other active jobs or worker. It removes only its own test records and photos.

After changing the Prisma schema, use `npx prisma migrate dev --name describe_change` during development and commit the resulting migration. Containers use `prisma migrate deploy` to apply committed migrations.

## Incident lifecycle additions

Apply the additive lifecycle migration with `npm run db:migrate` after starting PostgreSQL. Existing `Submitted` records migrate to `Reported`, and existing `Under review` records migrate to `Verified`; no tables or volumes are reset. Authorities use the existing `ADMIN` role and assigned ward areas to verify/reject reports, create response organizations and teams through the admin API, and assign verified reports. An account must be provisioned with the trusted `RESPONDER` role and added to a team by an administrator before it can acknowledge assignments or mark an acknowledged assignment as Responding. Public registration cannot select privileged roles. Acknowledgement is recorded in the platform and does not claim a physical deployment.

This remains a Phase I foundation rather than the complete requested platform. It does not yet include a map UI, responder-facing dashboard, full user/jurisdiction administration panel, service-area matching, pagination, or a complete end-to-end test for team acknowledgement and resolution. Exact coordinates and locality are withheld in the general community feed; report evidence is limited to its reporter, an assigned-area administrator, or an assigned responder. The API and UI show lifecycle activity and basic area-filtered counts.

## Final defense preparation

Students should be able to explain the report transaction, database relationships, resident/admin permissions, container networking, persistent volumes, and why inference runs outside the request. Demonstrate report submission with Ollama stopped, then show a failed/retried analysis. Present a small evaluation using reviewed scenarios: structured output validity, assessment usefulness, failure rate, and response times. Clearly distinguish weather context analysis from validated disaster prediction.

## Repository handoff

No global Git identity is required. Configure your chosen non-official identity locally before committing:

```sh
git init
git config --local user.name "YOUR PROJECT NAME"
git config --local user.email "YOUR NON-OFFICIAL EMAIL"
git add .
git commit -m "Add community disaster reporting foundation"
```

Replace both placeholders. Create your remote repository and invite the students. `.env`, local uploads, dependencies, and generated builds are ignored. Never commit credentials or real personal reports.



To verify the actual weather-to-model connection separately, run `node --env-file=.env scripts/check-analysis.js` (requires internet and host Ollama). With the containers running, `docker compose exec api node scripts/verify-live.js` checks a synthetic report through the real worker, weather retrieval, model, administrator review, and notifications; it cleans up its own test account, report, and photo. The configured administrator credentials must match the seeded account.
