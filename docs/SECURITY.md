# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | :white_check_mark: |
| 2.x     | :x:                |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of our application seriously. If you discover a security vulnerability, please follow these steps:

1.  Create a GitHub Issue with the **"security"** label.
2.  Include details about the vulnerability and steps to reproduce.
3.  If the vulnerability is sensitive, mark the issue as confidential or contact a maintainer directly via GitHub.

We will acknowledge your report within 48 hours and provide an estimated timeline for a fix.

## 🛡️ Best Practices

### API Keys
- Never commit API keys to the repository.
- Use environment variables (`.env`) for local development.
- Use secure secret storage in production (e.g., Vercel Environment Variables).

### Data Privacy
- This application uses Google Gemini and AWS Polly.
- User audio is processed but not permanently stored unless explicitly saved.
- Review the [Privacy Policy](PRIVACY.md) for more details.

### Dependencies
- We regularly audit dependencies using `npm audit`.
- Please keep dependencies up to date to avoid known vulnerabilities.
