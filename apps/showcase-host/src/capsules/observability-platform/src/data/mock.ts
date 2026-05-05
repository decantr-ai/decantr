/* Mock Data — Observability Platform */

export type Health = 'healthy' | 'degraded' | 'critical' | 'unknown';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'firing' | 'acknowledged' | 'investigating' | 'resolved';

export interface MetricKpi {
  label: string;
  value: string;
  unit: string;
  change: number;
  sparkline: number[];
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'api' | 'db' | 'cache' | 'queue' | 'frontend' | 'gateway' | 'worker';
  health: Health;
  p50: number;
  p95: number;
  p99: number;
  rps: number;
  errorRate: number;
  dependsOn: string[];
  x: number;
  y: number;
}

export interface TraceSpan {
  id: string;
  service: string;
  operation: string;
  depth: number;
  start: number;
  duration: number;
  status: 'ok' | 'error' | 'slow';
  kind: 'server' | 'client' | 'db' | 'cache' | 'internal';
}

export interface Trace {
  id: string;
  rootService: string;
  operation: string;
  duration: number;
  spanCount: number;
  status: 'ok' | 'error';
  timestamp: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
  traceId?: string;
  attrs: Record<string, string>;
}

export interface Alert {
  id: string;
  name: string;
  severity: Severity;
  status: IncidentStatus;
  service: string;
  value: string;
  threshold: string;
  firedAt: string;
  runbook: string;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: string;
  window: string;
  severity: Severity;
  enabled: boolean;
  triggers24h: number;
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: Severity;
  startedAt: string;
  duration: string;
  affectedServices: string[];
  commander: string;
  updates: number;
}

export interface IncidentUpdate {
  id: string;
  timestamp: string;
  author: string;
  avatar: string;
  message: string;
  type: 'status' | 'mitigation' | 'detection' | 'comment' | 'resolved';
}

export interface Slo {
  id: string;
  name: string;
  service: string;
  target: number;
  current: number;
  budget: number;
  budgetBurn: number;
  window: string;
}

/* KPIs */

export const metricKpis: MetricKpi[] = [
  { label: 'Requests / sec', value: '48,219', unit: 'rps', change: 4.2, sparkline: [42, 45, 43, 46, 48, 47, 48, 49, 48, 50, 48, 48] },
  { label: 'P99 Latency', value: '184', unit: 'ms', change: -3.8, sparkline: [210, 205, 198, 202, 195, 188, 192, 186, 184, 182, 184, 184] },
  { label: 'Error Rate', value: '0.34', unit: '%', change: 12.1, sparkline: [0.22, 0.24, 0.21, 0.28, 0.31, 0.34, 0.36, 0.33, 0.34, 0.35, 0.34, 0.34] },
  { label: 'Active Alerts', value: '7', unit: '', change: 40.0, sparkline: [3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 7, 7] },
  { label: 'Apdex Score', value: '0.94', unit: '', change: -1.2, sparkline: [0.96, 0.96, 0.95, 0.95, 0.94, 0.94, 0.94, 0.94, 0.94, 0.94, 0.94, 0.94] },
  { label: 'MTTR', value: '12m 24s', unit: '', change: -18.3, sparkline: [18, 17, 16, 15, 14, 13, 13, 12, 12, 12, 12, 12] },
];

/* Services */

