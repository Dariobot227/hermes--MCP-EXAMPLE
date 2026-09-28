export interface StatusHistoryEntry {
  status: RunStatus;
  timestamp: Date;
}

export interface Run {
  id: string;
  agentName: string;
  summary: string;
  status: RunStatus;
  statusHistory: StatusHistoryEntry[];
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  tokenUsage: number | null;
}

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'blocked';

const now = new Date();

const agents = [
  'codex-agent',
  'claude-agent',
  'gemini-agent',
  'gpt5-agent',
  'hermes-agent',
  'aries-agent',
  'orion-agent',
];

const summaries = [
  'Scoped and architected the payments microservice — defined API contracts, data model, and deployment topology.',
  'Implemented OAuth2 refresh-token rotation with automatic revocation on compromise detection.',
  'Wrote integration tests for the webhook dispatcher covering retry backoff, signature verification, and dead-letter handling.',
  'Refactored the search indexer to use a pooled connection model, cutting p95 latency from 340ms to 92ms.',
  'Investigated the memory leak in the PDF renderer; traced it to a closure over a 2GB buffer and submitted a fix.',
  'Generated a migration plan for the users table — breaking changes flagged, rollback script included.',
  'Benchmarked three candidate vector databases (Qdrant, Weaviate, Milvus) and produced a weighted decision matrix.',
  'Paired with the on-call engineer to resolve the 2AM alerts: unbounded queue growth in the notification service.',
  'Drafted the RFC for moving from REST to gRPC for internal service-to-service calls.',
  'Reviewed 14 PRs across the monorepo; caught a subtle race condition in the idempotency-key middleware.',
  'Built a proof-of-concept for on-device inference using the new Wasm runtime — initial benchmarks are promising.',
  'Audited AWS spend and identified 3 unused RDS instances and a runaway CloudFront distribution.',
  'Wrote the accessibility audit for the admin dashboard — 12 violations found, 8 critical.',
  'Set up the CI pipeline for the data pipeline repo: lint, test, typecheck, and container build on every push.',
  'Collaborated with design on the new onboarding flow — delivered a clickable prototype and component specs.',
  'Investigated the slow queries in the reporting dashboard; added composite indexes that cut report generation by 70%.',
  'Implemented the feature flag framework with a Redis-backed rollout service and per-user targeting.',
  'Migrated the legacy cron jobs to the new scheduled-tasks framework with proper observability.',
  'Documented the deployment runbook for the API gateway — includes rollback steps and common failure modes.',
  'Conducted a security review of the file upload endpoint — fixed path traversal and added content-type validation.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function subtractHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() - hours);
  return d;
}

function subtractMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - minutes);
  return d;
}

function generateStatusHistory(status: RunStatus): StatusHistoryEntry[] {
  const entries: StatusHistoryEntry[] = [];
  const sequence: RunStatus[] = ['queued', 'running'];

  if (status === 'completed') sequence.push('completed');
  else if (status === 'failed') sequence.push('failed');
  else if (status === 'blocked') sequence.push('blocked');
  else if (status === 'queued') return [{ status: 'queued', timestamp: subtractMinutes(now, Math.floor(Math.random() * 30) + 1) }];
  else if (status === 'running') return [
    { status: 'queued', timestamp: subtractMinutes(now, Math.floor(Math.random() * 60) + 5) },
    { status: 'running', timestamp: subtractMinutes(now, Math.floor(Math.random() * 20) + 1) },
  ];

  for (let i = 0; i < sequence.length; i++) {
    const offset = status === 'completed' ? (i === 0 ? 120 : i === 1 ? 60 : 10)
      : status === 'failed' ? (i === 0 ? 90 : i === 1 ? 45 : 5)
      : status === 'blocked' ? (i === 0 ? 75 : i === 1 ? 30 : 2)
      : 0;
    entries.push({ status: sequence[i], timestamp: subtractMinutes(now, offset) });
  }
  return entries;
}

function generateRuns(): Run[] {
  const runs: Run[] = [];

  // Queued: 3 runs
  for (let i = 0; i < 3; i++) {
    const start = subtractMinutes(now, Math.floor(Math.random() * 15) + 1);
    runs.push({
      id: `run-${String(1000 + i)}`,
      agentName: pick(agents),
      summary: pick(summaries),
      status: 'queued',
      statusHistory: generateStatusHistory('queued'),
      startedAt: start,
      completedAt: null,
      durationMs: null,
      tokenUsage: null,
    });
  }

  // Running: 3 runs
  for (let i = 0; i < 3; i++) {
    const start = subtractMinutes(now, Math.floor(Math.random() * 25) + 2);
    runs.push({
      id: `run-${String(2000 + i)}`,
      agentName: pick(agents),
      summary: pick(summaries),
      status: 'running',
      statusHistory: generateStatusHistory('running'),
      startedAt: start,
      completedAt: null,
      durationMs: null,
      tokenUsage: Math.floor(Math.random() * 50000) + 10000,
    });
  }

  // Completed: 5 runs
  for (let i = 0; i < 5; i++) {
    const start = subtractHours(now, Math.floor(Math.random() * 40) + 2);
    const durationMinutes = Math.floor(Math.random() * 90) + 5;
    const completed = new Date(start.getTime() + durationMinutes * 60000);
    runs.push({
      id: `run-${String(3000 + i)}`,
      agentName: pick(agents),
      summary: pick(summaries),
      status: 'completed',
      statusHistory: generateStatusHistory('completed'),
      startedAt: start,
      completedAt: completed,
      durationMs: durationMinutes * 60000,
      tokenUsage: Math.floor(Math.random() * 100000) + 20000,
    });
  }

  // Failed: 3 runs
  for (let i = 0; i < 3; i++) {
    const start = subtractHours(now, Math.floor(Math.random() * 30) + 1);
    const durationMinutes = Math.floor(Math.random() * 40) + 2;
    const failed = new Date(start.getTime() + durationMinutes * 60000);
    runs.push({
      id: `run-${String(4000 + i)}`,
      agentName: pick(agents),
      summary: pick(summaries),
      status: 'failed',
      statusHistory: generateStatusHistory('failed'),
      startedAt: start,
      completedAt: failed,
      durationMs: durationMinutes * 60000,
      tokenUsage: Math.floor(Math.random() * 30000),
    });
  }

  // Blocked: 3 runs
  for (let i = 0; i < 3; i++) {
    const start = subtractHours(now, Math.floor(Math.random() * 20) + 1);
    runs.push({
      id: `run-${String(5000 + i)}`,
      agentName: pick(agents),
      summary: pick(summaries),
      status: 'blocked',
      statusHistory: generateStatusHistory('blocked'),
      startedAt: start,
      completedAt: null,
      durationMs: null,
      tokenUsage: null,
    });
  }

  // Deduplicate summaries per run
  const used = new Set<string>();
  return runs.map(r => {
    let summary = r.summary;
    let attempts = 0;
    while (used.has(summary) && attempts < 50) {
      summary = pick(summaries);
      attempts++;
    }
    used.add(summary);
    return { ...r, summary };
  });
}

export function getRuns(): Run[] {
  return generateRuns();
}

export function getAgents(runs: Run[]): string[] {
  return [...new Set(runs.map(r => r.agentName))].sort();
}
