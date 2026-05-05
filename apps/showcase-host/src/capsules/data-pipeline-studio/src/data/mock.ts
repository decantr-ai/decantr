/* Mock data for Data Pipeline Studio */

export type NodeType = 'source' | 'transform' | 'sink' | 'filter' | 'join';
export type PipelineStatus = 'active' | 'paused' | 'failed' | 'draft';
export type JobStatus = 'success' | 'running' | 'failed' | 'queued';
export type SourceStatus = 'connected' | 'disconnected' | 'error' | 'syncing';
export type SourceKind =
  | 'postgres'
  | 'mysql'
  | 'kafka'
  | 's3'
  | 'bigquery'
  | 'snowflake'
  | 'http'
  | 'mongodb';

export interface PipelineNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config?: string;
}

export interface PipelineEdge {
  id: string;
  from: string;
  to: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus;
  schedule: string;
  lastRun: string;
  nextRun: string;
  owner: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  runsToday: number;
  successRate: number;
}

export interface DataSource {
  id: string;
  name: string;
  kind: SourceKind;
  host: string;
  status: SourceStatus;
  lastSync: string;
  tables: number;
  rowsIngested: number;
  schema: Record<string, string>;
}

export interface Transformation {
  id: string;
  name: string;
  description: string;
  language: 'sql' | 'python';
  code: string;
  source: string;
  target: string;
  lastModified: string;
  owner: string;
  runsToday: number;
}

export interface JobRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  status: JobStatus;
  startedAt: string;
  finishedAt: string | null;
  durationSec: number;
  rowsProcessed: number;
  trigger: 'scheduled' | 'manual' | 'webhook';
  steps: JobStep[];
}

export interface JobStep {
  id: string;
  name: string;
  status: JobStatus;
  durationMs: number;
  rowsIn: number;
  rowsOut: number;
}

