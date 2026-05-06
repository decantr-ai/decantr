import { describe, expect, it } from 'vitest';
import type { DecantrTelemetryEvent } from '../src/events.js';
import { isSensitiveTelemetryKey, REDACTED_VALUE, sanitizeTelemetryEvent } from '../src/privacy.js';

describe('telemetry privacy', () => {
  it('classifies raw identifiers and content keys as sensitive', () => {
    expect(isSensitiveTelemetryKey('prompt')).toBe(true);
    expect(isSensitiveTelemetryKey('source')).toBe(true);
    expect(isSensitiveTelemetryKey('sourceCode')).toBe(true);
    expect(isSensitiveTelemetryKey('filePath')).toBe(true);
    expect(isSensitiveTelemetryKey('api_key')).toBe(true);
    expect(isSensitiveTelemetryKey('durationMs')).toBe(false);
    expect(isSensitiveTelemetryKey('errorCode')).toBe(false);
    expect(isSensitiveTelemetryKey('registrySource')).toBe(false);
  });

  it('redacts sensitive properties while preserving aggregate signals', () => {
    const event: DecantrTelemetryEvent = {
      name: 'cli.command.completed',
      timestamp: '2026-05-06T12:00:00.000Z',
      context: {
        source: 'cli',
        installId: 'install_123',
      },
      properties: {
        command: 'audit',
        success: false,
        durationMs: 412,
        errorCode: 'guard_failed',
        prompt: 'make a private fintech dashboard',
        filePath: '/Users/example/project/src/App.tsx',
        nested: {
          sourceCode: '<button>private</button>',
          warningCount: 2,
        },
      },
    };

    const sanitized = sanitizeTelemetryEvent(event);

    expect(sanitized.properties.command).toBe('audit');
    expect(sanitized.properties.durationMs).toBe(412);
    expect(sanitized.properties.errorCode).toBe('guard_failed');
    expect(sanitized.properties.prompt).toBe(REDACTED_VALUE);
    expect(sanitized.properties.filePath).toBe(REDACTED_VALUE);
    expect(sanitized.properties.nested).toEqual({
      sourceCode: REDACTED_VALUE,
      warningCount: 2,
    });
  });
});
