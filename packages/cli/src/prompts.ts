import * as readline from 'node:readline';

function createInterface(): readline.Interface {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

export async function ask(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface();
  const suffix = defaultValue ? ` ${dim(`(${defaultValue})`)}` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

export async function select(question: string, options: string[], defaultIndex = 0): Promise<string> {
  const rl = createInterface();
  console.log(`\n${question}`);
  for (let i = 0; i < options.length; i++) {
    const marker = i === defaultIndex ? '>' : ' ';
    console.log(`  ${marker} ${i + 1}. ${options[i]}`);
  }
  return new Promise((resolve) => {
    rl.question(`\nChoice [${defaultIndex + 1}]: `, (answer) => {
      rl.close();
      const idx = answer.trim() ? parseInt(answer, 10) - 1 : defaultIndex;
      resolve(options[Math.max(0, Math.min(idx, options.length - 1))]);
    });
  });
}

function dim(s: string): string {
  return `\x1b[2m${s}\x1b[0m`;
}