export const services: ServiceNode[] = [
  { id: 'svc-gateway', name: 'api-gateway', type: 'gateway', health: 'healthy', p50: 12, p95: 48, p99: 94, rps: 12400, errorRate: 0.08, dependsOn: ['svc-auth', 'svc-orders', 'svc-catalog'], x: 120, y: 80 },
  { id: 'svc-auth', name: 'auth-service', type: 'api', health: 'degraded', p50: 24, p95: 142, p99: 312, rps: 4200, errorRate: 1.24, dependsOn: ['svc-users-db', 'svc-redis'], x: 360, y: 60 },
  { id: 'svc-orders', name: 'orders-api', type: 'api', health: 'healthy', p50: 18, p95: 68, p99: 142, rps: 3800, errorRate: 0.22, dependsOn: ['svc-orders-db', 'svc-queue', 'svc-catalog'], x: 360, y: 180 },
  { id: 'svc-catalog', name: 'catalog-api', type: 'api', health: 'healthy', p50: 8, p95: 34, p99: 88, rps: 6200, errorRate: 0.12, dependsOn: ['svc-catalog-db', 'svc-redis'], x: 360, y: 300 },
  { id: 'svc-users-db', name: 'users-pg', type: 'db', health: 'healthy', p50: 3, p95: 12, p99: 28, rps: 4200, errorRate: 0.01, dependsOn: [], x: 620, y: 20 },
  { id: 'svc-redis', name: 'redis-cache', type: 'cache', health: 'healthy', p50: 1, p95: 3, p99: 6, rps: 18200, errorRate: 0.0, dependsOn: [], x: 620, y: 140 },
  { id: 'svc-orders-db', name: 'orders-pg', type: 'db', health: 'critical', p50: 42, p95: 280, p99: 612, rps: 3800, errorRate: 2.18, dependsOn: [], x: 620, y: 220 },
  { id: 'svc-queue', name: 'events-queue', type: 'queue', health: 'healthy', p50: 4, p95: 18, p99: 42, rps: 2400, errorRate: 0.04, dependsOn: [], x: 620, y: 320 },
  { id: 'svc-catalog-db', name: 'catalog-pg', type: 'db', health: 'healthy', p50: 5, p95: 22, p99: 48, rps: 6200, errorRate: 0.02, dependsOn: [], x: 620, y: 420 },
  { id: 'svc-worker', name: 'billing-worker', type: 'worker', health: 'healthy', p50: 124, p95: 480, p99: 1200, rps: 240, errorRate: 0.18, dependsOn: ['svc-queue', 'svc-orders-db'], x: 880, y: 260 },
];

/* Traces */

export const traces: Trace[] = [
  { id: 'tr-a1b2c3d4', rootService: 'api-gateway', operation: 'POST /api/orders', duration: 412, spanCount: 14, status: 'error', timestamp: '14:32:01.234' },
  { id: 'tr-e5f6g7h8', rootService: 'api-gateway', operation: 'GET /api/catalog/items', duration: 48, spanCount: 6, status: 'ok', timestamp: '14:32:00.891' },
  { id: 'tr-i9j0k1l2', rootService: 'api-gateway', operation: 'POST /api/auth/login', duration: 284, spanCount: 9, status: 'ok', timestamp: '14:31:59.445' },
  { id: 'tr-m3n4o5p6', rootService: 'api-gateway', operation: 'GET /api/orders/:id', duration: 612, spanCount: 11, status: 'error', timestamp: '14:31:58.102' },
  { id: 'tr-q7r8s9t0', rootService: 'billing-worker', operation: 'process_invoice', duration: 1284, spanCount: 18, status: 'ok', timestamp: '14:31:57.778' },
  { id: 'tr-u1v2w3x4', rootService: 'api-gateway', operation: 'POST /api/checkout', duration: 892, spanCount: 22, status: 'ok', timestamp: '14:31:56.334' },
  { id: 'tr-y5z6a7b8', rootService: 'api-gateway', operation: 'GET /api/users/me', duration: 38, spanCount: 5, status: 'ok', timestamp: '14:31:55.091' },
  { id: 'tr-c9d0e1f2', rootService: 'api-gateway', operation: 'DELETE /api/cart/:id', duration: 142, spanCount: 8, status: 'ok', timestamp: '14:31:54.667' },
];

export const traceSpans: TraceSpan[] = [
  { id: 'sp-1', service: 'api-gateway', operation: 'POST /api/orders', depth: 0, start: 0, duration: 412, status: 'error', kind: 'server' },
  { id: 'sp-2', service: 'api-gateway', operation: 'auth.verify', depth: 1, start: 2, duration: 28, status: 'ok', kind: 'client' },
  { id: 'sp-3', service: 'auth-service', operation: 'POST /verify', depth: 2, start: 4, duration: 24, status: 'ok', kind: 'server' },
  { id: 'sp-4', service: 'auth-service', operation: 'redis.get', depth: 3, start: 6, duration: 3, status: 'ok', kind: 'cache' },
  { id: 'sp-5', service: 'auth-service', operation: 'users-pg.select', depth: 3, start: 10, duration: 14, status: 'ok', kind: 'db' },
  { id: 'sp-6', service: 'api-gateway', operation: 'orders.create', depth: 1, start: 32, duration: 378, status: 'error', kind: 'client' },
  { id: 'sp-7', service: 'orders-api', operation: 'POST /orders', depth: 2, start: 34, duration: 374, status: 'error', kind: 'server' },
  { id: 'sp-8', service: 'orders-api', operation: 'catalog.fetch', depth: 3, start: 36, duration: 42, status: 'ok', kind: 'client' },
  { id: 'sp-9', service: 'catalog-api', operation: 'GET /items/batch', duration: 38, depth: 4, start: 38, status: 'ok', kind: 'server' },
  { id: 'sp-10', service: 'catalog-api', operation: 'catalog-pg.select', depth: 5, start: 40, duration: 32, status: 'ok', kind: 'db' },
  { id: 'sp-11', service: 'orders-api', operation: 'orders-pg.insert', depth: 3, start: 82, duration: 284, status: 'slow', kind: 'db' },
  { id: 'sp-12', service: 'orders-api', operation: 'queue.publish', depth: 3, start: 368, duration: 38, status: 'error', kind: 'client' },
  { id: 'sp-13', service: 'events-queue', operation: 'enqueue', depth: 4, start: 370, duration: 34, status: 'error', kind: 'server' },
  { id: 'sp-14', service: 'api-gateway', operation: 'response.serialize', depth: 1, start: 410, duration: 2, status: 'ok', kind: 'internal' },
];

