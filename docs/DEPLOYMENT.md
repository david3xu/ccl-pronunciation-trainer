# Deployment

## Build

```bash
npm run build
```

Output directory: `dist/`

## Vercel (Recommended)

### Setup

- Framework preset: **Vite**
- Build command: `npm run vercel-build`
- Output directory: `dist`

The `vercel-build` script runs the full pipeline: data processing + Vite build + copy processed data to `dist/`.

### Environment Variables

Set these in the Vercel dashboard (Settings → Environment Variables):

| Variable | Purpose | Notes |
|----------|---------|-------|
| `GEMINI_API_KEY` | Google Gemini AI | Server-side only (no `VITE_` prefix) |
| `AWS_ACCESS_KEY_ID` | AWS Polly TTS | Server-side only |
| `AWS_SECRET_ACCESS_KEY` | AWS Polly TTS | Server-side only |
| `AWS_REGION` | AWS region | Server-side only |
| `VITE_SUPABASE_URL` | Supabase project URL | Client-side (safe) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Client-side (safe, RLS enforced) |

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

Pipeline on push and pull requests:

1. **Lint** — `npm run lint`
2. **Test** — `npm test`
3. **Build** — `npm run build`

## Manual Deployment

For static hosts (Netlify, AWS S3, Cloudflare Pages, etc.):

```bash
npm run deploy   # data:pte + build + validate:all
```

Upload the `dist/` folder to your hosting provider.
