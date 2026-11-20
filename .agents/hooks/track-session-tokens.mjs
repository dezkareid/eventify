#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const METRICS_DIR = path.resolve(__dirname, '..', 'metrics');
const METRICS_FILE = path.join(METRICS_DIR, 'session-tokens.json');

function toSafeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}

function parseTranscriptTokens(transcriptPath) {
  const raw = fs.readFileSync(transcriptPath, 'utf8');
  const lines = raw.split('\n');

  let inputTokens = 0;
  let cacheReadTokens = 0;
  let outputTokens = 0;
  let plannerTurns = 0;
  let firstStepAt = null;
  let lastStepAt = null;
  const byModel = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry;
    try {
      entry = JSON.parse(trimmed);
    } catch {
      continue;
    }

    if (typeof entry.created_at === 'string') {
      if (!firstStepAt) firstStepAt = entry.created_at;
      lastStepAt = entry.created_at;
    }

    const hasTokenFields =
      typeof entry.input_tokens === 'number' ||
      typeof entry.output_tokens === 'number' ||
      typeof entry.cache_read_tokens === 'number';

    if (!hasTokenFields) continue;

    const stepInput = toSafeNumber(entry.input_tokens);
    const stepCacheRead = toSafeNumber(entry.cache_read_tokens);
    const stepOutput = toSafeNumber(entry.output_tokens);

    inputTokens += stepInput;
    cacheReadTokens += stepCacheRead;
    outputTokens += stepOutput;
    plannerTurns += 1;

    const modelKey = typeof entry.model === 'string' && entry.model ? entry.model : 'unknown';
    if (!byModel[modelKey]) {
      byModel[modelKey] = {
        turns: 0,
        inputTokens: 0,
        cacheReadTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      };
    }

    byModel[modelKey].turns += 1;
    byModel[modelKey].inputTokens += stepInput;
    byModel[modelKey].cacheReadTokens += stepCacheRead;
    byModel[modelKey].outputTokens += stepOutput;
    byModel[modelKey].totalTokens += stepInput + stepOutput;
  }

  return {
    plannerTurns,
    inputTokens,
    cacheReadTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    byModel,
    firstStepAt,
    lastStepAt,
  };
}

function loadStore() {
  if (!fs.existsSync(METRICS_FILE)) {
    return { summary: {}, sessions: {} };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    if (parsed && typeof parsed === 'object' && parsed.sessions && typeof parsed.sessions === 'object') {
      return parsed;
    }
  } catch {
    // Recreate clean store if corrupted
  }
  return { summary: {}, sessions: {} };
}

function recomputeSummary(sessions) {
  const entries = Object.values(sessions);
  let totalInputTokens = 0;
  let totalCacheReadTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;

  for (const session of entries) {
    totalInputTokens += toSafeNumber(session.inputTokens);
    totalCacheReadTokens += toSafeNumber(session.cacheReadTokens);
    totalOutputTokens += toSafeNumber(session.outputTokens);
    totalTokens += toSafeNumber(session.totalTokens);
  }

  return {
    totalSessions: entries.length,
    totalInputTokens,
    totalCacheReadTokens,
    totalOutputTokens,
    totalTokens,
    updatedAt: new Date().toISOString(),
  };
}

function saveStoreAtomically(store) {
  fs.mkdirSync(METRICS_DIR, { recursive: true });
  const tempPath = `${METRICS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, METRICS_FILE);
}

async function main() {
  try {
    const stdinRaw = await readStdin();
    if (stdinRaw) {
      const payload = JSON.parse(stdinRaw);
      const conversationId =
        typeof payload.conversationId === 'string' && payload.conversationId.trim()
          ? payload.conversationId.trim()
          : null;
      const transcriptPath =
        typeof payload.transcriptPath === 'string' && payload.transcriptPath.trim()
          ? payload.transcriptPath.trim()
          : null;

      if (conversationId && transcriptPath && fs.existsSync(transcriptPath)) {
        const stats = parseTranscriptTokens(transcriptPath);
        const store = loadStore();

        store.sessions[conversationId] = {
          conversationId,
          modelName: typeof payload.modelName === 'string' ? payload.modelName : 'unknown',
          terminationReason:
            typeof payload.terminationReason === 'string' ? payload.terminationReason : 'UNKNOWN',
          ...stats,
          updatedAt: new Date().toISOString(),
        };

        store.summary = recomputeSummary(store.sessions);
        saveStoreAtomically(store);
      }
    }
  } catch (error) {
    // Never block the agent Stop lifecycle; log diagnostics only to stderr
    process.stderr.write(`[session-token-tracker] ${error instanceof Error ? error.message : String(error)}\n`);
  }

  process.stdout.write(`${JSON.stringify({ decision: 'allow' })}\n`);
}

await main();
