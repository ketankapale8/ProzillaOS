const fs = require('fs');
const path = require('path');
const axios = require('axios');

const APP_DIR = __dirname;

if (fs.existsSync(path.join(APP_DIR, '.env'))) {
  try {
    const envContent = fs.readFileSync(path.join(APP_DIR, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    });
  } catch (_) {}
}

const CIRCUIT_RESET_MS = 5 * 60 * 1000;
const _circuitBreaker = {};

function isCircuitOpen(name) {
  const state = _circuitBreaker[name];
  if (!state) return false;
  const elapsed = Date.now() - state.failedAt;
  if (elapsed > CIRCUIT_RESET_MS) {
    delete _circuitBreaker[name];
    return false;
  }
  return true;
}

function openCircuit(name) {
  _circuitBreaker[name] = { failedAt: Date.now() };
  console.warn(`  ⚡ Circuit open for "${name}" embeddings — skipping for ${CIRCUIT_RESET_MS / 60000} min`);
}

async function embedWithGemini(text) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${key}`;
  const res = await axios.post(url, {
    model: 'models/gemini-embedding-2',
    content: { parts: [{ text }] },
    outputDimensionality: 768
  }, { timeout: 15000 });

  const values = res.data?.embedding?.values;
  if (!values) throw new Error('No embedding in Gemini response');
  return { vector: values, provider: 'gemini', model: 'gemini-embedding-2', dims: values.length };
}

let _firstCallDone = false;

async function embedText(text) {
  if (!text || !text.trim()) return new Array(768).fill(0);

  if (process.env.GEMINI_API_KEY && !isCircuitOpen('gemini')) {
    try {
      const result = await embedWithGemini(text);
      if (!_firstCallDone) {
        console.log(`🧲 Embedding: ${result.provider}/${result.model} (${result.dims} dims)`);
        _firstCallDone = true;
      }
      return result.vector;
    } catch (err) {
      console.warn(`  ⚠️  Gemini embedding failed: ${err.message}`);
      openCircuit('gemini');
    }
  }

  console.warn('\n⚠️  All embedding providers unavailable.');
  return null;
}

module.exports = { embedText };
