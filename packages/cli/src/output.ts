const ESC = '\x1b[';
export const bold = (s: string) => `${ESC}1m${s}${ESC}0m`;
export const dim = (s: string) => `${ESC}2m${s}${ESC}0m`;
export const green = (s: string) => `${ESC}32m${s}${ESC}0m`;
export const red = (s: string) => `${ESC}31m${s}${ESC}0m`;
export const yellow = (s: string) => `${ESC}33m${s}${ESC}0m`;
export const cyan = (s: string) => `${ESC}36m${s}${ESC}0m`;

export function success(msg: string): string {
  return `${green('✓')} ${msg}`;
}

export function error(msg: string): string {
  return `${red('✗')} ${msg}`;
}

export function warn(msg: string): string {
  return `${yellow('⚠')} ${msg}`;
}

export function info(msg: string): string {
  return `${dim('ℹ')} ${msg}`;
}

export function heading(msg: string): string {
  return `\n${bold(msg)}\n`;
}

export function table(rows: [string, string][]): string {
  const maxLabel = Math.max(...rows.map(([l]) => l.length));
  return rows.map(([label, value]) => `  ${label.padEnd(maxLabel)}  ${dim(value)}`).join('\n');
}