/* Logs */

export const logs: LogEntry[] = [
  { id: 'log-1', timestamp: '14:32:01.234', level: 'error', message: 'Connection pool exhausted: 50/50 connections in use', service: 'orders-api', traceId: 'tr-m3n4o5p6', attrs: { 'db.name': 'orders-pg', 'pool.max': '50' } },
  { id: 'log-2', timestamp: '14:32:01.102', level: 'warn', message: 'Slow query detected: SELECT * FROM orders WHERE user_id=$1 (284ms)', service: 'orders-api', traceId: 'tr-m3n4o5p6', attrs: { 'db.statement': 'SELECT * FROM orders', 'db.duration_ms': '284' } },
  { id: 'log-3', timestamp: '14:32:00.891', level: 'info', message: 'Request completed 200 GET /api/catalog/items', service: 'catalog-api', traceId: 'tr-e5f6g7h8', attrs: { 'http.status_code': '200', 'http.duration_ms': '48' } },
  { id: 'log-4', timestamp: '14:32:00.445', level: 'error', message: 'Failed to publish to queue: timeout after 30000ms', service: 'orders-api', traceId: 'tr-a1b2c3d4', attrs: { 'queue.name': 'events', 'timeout_ms': '30000' } },
  { id: 'log-5', timestamp: '14:31:59.778', level: 'warn', message: 'Rate limit approaching: 847/1000 in 60s window', service: 'auth-service', attrs: { 'rate_limit.current': '847', 'rate_limit.max': '1000' } },
  { id: 'log-6', timestamp: '14:31:59.445', level: 'info', message: 'User authenticated successfully', service: 'auth-service', traceId: 'tr-i9j0k1l2', attrs: { 'user.id': 'u_7f3a', 'auth.method': 'password' } },
  { id: 'log-7', timestamp: '14:31:58.891', level: 'debug', message: 'Cache HIT for catalog:items:page:1', service: 'catalog-api', attrs: { 'cache.key': 'catalog:items:page:1', 'cache.ttl_s': '300' } },
  { id: 'log-8', timestamp: '14:31:58.334', level: 'error', message: 'Circuit breaker opened for orders-pg after 5 consecutive failures', service: 'orders-api', attrs: { 'breaker.name': 'orders-pg', 'failures': '5' } },
  { id: 'log-9', timestamp: '14:31:57.891', level: 'info', message: 'Deployment completed: catalog-api@v2.14.0 to production', service: 'catalog-api', attrs: { 'deploy.version': 'v2.14.0', 'deploy.env': 'production' } },
  { id: 'log-10', timestamp: '14:31:57.445', level: 'warn', message: 'Memory usage high: 84% of 2GB limit', service: 'billing-worker', attrs: { 'mem.used_mb': '1720', 'mem.limit_mb': '2048' } },
  { id: 'log-11', timestamp: '14:31:56.891', level: 'info', message: 'Processed invoice batch: 128 invoices in 1.28s', service: 'billing-worker', traceId: 'tr-q7r8s9t0', attrs: { 'batch.size': '128', 'duration_ms': '1284' } },
  { id: 'log-12', timestamp: '14:31:56.334', level: 'error', message: 'Database deadlock detected on orders table', service: 'orders-api', traceId: 'tr-a1b2c3d4', attrs: { 'db.table': 'orders', 'tx.id': 'tx_9b1e' } },
  { id: 'log-13', timestamp: '14:31:55.891', level: 'info', message: 'Redis reconnected after 340ms', service: 'auth-service', attrs: { 'redis.host': 'redis-primary', 'downtime_ms': '340' } },
  { id: 'log-14', timestamp: '14:31:55.445', level: 'debug', message: 'Trace sampled: 14 spans, 412ms duration', service: 'api-gateway', traceId: 'tr-a1b2c3d4', attrs: { 'span.count': '14', 'trace.duration_ms': '412' } },
];

