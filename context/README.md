# EventSense handoff context

Read `server/README.md` for setup and route contracts. `specification.txt` is the user's full original specification; `spec-summary.md` records the main requirements and current implementation state.

The server is an ESM NestJS 12 project (`.js` suffixes in TypeScript imports), Prisma 6 with PostgreSQL, and Vitest. Backend source is in `server/src`, schema and seed in `server/prisma`. The Next.js client in `client` has not been changed.
