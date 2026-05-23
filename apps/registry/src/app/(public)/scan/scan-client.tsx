'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

type ApplicabilityStatus = 'strong_fit' | 'partial_fit' | 'not_applicable' | 'unknown';
type FindingSeverity = 'success' | 'info' | 'warn' | 'error';

interface ScanFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  message: string;
  evidence: string[];
  recommendation?: string;
}

interface ScanRoute {
  path: string;
  file: string;
  hasLayout: boolean;
}

interface ScanReport {
  $schema: 'https://decantr.ai/schemas/scan-report.v1.json';
  schemaVersion: 'scan-report.v1';
  generatedAt: string;
  input: { kind: string; value: string };
  source: {
    repository: null | { owner: string; repo: string; url: string };
    publishedSiteUrl: string | null;
  };
  confidence: { level: string; score: number; reasons: string[] };
  applicability: { status: ApplicabilityStatus; label: string; reasons: string[] };
  project: {
    framework: string;
    frameworkVersion: string | null;
    packageManager: string;
    primaryLanguage: string;
    hasTypeScript: boolean;
    hasTailwind: boolean;
    hasDecantr: boolean;
    packageName: string | null;
  };
  routes: { strategy: string; count: number; items: ScanRoute[] };
  components: { pageCount: number; componentCount: number; directories: string[] };
  styling: {
    approach: string;
    configFile: string | null;
    cssVariableCount: number;
    colorTokenCount: number;
    darkMode: boolean;
    themeSignals: string[];
  };
  staticHosting: {
    githubPagesLikely: boolean;
    evidence: string[];
    homepageUrl: string | null;
    basePath: string | null;
    hashRouting: boolean;
  };
  assistant: { ruleFiles: string[] };
  pagesProbe: null | {
    checked: boolean;
    reachable: boolean;
    status: number | null;
    finalUrl: string | null;
    title: string | null;
    description: string | null;
    canonicalUrl: string | null;
    assetHints: { rootRelative: number; relative: number; absolute: number; samples: string[] };
    routingHints: string[];
    error: string | null;
  };
  findings: ScanFinding[];
  recommendedCommands: string[];
  privacy: { sourceUploaded: boolean; persistedByDecantr: boolean; notes: string[] };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

const PROGRESS_COPY = [
  'Resolving the GitHub surface',
  'Reading repository shape',
  'Mapping routes and UI evidence',
  'Checking published Pages metadata',
  'Preparing the Brownfield report',
];

function statusLabel(status: ApplicabilityStatus) {
  switch (status) {
    case 'strong_fit':
      return 'Strong fit';
    case 'partial_fit':
      return 'Partial fit';
    case 'not_applicable':
      return 'Not a UI target';
    default:
      return 'Unknown';
  }
}

function severityLabel(severity: FindingSeverity) {
  if (severity === 'success') return 'OK';
  if (severity === 'warn') return 'Warn';
  if (severity === 'error') return 'Issue';
  return 'Info';
}

function commandFor(report: ScanReport, fallback: string) {
  return report.recommendedCommands.find((command) => command.includes(fallback)) ?? null;
}

function styleSignalLevel(value: number) {
  if (value <= 0) return 'is-empty';
  if (value < 8) return 'is-low';
  if (value < 40) return 'is-medium';
  return 'is-high';
}

function scoreState(status: ApplicabilityStatus) {
  if (status === 'strong_fit') return 'success';
  if (status === 'partial_fit') return 'warning';
  if (status === 'not_applicable') return 'error';
  return undefined;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="d-card registry-scan-metric" data-padding="compact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CommandButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="registry-scan-command" onClick={copy}>
      <span>$</span>
      <code>{command}</code>
      <small>{copied ? 'Copied' : 'Copy'}</small>
    </button>
  );
}