/* Alerts */

export const alerts: Alert[] = [
  { id: 'alr-1', name: 'High P99 Latency — orders-api', severity: 'critical', status: 'firing', service: 'orders-api', value: '612ms', threshold: '> 500ms (5m)', firedAt: '3m ago', runbook: 'runbooks/high-latency' },
  { id: 'alr-2', name: 'Error Rate Threshold — auth-service', severity: 'high', status: 'acknowledged', service: 'auth-service', value: '1.24%', threshold: '> 1.0% (5m)', firedAt: '12m ago', runbook: 'runbooks/error-rate' },
  { id: 'alr-3', name: 'DB Connection Pool Saturation', severity: 'critical', status: 'investigating', service: 'orders-pg', value: '50/50', threshold: '> 45/50 (2m)', firedAt: '4m ago', runbook: 'runbooks/db-connections' },
  { id: 'alr-4', name: 'Disk Space — billing-worker', severity: 'medium', status: 'firing', service: 'billing-worker', value: '84%', threshold: '> 80% (10m)', firedAt: '28m ago', runbook: 'runbooks/disk-space' },
  { id: 'alr-5', name: 'Queue Depth — events-queue', severity: 'high', status: 'firing', service: 'events-queue', value: '12,480', threshold: '> 10,000 (5m)', firedAt: '8m ago', runbook: 'runbooks/queue-backlog' },
  { id: 'alr-6', name: 'SSL Certificate Expiring', severity: 'low', status: 'acknowledged', service: 'api-gateway', value: '14 days', threshold: '< 30 days', firedAt: '2h ago', runbook: 'runbooks/cert-renewal' },
  { id: 'alr-7', name: 'Memory Usage — api-gateway', severity: 'medium', status: 'firing', service: 'api-gateway', value: '78%', threshold: '> 75% (5m)', firedAt: '15m ago', runbook: 'runbooks/memory-high' },
];

export const alertRules: AlertRule[] = [
  { id: 'rule-1', name: 'P99 Latency High', metric: 'http.request.duration.p99', condition: '>', threshold: '500ms', window: '5m', severity: 'critical', enabled: true, triggers24h: 3 },
  { id: 'rule-2', name: 'Error Rate Elevated', metric: 'http.requests.errors.rate', condition: '>', threshold: '1.0%', window: '5m', severity: 'high', enabled: true, triggers24h: 7 },
  { id: 'rule-3', name: 'DB Pool Saturation', metric: 'db.connections.active', condition: '>', threshold: '45', window: '2m', severity: 'critical', enabled: true, triggers24h: 2 },
  { id: 'rule-4', name: 'Disk Space Low', metric: 'system.disk.used.percent', condition: '>', threshold: '80%', window: '10m', severity: 'medium', enabled: true, triggers24h: 1 },
  { id: 'rule-5', name: 'Queue Backlog', metric: 'queue.depth', condition: '>', threshold: '10000', window: '5m', severity: 'high', enabled: true, triggers24h: 4 },
  { id: 'rule-6', name: 'Certificate Expiry', metric: 'tls.cert.days_remaining', condition: '<', threshold: '30', window: '1h', severity: 'low', enabled: true, triggers24h: 1 },
  { id: 'rule-7', name: 'Memory High', metric: 'system.memory.used.percent', condition: '>', threshold: '75%', window: '5m', severity: 'medium', enabled: true, triggers24h: 8 },
  { id: 'rule-8', name: 'CPU Throttling', metric: 'container.cpu.throttled', condition: '>', threshold: '10%', window: '5m', severity: 'medium', enabled: false, triggers24h: 0 },
];

/* Incidents */