export const PIPELINES: Pipeline[] = [
  {
    id: 'pl_events_clickstream',
    name: 'events_clickstream_hourly',
    description: 'Hourly ingestion of clickstream events from Kafka into warehouse',
    status: 'active',
    schedule: '0 * * * *',
    lastRun: '2026-04-05T14:00:00Z',
    nextRun: '2026-04-05T15:00:00Z',
    owner: 'data-eng@acme.io',
    runsToday: 14,
    successRate: 98.2,
    nodes: [
      { id: 'n1', type: 'source', label: 'kafka:events.clicks', x: 80, y: 140, config: 'topic=events.clicks\ngroup=etl-hourly' },
      { id: 'n2', type: 'filter', label: 'filter bots', x: 280, y: 140, config: 'WHERE user_agent NOT LIKE \'%bot%\'' },
      { id: 'n3', type: 'transform', label: 'enrich_geo', x: 480, y: 80, config: 'JOIN geo_ip USING (ip)' },
      { id: 'n4', type: 'transform', label: 'parse_ua', x: 480, y: 200, config: 'SELECT parse_ua(ua) AS dev' },
      { id: 'n5', type: 'join', label: 'merge', x: 680, y: 140 },
      { id: 'n6', type: 'sink', label: 'snowflake.events', x: 880, y: 140, config: 'warehouse=etl_wh\ntable=fact_clicks' },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n2', to: 'n4' },
      { id: 'e4', from: 'n3', to: 'n5' },
      { id: 'e5', from: 'n4', to: 'n5' },
      { id: 'e6', from: 'n5', to: 'n6' },
    ],
  },
  {
    id: 'pl_users_daily',
    name: 'users_daily_sync',
    description: 'Daily sync of user dimension table from production Postgres',
    status: 'active',
    schedule: '0 2 * * *',
    lastRun: '2026-04-05T02:00:00Z',
    nextRun: '2026-04-06T02:00:00Z',
    owner: 'data-eng@acme.io',
    runsToday: 1,
    successRate: 100,
    nodes: [
      { id: 'n1', type: 'source', label: 'postgres.users', x: 80, y: 120, config: 'db=prod-pg\ntable=users' },
      { id: 'n2', type: 'transform', label: 'scd2_merge', x: 320, y: 120 },
      { id: 'n3', type: 'sink', label: 'bigquery.dim_users', x: 560, y: 120 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
    ],
  },
  {
    id: 'pl_orders_realtime',
    name: 'orders_realtime_cdc',
    description: 'CDC stream from MySQL orders to Kafka and warehouse',
    status: 'active',
    schedule: '* * * * *',
    lastRun: '2026-04-05T14:23:12Z',
    nextRun: '2026-04-05T14:24:12Z',
    owner: 'platform@acme.io',
    runsToday: 870,
    successRate: 99.7,
    nodes: [
      { id: 'n1', type: 'source', label: 'mysql.orders CDC', x: 80, y: 140 },
      { id: 'n2', type: 'transform', label: 'decode_binlog', x: 280, y: 140 },
      { id: 'n3', type: 'sink', label: 'kafka.orders.cdc', x: 480, y: 80 },
      { id: 'n4', type: 'sink', label: 'snowflake.orders', x: 480, y: 200 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n2', to: 'n4' },
    ],
  },
  {
    id: 'pl_ml_features',
    name: 'ml_feature_store_refresh',
    description: 'Nightly rebuild of ML feature store aggregations',
    status: 'paused',
    schedule: '0 4 * * *',
    lastRun: '2026-04-04T04:00:00Z',
    nextRun: '—',
    owner: 'ml-team@acme.io',
    runsToday: 0,
    successRate: 94.1,
    nodes: [
      { id: 'n1', type: 'source', label: 's3://features/raw/', x: 80, y: 140 },
      { id: 'n2', type: 'transform', label: 'window_agg', x: 320, y: 140 },
      { id: 'n3', type: 'sink', label: 'feature_store', x: 560, y: 140 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
    ],
  },
  {
    id: 'pl_revenue_attrib',
    name: 'revenue_attribution_v3',
    description: 'Multi-touch attribution model with 30-day lookback',
    status: 'failed',
    schedule: '0 6 * * *',
    lastRun: '2026-04-05T06:00:00Z',
    nextRun: '2026-04-06T06:00:00Z',
    owner: 'analytics@acme.io',
    runsToday: 1,
    successRate: 87.4,
    nodes: [
      { id: 'n1', type: 'source', label: 'bigquery.sessions', x: 80, y: 100 },
      { id: 'n2', type: 'source', label: 'bigquery.conversions', x: 80, y: 200 },
      { id: 'n3', type: 'join', label: 'attribute', x: 320, y: 150 },
      { id: 'n4', type: 'sink', label: 'attributions', x: 560, y: 150 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n3' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4' },
    ],
  },
  {
    id: 'pl_gdpr_deletion',
    name: 'gdpr_deletion_requests',
    description: 'Process GDPR deletion requests across all warehouse tables',
    status: 'draft',
    schedule: '0 0 * * 0',
    lastRun: '—',
    nextRun: '—',
    owner: 'compliance@acme.io',
    runsToday: 0,
    successRate: 0,
    nodes: [
      { id: 'n1', type: 'source', label: 'postgres.gdpr_queue', x: 80, y: 140 },
      { id: 'n2', type: 'transform', label: 'resolve_pii', x: 320, y: 140 },
      { id: 'n3', type: 'sink', label: 'multi:warehouse', x: 560, y: 140 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
    ],
  },
];

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'src_prod_pg',
    name: 'prod-postgres-main',
    kind: 'postgres',
    host: 'prod-pg.internal:5432/app',
    status: 'connected',
    lastSync: '2026-04-05T14:22:01Z',
    tables: 47,
    rowsIngested: 284_912_388,
    schema: { users: 'bigint id, text email, timestamptz created_at', orders: 'bigint id, bigint user_id, numeric amount' },
  },
  {
    id: 'src_analytics_bq',
    name: 'bigquery-analytics',
    kind: 'bigquery',
    host: 'acme-analytics.us-central1',
    status: 'connected',
    lastSync: '2026-04-05T14:00:00Z',
    tables: 128,
    rowsIngested: 1_847_293_104,
    schema: { sessions: 'STRING id, STRING user_id, TIMESTAMP ts', events: 'STRING id, STRING event_name, JSON props' },
  },
  {
    id: 'src_kafka_events',
    name: 'kafka-events-cluster',
    kind: 'kafka',
    host: 'kafka-broker-1:9092',
    status: 'connected',
    lastSync: '2026-04-05T14:23:48Z',
    tables: 23,
    rowsIngested: 8_234_918_472,
    schema: { 'events.clicks': 'avro: ClickEvent v3', 'events.views': 'avro: ViewEvent v2' },
  },
  {
    id: 'src_s3_raw',
    name: 's3-raw-data-lake',
    kind: 's3',
    host: 's3://acme-raw-data/',
    status: 'syncing',
    lastSync: '2026-04-05T14:15:00Z',
    tables: 14,
    rowsIngested: 423_881_092,
    schema: { 'logs/': 'parquet partitioned by dt', 'features/': 'parquet partitioned by model_version' },
  },
  {
    id: 'src_snowflake_dw',
    name: 'snowflake-warehouse',
    kind: 'snowflake',
    host: 'acme.snowflakecomputing.com',
    status: 'connected',
    lastSync: '2026-04-05T13:45:00Z',
    tables: 212,
    rowsIngested: 12_847_293_104,
    schema: { fact_orders: 'NUMBER id, DATE order_date', dim_users: 'NUMBER id, VARCHAR email' },
  },
  {
    id: 'src_mysql_billing',
    name: 'mysql-billing-prod',
    kind: 'mysql',
    host: 'mysql-billing.internal:3306',
    status: 'error',
    lastSync: '2026-04-05T09:12:00Z',
    tables: 19,
    rowsIngested: 74_912_388,
    schema: { invoices: 'BIGINT id, DECIMAL amount', subscriptions: 'BIGINT id, VARCHAR status' },
  },
  {
    id: 'src_mongo_product',
    name: 'mongodb-product-catalog',
    kind: 'mongodb',
    host: 'mongo-cluster-0.internal:27017',
    status: 'connected',
    lastSync: '2026-04-05T14:10:00Z',
    tables: 8,
    rowsIngested: 2_847_104,
    schema: { products: '_id: ObjectId, sku: String, price: Number', reviews: '_id: ObjectId, rating: Number' },
  },
  {
    id: 'src_stripe_api',
    name: 'stripe-api',
    kind: 'http',
    host: 'api.stripe.com/v1',
    status: 'disconnected',
    lastSync: '2026-04-03T22:00:00Z',
    tables: 6,
    rowsIngested: 1_423_091,
    schema: { charges: 'JSON', customers: 'JSON', subscriptions: 'JSON' },
  },
];

export const TRANSFORMATIONS: Transformation[] = [
  {
    id: 'tx_daily_revenue',
    name: 'daily_revenue_rollup',
    description: 'Aggregate order revenue by day, product, and region',
    language: 'sql',
    source: 'snowflake.fact_orders',
    target: 'snowflake.mart_daily_revenue',
    lastModified: '2026-04-03T11:24:00Z',
    owner: 'analytics@acme.io',
    runsToday: 1,
    code: `-- daily_revenue_rollup
-- Aggregates order revenue by day/product/region

WITH orders_enriched AS (
  SELECT
    o.order_id,
    o.order_date::DATE AS dt,
    o.product_id,
    u.region,
    o.amount_usd
  FROM fact_orders o
  JOIN dim_users u ON o.user_id = u.user_id
  WHERE o.order_date >= DATEADD(day, -90, CURRENT_DATE())
    AND o.status = 'completed'
)
SELECT
  dt,
  product_id,
  region,
  COUNT(*)             AS n_orders,
  SUM(amount_usd)      AS gross_revenue,
  AVG(amount_usd)      AS avg_order_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_usd) AS median_aov
FROM orders_enriched
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 5 DESC;`,
  },
  {
    id: 'tx_user_cohorts',
    name: 'user_cohort_retention',
    description: 'Weekly cohort retention analysis',
    language: 'sql',
    source: 'bigquery.sessions',
    target: 'bigquery.mart_cohorts',
    lastModified: '2026-04-02T16:04:00Z',
    owner: 'analytics@acme.io',
    runsToday: 4,
    code: `-- user_cohort_retention
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC(MIN(session_start), WEEK) AS cohort_week
  FROM sessions
  GROUP BY user_id
),
activity AS (
  SELECT
    s.user_id,
    c.cohort_week,
    DATE_DIFF(DATE_TRUNC(s.session_start, WEEK), c.cohort_week, WEEK) AS week_n
  FROM sessions s
  JOIN cohorts c USING (user_id)
)
SELECT
  cohort_week,
  week_n,
  COUNT(DISTINCT user_id) AS retained
FROM activity
GROUP BY 1, 2
ORDER BY 1, 2;`,
  },
  {
    id: 'tx_feature_engineering',
    name: 'churn_features_v2',
    description: 'Churn model feature engineering pipeline',
    language: 'python',
    source: 's3://features/raw/',
    target: 's3://features/churn_v2/',
    lastModified: '2026-04-04T09:33:00Z',
    owner: 'ml-team@acme.io',
    runsToday: 1,
    code: `# churn_features_v2.py
import pandas as pd
import numpy as np

def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(['user_id', 'ts'])

    # rolling 7d session count
    df['sessions_7d'] = (
        df.groupby('user_id')['session_id']
          .rolling('7D', on='ts').count()
          .reset_index(level=0, drop=True)
    )

    # days since last purchase
    df['last_purchase_delta'] = (
        df.groupby('user_id')['last_purchase_ts']
          .transform(lambda s: (df['ts'] - s).dt.days)
    )

    # LTV decile
    df['ltv_decile'] = pd.qcut(df['ltv'], 10, labels=False, duplicates='drop')

    return df[['user_id', 'ts', 'sessions_7d', 'last_purchase_delta', 'ltv_decile']]`,
  },
  {
    id: 'tx_attribution_model',
    name: 'attribution_weights',
    description: 'Time-decay attribution weighting',
    language: 'sql',
    source: 'bigquery.touchpoints',
    target: 'bigquery.attributions',
    lastModified: '2026-04-01T14:18:00Z',
    owner: 'analytics@acme.io',
    runsToday: 1,
    code: `-- attribution_weights
-- Time-decay model with 7-day half-life
SELECT
  conversion_id,
  touchpoint_id,
  channel,
  EXP(-LN(2) * DATE_DIFF(conversion_ts, touchpoint_ts, DAY) / 7.0) AS raw_weight,
  raw_weight / SUM(raw_weight) OVER (PARTITION BY conversion_id) AS norm_weight
FROM touchpoints_joined
WHERE DATE_DIFF(conversion_ts, touchpoint_ts, DAY) BETWEEN 0 AND 30;`,
  },
  {
    id: 'tx_dedupe_events',
    name: 'dedupe_clickstream',
    description: 'Deduplicate clickstream on fuzzy event_id window',
    language: 'sql',
    source: 'kafka.events.clicks',
    target: 'snowflake.stg_clicks',
    lastModified: '2026-04-05T08:01:00Z',
    owner: 'data-eng@acme.io',
    runsToday: 24,
    code: `-- dedupe_clickstream
SELECT *
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY event_id
      ORDER BY ingested_at DESC
    ) AS rn
  FROM raw_clicks
)
WHERE rn = 1;`,
  },
];

export const JOB_RUNS: JobRun[] = [
  {
    id: 'run_8f3a',
    pipelineId: 'pl_events_clickstream',
    pipelineName: 'events_clickstream_hourly',
    status: 'success',
    startedAt: '2026-04-05T14:00:00Z',
    finishedAt: '2026-04-05T14:01:42Z',
    durationSec: 102,
    rowsProcessed: 8_432_187,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:kafka', status: 'success', durationMs: 12400, rowsIn: 0, rowsOut: 8432187 },
      { id: 's2', name: 'filter:bots', status: 'success', durationMs: 8200, rowsIn: 8432187, rowsOut: 8201094 },
      { id: 's3', name: 'enrich:geo', status: 'success', durationMs: 34100, rowsIn: 8201094, rowsOut: 8201094 },
      { id: 's4', name: 'parse:ua', status: 'success', durationMs: 28400, rowsIn: 8201094, rowsOut: 8201094 },
      { id: 's5', name: 'merge:join', status: 'success', durationMs: 11200, rowsIn: 16402188, rowsOut: 8201094 },
      { id: 's6', name: 'load:snowflake', status: 'success', durationMs: 7700, rowsIn: 8201094, rowsOut: 8201094 },
    ],
  },
  {
    id: 'run_9a2e',
    pipelineId: 'pl_orders_realtime',
    pipelineName: 'orders_realtime_cdc',
    status: 'running',
    startedAt: '2026-04-05T14:23:12Z',
    finishedAt: null,
    durationSec: 38,
    rowsProcessed: 12_841,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:mysql.cdc', status: 'success', durationMs: 890, rowsIn: 0, rowsOut: 12841 },
      { id: 's2', name: 'decode:binlog', status: 'success', durationMs: 2100, rowsIn: 12841, rowsOut: 12841 },
      { id: 's3', name: 'load:kafka', status: 'running', durationMs: 0, rowsIn: 12841, rowsOut: 0 },
      { id: 's4', name: 'load:snowflake', status: 'queued', durationMs: 0, rowsIn: 0, rowsOut: 0 },
    ],
  },
  {
    id: 'run_7c14',
    pipelineId: 'pl_revenue_attrib',
    pipelineName: 'revenue_attribution_v3',
    status: 'failed',
    startedAt: '2026-04-05T06:00:00Z',
    finishedAt: '2026-04-05T06:12:33Z',
    durationSec: 753,
    rowsProcessed: 0,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:sessions', status: 'success', durationMs: 142000, rowsIn: 0, rowsOut: 48291047 },
      { id: 's2', name: 'extract:conversions', status: 'success', durationMs: 61000, rowsIn: 0, rowsOut: 142087 },
      { id: 's3', name: 'attribute:join', status: 'failed', durationMs: 550000, rowsIn: 48433134, rowsOut: 0 },
    ],
  },
  {
    id: 'run_6b90',
    pipelineId: 'pl_users_daily',
    pipelineName: 'users_daily_sync',
    status: 'success',
    startedAt: '2026-04-05T02:00:00Z',
    finishedAt: '2026-04-05T02:03:21Z',
    durationSec: 201,
    rowsProcessed: 2_847_194,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:postgres', status: 'success', durationMs: 82000, rowsIn: 0, rowsOut: 2847194 },
      { id: 's2', name: 'scd2:merge', status: 'success', durationMs: 94000, rowsIn: 2847194, rowsOut: 2847194 },
      { id: 's3', name: 'load:bigquery', status: 'success', durationMs: 25000, rowsIn: 2847194, rowsOut: 2847194 },
    ],
  },
  {
    id: 'run_5a83',
    pipelineId: 'pl_events_clickstream',
    pipelineName: 'events_clickstream_hourly',
    status: 'success',
    startedAt: '2026-04-05T13:00:00Z',
    finishedAt: '2026-04-05T13:01:38Z',
    durationSec: 98,
    rowsProcessed: 8_194_032,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:kafka', status: 'success', durationMs: 12100, rowsIn: 0, rowsOut: 8194032 },
      { id: 's2', name: 'filter:bots', status: 'success', durationMs: 7900, rowsIn: 8194032, rowsOut: 7982014 },
      { id: 's3', name: 'enrich:geo', status: 'success', durationMs: 33800, rowsIn: 7982014, rowsOut: 7982014 },
      { id: 's4', name: 'parse:ua', status: 'success', durationMs: 28100, rowsIn: 7982014, rowsOut: 7982014 },
      { id: 's5', name: 'merge:join', status: 'success', durationMs: 10900, rowsIn: 15964028, rowsOut: 7982014 },
      { id: 's6', name: 'load:snowflake', status: 'success', durationMs: 5200, rowsIn: 7982014, rowsOut: 7982014 },
    ],
  },
  {
    id: 'run_4f22',
    pipelineId: 'pl_ml_features',
    pipelineName: 'ml_feature_store_refresh',
    status: 'success',
    startedAt: '2026-04-04T04:00:00Z',
    finishedAt: '2026-04-04T04:42:18Z',
    durationSec: 2538,
    rowsProcessed: 124_912_388,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:s3', status: 'success', durationMs: 840000, rowsIn: 0, rowsOut: 124912388 },
      { id: 's2', name: 'window:agg', status: 'success', durationMs: 1402000, rowsIn: 124912388, rowsOut: 8472194 },
      { id: 's3', name: 'load:feature_store', status: 'success', durationMs: 296000, rowsIn: 8472194, rowsOut: 8472194 },
    ],
  },
  {
    id: 'run_3e51',
    pipelineId: 'pl_orders_realtime',
    pipelineName: 'orders_realtime_cdc',
    status: 'success',
    startedAt: '2026-04-05T14:22:12Z',
    finishedAt: '2026-04-05T14:22:44Z',
    durationSec: 32,
    rowsProcessed: 11_203,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:mysql.cdc', status: 'success', durationMs: 820, rowsIn: 0, rowsOut: 11203 },
      { id: 's2', name: 'decode:binlog', status: 'success', durationMs: 1900, rowsIn: 11203, rowsOut: 11203 },
      { id: 's3', name: 'load:kafka', status: 'success', durationMs: 12100, rowsIn: 11203, rowsOut: 11203 },
      { id: 's4', name: 'load:snowflake', status: 'success', durationMs: 17200, rowsIn: 11203, rowsOut: 11203 },
    ],
  },
  {
    id: 'run_2d10',
    pipelineId: 'pl_orders_realtime',
    pipelineName: 'orders_realtime_cdc',
    status: 'queued',
    startedAt: '2026-04-05T14:24:12Z',
    finishedAt: null,
    durationSec: 0,
    rowsProcessed: 0,
    trigger: 'scheduled',
    steps: [
      { id: 's1', name: 'extract:mysql.cdc', status: 'queued', durationMs: 0, rowsIn: 0, rowsOut: 0 },
      { id: 's2', name: 'decode:binlog', status: 'queued', durationMs: 0, rowsIn: 0, rowsOut: 0 },
      { id: 's3', name: 'load:kafka', status: 'queued', durationMs: 0, rowsIn: 0, rowsOut: 0 },
      { id: 's4', name: 'load:snowflake', status: 'queued', durationMs: 0, rowsIn: 0, rowsOut: 0 },
    ],
  },
];

