# BFHL API — Qualifier 1 | Chitkara University 2026

REST API with two endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bfhl` | Fibonacci, Prime, LCM, HCF, AI |
| GET | `/health` | Health check |

## Setup

```bash
npm install
```

Create a `.env` file (optional, for local dev):

```
GEMINI_API_KEY=your_google_gemini_api_key_here
```

## Run Locally

```bash
node index.js
```

Server runs on `http://localhost:3000`.

## Deploy to Vercel

1. Push to a **public** GitHub repo.
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo.
3. Add environment variable: `GEMINI_API_KEY` = your key.
4. Deploy.

## Example Requests

```bash
# Health
curl https://YOUR_URL/health

# Fibonacci
curl -X POST https://YOUR_URL/bfhl -H "Content-Type: application/json" -d '{"fibonacci": 7}'

# Prime
curl -X POST https://YOUR_URL/bfhl -H "Content-Type: application/json" -d '{"prime": [2,4,7,9,11]}'

# LCM
curl -X POST https://YOUR_URL/bfhl -H "Content-Type: application/json" -d '{"lcm": [12,18,24]}'

# HCF
curl -X POST https://YOUR_URL/bfhl -H "Content-Type: application/json" -d '{"hcf": [24,36,60]}'

# AI
curl -X POST https://YOUR_URL/bfhl -H "Content-Type: application/json" -d '{"AI": "What is the capital city of Maharashtra?"}'
```
