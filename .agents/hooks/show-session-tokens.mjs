#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const METRICS_FILE = path.resolve(__dirname, '..', 'metrics', 'session-tokens.json');

const fmt = new Intl.NumberFormat('es-419');

if (!fs.existsSync(METRICS_FILE)) {
  console.log('No hay métricas de tokens registradas todavía en .agents/metrics/session-tokens.json');
  process.exit(0);
}

const store = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
const sessions = Object.values(store.sessions ?? {}).sort((a, b) =>
  String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''))
);

const rows = sessions.map((s) => ({
  Sesion: String(s.conversationId ?? '').slice(0, 8),
  Turnos: s.plannerTurns ?? 0,
  Input: fmt.format(s.inputTokens ?? 0),
  Output: fmt.format(s.outputTokens ?? 0),
  CacheRead: fmt.format(s.cacheReadTokens ?? 0),
  Total: fmt.format(s.totalTokens ?? 0),
  Actualizado: String(s.updatedAt ?? '').replace('T', ' ').slice(0, 19),
}));

console.log('\nEventify — Consumo de tokens por sesión');
console.table(rows);

if (store.summary) {
  console.log(
    `Acumulado (${store.summary.totalSessions ?? 0} sesiones): ` +
      `${fmt.format(store.summary.totalTokens ?? 0)} total ` +
      `(${fmt.format(store.summary.totalInputTokens ?? 0)} input · ` +
      `${fmt.format(store.summary.totalOutputTokens ?? 0)} output · ` +
      `${fmt.format(store.summary.totalCacheReadTokens ?? 0)} cache read)\n`
  );
}