export const PREVIEW_ROWS: Array<Record<string, string | number>> = [
  { dt: '2026-04-05', product_id: 'prd_8472', region: 'us-west', n_orders: 1284, gross_revenue: 48291.50, avg_order_value: 37.61, median_aov: 32.00 },
  { dt: '2026-04-05', product_id: 'prd_2094', region: 'us-east', n_orders: 984, gross_revenue: 41287.20, avg_order_value: 41.96, median_aov: 36.50 },
  { dt: '2026-04-05', product_id: 'prd_8472', region: 'eu-central', n_orders: 714, gross_revenue: 28934.00, avg_order_value: 40.52, median_aov: 35.00 },
  { dt: '2026-04-05', product_id: 'prd_6283', region: 'us-west', n_orders: 623, gross_revenue: 24882.10, avg_order_value: 39.94, median_aov: 34.00 },
  { dt: '2026-04-05', product_id: 'prd_1044', region: 'apac', n_orders: 502, gross_revenue: 21894.00, avg_order_value: 43.61, median_aov: 38.00 },
  { dt: '2026-04-04', product_id: 'prd_8472', region: 'us-west', n_orders: 1193, gross_revenue: 44812.00, avg_order_value: 37.56, median_aov: 32.00 },
  { dt: '2026-04-04', product_id: 'prd_2094', region: 'us-east', n_orders: 912, gross_revenue: 38204.40, avg_order_value: 41.89, median_aov: 36.00 },
  { dt: '2026-04-04', product_id: 'prd_6283', region: 'us-west', n_orders: 584, gross_revenue: 23104.00, avg_order_value: 39.56, median_aov: 34.00 },
  { dt: '2026-04-04', product_id: 'prd_1044', region: 'apac', n_orders: 471, gross_revenue: 20512.00, avg_order_value: 43.55, median_aov: 38.00 },
  { dt: '2026-04-04', product_id: 'prd_9102', region: 'eu-central', n_orders: 418, gross_revenue: 18823.00, avg_order_value: 45.03, median_aov: 40.00 },
];