export const incidents: Incident[] = [
  { id: 'inc-482', title: 'Orders API — Database Connection Pool Exhaustion', status: 'investigating', severity: 'critical', startedAt: '14:28:00', duration: '4m 12s', affectedServices: ['orders-api', 'orders-pg'], commander: 'Nadia Okafor', updates: 8 },
  { id: 'inc-481', title: 'Elevated Auth Service Error Rate', status: 'acknowledged', severity: 'high', startedAt: '14:20:00', duration: '12m 04s', affectedServices: ['auth-service'], commander: 'Marcus Johnson', updates: 4 },
  { id: 'inc-480', title: 'Events Queue Backlog Building', status: 'firing', severity: 'high', startedAt: '14:24:00', duration: '8m 18s', affectedServices: ['events-queue', 'billing-worker'], commander: 'Unassigned', updates: 2 },
  { id: 'inc-479', title: 'API Gateway Memory Pressure', status: 'firing', severity: 'medium', startedAt: '14:17:00', duration: '15m 22s', affectedServices: ['api-gateway'], commander: 'Lin Wei', updates: 3 },
  { id: 'inc-478', title: 'Redis Cache Timeout Spike', status: 'resolved', severity: 'medium', startedAt: '12:42:00', duration: '18m 30s', affectedServices: ['redis-cache', 'auth-service'], commander: 'Aisha Patel', updates: 12 },
  { id: 'inc-477', title: 'Catalog Search Latency Regression', status: 'resolved', severity: 'low', startedAt: '09:18:00', duration: '42m 11s', affectedServices: ['catalog-api'], commander: 'James Wilson', updates: 9 },
];

export const incidentUpdates: IncidentUpdate[] = [
  { id: 'upd-1', timestamp: '14:32:14', author: 'Nadia Okafor', avatar: 'NO', message: 'Scaling orders-pg connection pool from 50 to 100. Pushing hotfix now.', type: 'mitigation' },
  { id: 'upd-2', timestamp: '14:31:02', author: 'Marcus Johnson', avatar: 'MJ', message: 'Root cause identified: runaway query from new /api/orders/history endpoint lacking index.', type: 'detection' },
  { id: 'upd-3', timestamp: '14:30:18', author: 'System', avatar: 'SY', message: 'Auto-escalated to severity CRITICAL. Error rate crossed 2%.', type: 'status' },
  { id: 'upd-4', timestamp: '14:29:44', author: 'Nadia Okafor', avatar: 'NO', message: 'I\u2019m taking incident command. Paging orders-api owner.', type: 'comment' },
  { id: 'upd-5', timestamp: '14:28:51', author: 'System', avatar: 'SY', message: 'DB connection pool alerts firing on orders-pg. 50/50 connections saturated.', type: 'detection' },
  { id: 'upd-6', timestamp: '14:28:00', author: 'System', avatar: 'SY', message: 'Incident opened: Orders API error rate at 2.18%, P99 latency at 612ms.', type: 'status' },
];

/* SLOs */

export const slos: Slo[] = [
  { id: 'slo-1', name: 'API Availability', service: 'api-gateway', target: 99.9, current: 99.94, budget: 72, budgetBurn: 2.4, window: '30d' },
  { id: 'slo-2', name: 'Orders P95 Latency < 200ms', service: 'orders-api', target: 99.0, current: 98.42, budget: 14, budgetBurn: 8.2, window: '30d' },
  { id: 'slo-3', name: 'Auth Success Rate', service: 'auth-service', target: 99.5, current: 98.76, budget: -48, budgetBurn: 14.8, window: '30d' },
  { id: 'slo-4', name: 'Catalog Read Availability', service: 'catalog-api', target: 99.9, current: 99.98, budget: 88, budgetBurn: 0.8, window: '30d' },
  { id: 'slo-5', name: 'Queue Processing Time', service: 'billing-worker', target: 99.0, current: 99.12, budget: 64, budgetBurn: 3.2, window: '30d' },
];

/* Activity feed for incidents overview */