function ReportView({ report }: { report: ScanReport }) {
  const adoptCommand = commandFor(report, 'adopt');
  const scanCommand = commandFor(report, 'scan') ?? 'npx @decantr/cli scan';
  const isGoodFit = report.applicability.status === 'strong_fit';
  const confidenceStyle = {
    '--d-conic-value': String(Math.max(0, Math.min(100, report.confidence.score)) / 100),
    '--d-conic-size': '8.5rem',
    '--d-conic-thickness': '0.7rem',
  } as CSSProperties;

  return (
    <div className="registry-scan-report entrance-fade" aria-live="polite">
      <section className="d-card registry-scan-verdict" data-padding="spacious" aria-labelledby="scan-verdict-heading">
        <div>
          <span className="d-label registry-anchor-label">Scan verdict</span>
          <h2 id="scan-verdict-heading">{report.applicability.label}</h2>
          <p>{report.applicability.reasons[0] ?? 'Decantr finished the read-only scan.'}</p>
        </div>
        <div
          className="d-conic-ring registry-scan-score"
          data-state={scoreState(report.applicability.status)}
          data-status={report.applicability.status}
          style={confidenceStyle}
        >
          <strong>{report.confidence.score}</strong>
          <span>{statusLabel(report.applicability.status)}</span>
        </div>
      </section>

      <section className="registry-scan-grid" aria-label="Scan summary">
        <Metric label="Framework" value={report.project.framework} />
        <Metric label="Routes" value={report.routes.count} />
        <Metric label="Components" value={report.components.componentCount} />
        <Metric label="Styling" value={report.styling.approach} />
      </section>

      <section className="registry-scan-two-up" aria-label="Repository and published surface evidence">
        <article className="d-card registry-scan-panel" data-padding="spacious">
          <span className="d-label registry-anchor-label">Repository evidence</span>
          <h3>{report.source.repository ? `${report.source.repository.owner}/${report.source.repository.repo}` : 'Local scan'}</h3>
          <dl className="registry-scan-definition-list">
            <div>
              <dt>Package manager</dt>
              <dd>{report.project.packageManager}</dd>
            </div>
            <div>
              <dt>TypeScript</dt>
              <dd>{report.project.hasTypeScript ? 'Detected' : 'Not detected'}</dd>
            </div>
            <div>
              <dt>Decantr</dt>
              <dd>{report.project.hasDecantr ? 'Already attached' : 'Not attached'}</dd>
            </div>
            <div>
              <dt>Assistant rules</dt>
              <dd>{report.assistant.ruleFiles.length}</dd>
            </div>
          </dl>
        </article>

        <article className="d-card registry-scan-panel" data-padding="spacious">
          <span className="d-label registry-anchor-label">Published Pages evidence</span>
          <h3>{report.source.publishedSiteUrl ?? 'No published URL confirmed'}</h3>
          <dl className="registry-scan-definition-list">
            <div>
              <dt>GitHub Pages</dt>
              <dd>{report.staticHosting.githubPagesLikely ? 'Likely' : 'Not confirmed'}</dd>
            </div>
            <div>
              <dt>HTTP probe</dt>
              <dd>
                {report.pagesProbe?.checked
                  ? report.pagesProbe.reachable
                    ? `Reachable ${report.pagesProbe.status ?? ''}`
                    : 'Unreachable'
                  : 'Not checked'}
              </dd>
            </div>
            <div>
              <dt>Hash routing</dt>
              <dd>{report.staticHosting.hashRouting ? 'Detected' : 'Not detected'}</dd>
            </div>
            <div>
              <dt>Base path</dt>
              <dd>{report.staticHosting.basePath ?? 'None detected'}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="registry-scan-two-up registry-scan-analysis-row" aria-label="Routes and styling">
        <article className="d-card registry-scan-panel" data-padding="spacious">
          <span className="d-label registry-anchor-label">Route map</span>
          <h3>{report.routes.strategy}</h3>
          {report.routes.items.length > 0 ? (
            <div className="registry-scan-route-list">
              {report.routes.items.slice(0, 8).map((route) => (
                <div key={`${route.path}-${route.file}`} className="registry-scan-route-row">
                  <strong>{route.path}</strong>
                  <span>{route.file}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No route declarations were detected in the static pass.</p>
          )}
        </article>

        <article className="d-card registry-scan-panel" data-padding="spacious">
          <span className="d-label registry-anchor-label">Style intelligence</span>
          <h3>{report.styling.approach}</h3>
          <div className="registry-scan-style-bars">
            <span className={`registry-scan-style-bar ${styleSignalLevel(report.styling.cssVariableCount)}`}>
              CSS variables
              <strong>{report.styling.cssVariableCount}</strong>
            </span>
            <span className={`registry-scan-style-bar ${styleSignalLevel(report.styling.colorTokenCount)}`}>
              Color literals
              <strong>{report.styling.colorTokenCount}</strong>
            </span>
          </div>
          <p>
            {report.styling.themeSignals.length > 0
              ? report.styling.themeSignals.join(', ')
              : 'No explicit theme selectors were found.'}
          </p>
        </article>
      </section>

      <section className="registry-scan-findings" aria-labelledby="scan-findings-heading">
        <div className="registry-home-section-head">
          <span className="d-label registry-anchor-label">Findings</span>
          <h2 id="scan-findings-heading" className="registry-home-section-title">
            What Decantr can prove from the public surface.
          </h2>
        </div>
        <div className="registry-scan-finding-list">
          {report.findings.map((finding) => (
            <article key={finding.id} className="d-card registry-scan-finding" data-padding="compact" data-severity={finding.severity}>
              <span>{severityLabel(finding.severity)}</span>
              <h3>{finding.title}</h3>
              <p>{finding.message}</p>
              {finding.recommendation ? <small>{finding.recommendation}</small> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="d-card registry-scan-next" data-padding="spacious" aria-label="Recommended next commands">
        <div>
          <span className="d-label registry-anchor-label">Next step</span>
          <h2>Run the same read-only pass locally.</h2>
          <p>{report.privacy.notes[0]}</p>
        </div>
        <div className="registry-scan-command-stack">
          <CommandButton command={scanCommand} />
          {isGoodFit && adoptCommand ? <CommandButton command={adoptCommand} /> : null}
        </div>
      </section>
    </div>
  );
}

export function ScanExperience() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [stage, setStage] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'scanning') return undefined;
    const interval = window.setInterval(() => {
      setStage((current) => (current + 1) % PROGRESS_COPY.length);
    }, 1200);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === 'idle') return undefined;
    function resetScanScroll() {
      const container = document.querySelector<HTMLElement>('.registry-public-main');
      container?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const frame = window.requestAnimationFrame(resetScanScroll);
    const timeout = window.setTimeout(resetScanScroll, 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [status]);

  const heroCompact = status !== 'idle' || Boolean(report);
  const placeholder = useMemo(() => 'https://github.com/owner/repo', []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextUrl = url.trim();
    if (!nextUrl) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setStatus('scanning');
    setStage(0);
    setError(null);
    setReport(null);
    try {
      const response = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: nextUrl }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Scan failed.');
      }
      setReport(payload as ScanReport);
      setStatus('done');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Scan failed.');
      setStatus('error');
    }
  }

  return (
    <div className="registry-scan-page">
      <section className={heroCompact ? 'registry-scan-hero registry-scan-hero-compact' : 'registry-scan-hero'} aria-labelledby="scan-heading">
        <div className="registry-scan-hero-inner">
          <div className="registry-scan-hero-copy">
            <h1 id="scan-heading" className="registry-home-title">
              See what Decantr can prove before you install anything.
            </h1>
            <p className="registry-home-description">
              Paste a public GitHub repo or GitHub Pages URL. Decantr runs static reconnaissance,
              checks the published surface with HTTP only, and returns an ephemeral report.
            </p>
            <ul className="registry-scan-guarantees" aria-label="Scan guarantees">
              <li>No install</li>
              <li>No build</li>
              <li>No source execution</li>
            </ul>
          </div>

          <form className="registry-scan-search" onSubmit={submit}>
            <label htmlFor="scan-url" className="sr-only">
              GitHub repository or GitHub Pages URL
            </label>
            <input
              id="scan-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="d-control"
              placeholder={placeholder}
              type="url"
              inputMode="url"
            />
            <button type="submit" className="d-interactive d-ripple" data-variant="primary" disabled={status === 'scanning'}>
              {status === 'scanning' ? 'Scanning' : 'Scan'}
            </button>
          </form>

          <div className="registry-scan-stage" aria-live="polite">
            {status === 'scanning' ? (
              <>
                <span className="registry-scan-stage-line" aria-hidden="true" />
                <strong>{PROGRESS_COPY[stage]}</strong>
                <p>No install. No build. No repo code execution.</p>
              </>
            ) : (
              <>
                <strong>Static repo evidence plus HTTP-only Pages probe.</strong>
                <p>Built for public Brownfield triage, not source takeover.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <section className="registry-scan-error" role="alert">
          <strong>Scan could not start</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {report ? <ReportView report={report} /> : null}
    </div>
  );
}
