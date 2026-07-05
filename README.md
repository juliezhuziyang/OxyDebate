# Oxymorona Debate

Website for the Oxymorona Debate Community — AI practice, global sessions, tournaments, announcements, and debate guides.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Edge Functions)

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:8080](http://localhost:8080).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/           React application source
public/        Static assets
supabase/      Database migrations and Edge Functions
```

## Supabase

This project connects to a hosted Supabase instance. Database schema is managed via migrations in `supabase/migrations/`.