export const incidentActivity = [
  { id: 'act-1', timestamp: '14:32:14', actor: 'Nadia Okafor', avatar: 'NO', action: 'deployed hotfix', target: 'orders-api@v4.12.1', type: 'mitigation' as const },
  { id: 'act-2', timestamp: '14:30:02', actor: 'System', avatar: 'SY', action: 'escalated', target: 'INC-482 to CRITICAL', type: 'status' as const },
  { id: 'act-3', timestamp: '14:29:18', actor: 'Nadia Okafor', avatar: 'NO', action: 'assumed command', target: 'INC-482', type: 'comment' as const },
  { id: 'act-4', timestamp: '14:28:51', actor: 'System', avatar: 'SY', action: 'triggered alert', target: 'DB Pool Saturation', type: 'detection' as const },
  { id: 'act-5', timestamp: '14:28:00', actor: 'System', avatar: 'SY', action: 'opened incident', target: 'INC-482', type: 'status' as const },
  { id: 'act-6', timestamp: '14:24:12', actor: 'System', avatar: 'SY', action: 'opened incident', target: 'INC-480', type: 'status' as const },
  { id: 'act-7', timestamp: '14:20:04', actor: 'Marcus Johnson', avatar: 'MJ', action: 'acknowledged', target: 'INC-481', type: 'status' as const },
  { id: 'act-8', timestamp: '13:00:22', actor: 'Aisha Patel', avatar: 'AP', action: 'resolved', target: 'INC-478', type: 'resolved' as const },
];

/* Chart series for overview */

export interface ChartSeries {
  title: string;
  unit: string;
  data: number[];
  color: string;
}

export const overviewCharts: ChartSeries[] = [
  { title: 'Request Rate', unit: 'rps', data: [42000, 43200, 44800, 45100, 46300, 47200, 48100, 48900, 48500, 49200, 48800, 48219], color: 'var(--d-primary)' },
  { title: 'Error Rate', unit: '%', data: [0.22, 0.24, 0.21, 0.28, 0.31, 0.34, 0.36, 0.33, 0.34, 0.35, 0.34, 0.34], color: 'var(--d-error)' },
  { title: 'P50 Latency', unit: 'ms', data: [14, 15, 14, 16, 18, 17, 16, 15, 14, 15, 14, 14], color: 'var(--d-success)' },
  { title: 'P99 Latency', unit: 'ms', data: [210, 205, 198, 202, 195, 188, 192, 186, 184, 182, 184, 184], color: 'var(--d-warning)' },
];

/* Marketing */

export const marketingFeatures = [
  { icon: 'line-chart', title: 'Metrics Everywhere', description: 'Scrape, store, and query billions of data points. Sub-second queries against 30-day windows.' },
  { icon: 'search', title: 'Structured Log Search', description: 'Full-text search with structured attributes. Ingest 100M+ events/day with automatic correlation.' },
  { icon: 'git-branch', title: 'Distributed Tracing', description: 'OTEL-native tracing with automatic service map generation. Follow requests across 100+ services.' },
  { icon: 'bell', title: 'Smart Alerting', description: 'ML-powered anomaly detection. Multi-channel delivery with on-call rotations built in.' },
  { icon: 'activity', title: 'SLO Tracking', description: 'Define service level objectives. Track error budgets and burn rates in real time.' },
  { icon: 'zap', title: 'Real-time Streams', description: 'Live tail for logs, metrics, and traces. See events the moment they happen.' },
];

export const marketingTiers = [
  { name: 'Starter', price: 0, period: '/mo', recommended: false, features: ['3 services', '15-day retention', '1GB logs/day', 'Community support'], cta: 'Start Free' },
  { name: 'Team', price: 29, period: '/mo per host', recommended: true, features: ['Unlimited services', '30-day retention', '100GB logs/day', 'Distributed tracing', 'On-call rotations', 'Priority support'], cta: 'Start Trial' },
  { name: 'Enterprise', price: 99, period: '/mo per host', recommended: false, features: ['Everything in Team', '13-month retention', 'Unlimited logs', 'Custom dashboards', 'SSO / SAML', 'Dedicated CSM', 'SOC 2 / HIPAA'], cta: 'Contact Sales' },
];

export const marketingTestimonials = [
  { quote: 'We cut our MTTR by 65% in the first quarter. Service map changed how our SREs think about incidents.', author: 'Priya Rao', role: 'VP Engineering, Finch' },
  { quote: 'The trace waterfalls found a hidden N+1 query in our checkout path that was costing us 200ms per order.', author: 'Jonas Bergström', role: 'Staff Engineer, Nomad' },
  { quote: 'Finally, an observability platform pricing we can explain to finance. No data caps, no overage surprises.', author: 'Elena Morales', role: 'CTO, Latticework' },
];

export const marketingStats = [
  { label: 'Data Points / sec', value: '2.4B' },
  { label: 'Services Monitored', value: '180K+' },
  { label: 'MTTR Reduction', value: '65%' },
  { label: 'Uptime SLA', value: '99.99%' },
];