export const LOG_LINES: string[] = [
  '[14:23:48.102] INFO  extract:kafka  consuming topic=events.clicks partition=0 offset=8472193',
  '[14:23:48.204] INFO  extract:kafka  batch complete rows=8432 lag_ms=120',
  '[14:23:48.301] INFO  filter:bots    dropped=231 kept=8201',
  '[14:23:48.402] INFO  enrich:geo     lookup_hit=7942 lookup_miss=259',
  '[14:23:48.512] INFO  parse:ua       parsed=8201 errors=0',
  '[14:23:48.634] INFO  merge:join     left=8201 right=8201 matched=8201',
  '[14:23:48.744] INFO  load:snowflake stage=dps_stage file=batch_0423.parquet size=14.2MB',
  '[14:23:48.802] INFO  load:snowflake copy_into_complete rows=8201 elapsed=58ms',
  '[14:23:48.901] INFO  pipeline       batch committed checkpoint=8472193+8432',
  '[14:23:49.002] DEBUG metrics        emitted dps.pipeline.rows=8201 dps.pipeline.latency_ms=800',
  '[14:23:49.103] INFO  scheduler      next_run=2026-04-05T14:24:00Z',
  '[14:23:49.204] WARN  load:snowflake warehouse queue_depth=3 throttle=false',
  '[14:23:49.308] INFO  pipeline       idle awaiting next trigger',
];

export const getPipelineById = (id: string) => PIPELINES.find((p) => p.id === id);
export const getSourceById = (id: string) => DATA_SOURCES.find((s) => s.id === id);
export const getTransformById = (id: string) => TRANSFORMATIONS.find((t) => t.id === id);
export const getJobById = (id: string) => JOB_RUNS.find((j) => j.id === id);
