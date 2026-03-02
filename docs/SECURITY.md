# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.x | Yes |
| < 3.0 | No |

## Reporting Vulnerabilities

Open a GitHub Issue with the **"security"** label:

https://github.com/david3xu/ccl-pronunciation-trainer/issues

Include steps to reproduce and any relevant details. Avoid disclosing exploit details publicly before a fix is available.

## API Key Management

- **Never** commit API keys or secrets to the repository
- Use `.env` files locally (`.env` is in `.gitignore`)
- Use Vercel environment variables in production

### Key Exposure Rules

| Key | Client-safe? | Notes |
|-----|-------------|-------|
| `GEMINI_API_KEY` | No | Server-side only, no `VITE_` prefix |
| `AWS_ACCESS_KEY_ID` | No | Server-side only |
| `AWS_SECRET_ACCESS_KEY` | No | Server-side only |
| `VITE_SUPABASE_URL` | Yes | Public project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Security enforced via Row Level Security (RLS) |

Only variables prefixed with `VITE_` are bundled into the client-side build by Vite. Server-side keys are used exclusively in Vercel serverless functions (`api/` directory).

## AI Chat Middleware

The AI chat API route validates incoming requests:
- Maximum message length enforced
- Request body size limited
- Input sanitized before forwarding to Gemini
