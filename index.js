require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ─── Constants ───────────────────────────────────────────────────────────────
const OFFICIAL_EMAIL = "kavya2036.be23@chitkara.edu.in";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ALLOWED_KEYS = new Set(["fibonacci", "prime", "lcm", "hcf", "AI"]);

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Generate Fibonacci series of n terms (0-indexed)
 * fibonacci(7) => [0, 1, 1, 2, 3, 5, 8]
 */
function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const series = [0, 1];
  for (let i = 2; i < n; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return series;
}

/**
 * Check if a number is prime
 */
function isPrime(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

/**
 * Filter prime numbers from an array
 */
function filterPrimes(arr) {
  return arr.filter(isPrime);
}

/**
 * GCD of two numbers
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * LCM of two numbers
 */
function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * LCM of an array of numbers
 */
function lcmArray(arr) {
  return arr.reduce((acc, val) => lcm(acc, val));
}

/**
 * HCF (GCD) of an array of numbers
 */
function hcfArray(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

/**
 * Call Google Gemini for single-word AI response
 */
async function askAI(question) {
  if (!GEMINI_API_KEY) {
    throw new Error("AI service is not configured. GEMINI_API_KEY is missing.");
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
  const prompt = `Answer the following question in exactly ONE word. No punctuation, no explanation, just one word.\n\nQuestion: ${question}`;

  let lastError;
  for (const modelName of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, "");
        return text;
      } catch (err) {
        lastError = err;
        if (err.message && err.message.includes("429") && attempt < 2) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

function isInteger(val) {
  return Number.isInteger(val);
}

function isIntegerArray(val) {
  return Array.isArray(val) && val.length > 0 && val.every(Number.isInteger);
}

function isNonEmptyString(val) {
  return typeof val === "string" && val.trim().length > 0;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /health
app.get("/health", (_req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

// GET /bfhl (bonus — some testers hit GET)
app.get("/bfhl", (_req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

// POST /bfhl
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    // ── Validate body is an object ──
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        data: "Invalid request body. Must be a JSON object.",
      });
    }

    // ── Extract the functional key ──
    const keys = Object.keys(body).filter((k) => ALLOWED_KEYS.has(k));

    if (keys.length === 0) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        data: "Missing required key. Must include exactly one of: fibonacci, prime, lcm, hcf, AI.",
      });
    }

    if (keys.length > 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        data: "Request must contain exactly one functional key.",
      });
    }

    const key = keys[0];
    const value = body[key];

    // ── Process each key ──
    switch (key) {
      // ────────── FIBONACCI ──────────
      case "fibonacci": {
        if (!isInteger(value) || value < 0) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: "fibonacci requires a non-negative integer.",
          });
        }
        return res.status(200).json({
          is_success: true,
          official_email: OFFICIAL_EMAIL,
          data: fibonacci(value),
        });
      }

      // ────────── PRIME ──────────
      case "prime": {
        if (!isIntegerArray(value)) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: "prime requires a non-empty array of integers.",
          });
        }
        return res.status(200).json({
          is_success: true,
          official_email: OFFICIAL_EMAIL,
          data: filterPrimes(value),
        });
      }

      // ────────── LCM ──────────
      case "lcm": {
        if (!isIntegerArray(value)) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: "lcm requires a non-empty array of integers.",
          });
        }
        return res.status(200).json({
          is_success: true,
          official_email: OFFICIAL_EMAIL,
          data: lcmArray(value),
        });
      }

      // ────────── HCF ──────────
      case "hcf": {
        if (!isIntegerArray(value)) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: "hcf requires a non-empty array of integers.",
          });
        }
        return res.status(200).json({
          is_success: true,
          official_email: OFFICIAL_EMAIL,
          data: hcfArray(value),
        });
      }

      // ────────── AI ──────────
      case "AI": {
        if (!isNonEmptyString(value)) {
          return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: "AI requires a non-empty string question.",
          });
        }
        try {
          const answer = await askAI(value);
          return res.status(200).json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: answer,
          });
        } catch (aiErr) {
          return res.status(500).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            data: "AI service error: " + aiErr.message,
          });
        }
      }

      default:
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          data: "Unsupported key.",
        });
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      data: "Internal server error.",
    });
  }
});

// ─── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    is_success: false,
    official_email: OFFICIAL_EMAIL,
    data: "Route not found.",
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BFHL API running on port ${PORT}`);
});

module.exports = app;
