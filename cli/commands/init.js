import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { welcome, success, info, heading } from '../art.js';
import { packageJson, configJson, indexHtml, manifest, claudeMd, vendorIconsJs } from '../templates/shared.js';
import { dashboardFiles } from '../templates/dashboard.js';
import { landingFiles } from '../templates/landing.js';
import { demoFiles } from '../templates/demo.js';

async function ask(rl, question, defaultVal) {
  const answer = await rl.question(`  ${question} (${defaultVal}): `);
  return answer.trim() || defaultVal;
}

function renderOptions(options, selected) {
  return options.map((opt, i) => {
    const active = i === selected;
    const marker = active ? '\x1b[36m>\x1b[0m' : ' ';
    const label = active ? `\x1b[1m${opt.label}\x1b[0m` : opt.label;
    const desc = opt.desc ? ` \x1b[2m— ${opt.desc}\x1b[0m` : '';
    return `  ${marker} ${i + 1}) ${label}${desc}`;
  }).join('\n');
}

async function askChoice(rl, question, options, defaultIdx = 0) {
  console.log(heading(question));

  // Fallback for non-TTY (piped input)
  if (!stdin.isTTY) {
    options.forEach((opt, i) => {
      const marker = i === defaultIdx ? '\x1b[36m>' : ' ';
      console.log(`  ${marker} ${i + 1}) ${opt.label}${opt.desc ? ` \x1b[2m— ${opt.desc}\x1b[0m` : ''}\x1b[0m`);
    });
    const answer = await rl.question(`  Choose [${defaultIdx + 1}]: `);
    const idx = parseInt(answer.trim()) - 1;
    return (idx >= 0 && idx < options.length) ? options[idx].value : options[defaultIdx].value;
  }

  return new Promise((resolve) => {
    let selected = defaultIdx;

    stdout.write(renderOptions(options, selected));

    rl.pause();
    stdin.setRawMode(true);
    stdin.resume();

    function done(value) {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      while (stdin.read() !== null);
      setImmediate(() => {
        rl.resume();
        resolve(value);
      });
    }

    function onData(buf) {
      const key = buf.toString();

      if (key === '\x03') { // Ctrl+C
        stdin.setRawMode(false);
        stdin.removeListener('data', onData);
        process.exit(0);
      }

      if (key === '\x1b[A') { // Up arrow
        selected = (selected - 1 + options.length) % options.length;
      } else if (key === '\x1b[B') { // Down arrow
        selected = (selected + 1) % options.length;
      } else if (key === '\r' || key === '\n') { // Enter
        stdout.write('\n');
        return done(options[selected].value);
      } else if (key >= '1' && key <= '9') { // Number shortcut
        const idx = parseInt(key) - 1;
        if (idx < options.length) {
          selected = idx;
          stdout.write(`\x1b[${options.length}A\x1b[J`);
          stdout.write(renderOptions(options, selected) + '\n');
          return done(options[selected].value);
        }
      } else {
        return;
      }

      // Re-render list in place
      stdout.write(`\x1b[${options.length}A\x1b[J`);
      stdout.write(renderOptions(options, selected));
    }

    stdin.on('data', onData);
  });
}

export async function run() {
  const rl = createInterface({ input: stdin, output: stdout });
  const cwd = process.cwd();

  console.log(welcome('0.2.0'));

  try {
    // 1. Project name
    const name = await ask(rl, 'Project name?', basename(cwd));

    // 2. Project type (or demo mode)
    const projectType = await askChoice(rl, 'Project type?', [
      { label: 'Dashboard', desc: 'Sidebar, header, data tables', value: 'dashboard' },
      { label: 'Landing Page', desc: 'Hero, features, pricing', value: 'landing' },
      { label: "Don't ask me, just show me!", desc: 'Demo showcase of everything', value: 'demo' }
    ]);

    // 3. Color theme
    const theme = await askChoice(rl, 'Color theme?', [
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark' },
      { label: 'AI', desc: 'Deep purples & cyans', value: 'ai' },
      { label: 'Nature', desc: 'Earthy greens', value: 'nature' },
      { label: 'Pastel', desc: 'Soft pinks', value: 'pastel' },
      { label: 'Spice', desc: 'Warm oranges', value: 'spice' },
      { label: 'Monochromatic', desc: 'Pure grayscale', value: 'mono' }
    ]);

    // 4. Design style
    const style = await askChoice(rl, 'Design style?', [
      { label: 'Glassmorphism', desc: 'Frosted glass, blur', value: 'glass' },
      { label: 'Minimal', desc: 'Clean lines, no effects', value: 'flat' },
      { label: 'Neobrutalism', desc: 'Bold borders, offset shadows', value: 'brutalist' },
      { label: 'Skeuomorphic', desc: 'Gradients, 3D depth', value: 'skeuo' },
      { label: 'Hand-drawn', desc: 'Wobbly borders, sketchy', value: 'sketchy' },
      { label: 'Hot Lava', desc: 'Volcanic gradients, ember glow', value: 'lava' }
    ], 1);

    // 5. Router mode
    const router = await askChoice(rl, 'Router mode?', [
      { label: 'History', desc: 'Clean URLs (needs server)', value: 'history' },
      { label: 'Hash', desc: 'Works everywhere', value: 'hash' }
    ]);

    // 6. Icons
    const iconsChoice = await askChoice(rl, 'Icon library?', [
      { label: 'None', desc: 'Skip for now', value: 'none' },
      { label: 'Material Icons', desc: 'Google Material Design', value: 'material' },
      { label: 'Lucide', desc: 'Beautiful open-source icons', value: 'lucide' }
    ]);

    let icons = null;
    let iconDelivery = null;
    if (iconsChoice !== 'none') {
      icons = iconsChoice;
      iconDelivery = await askChoice(rl, 'Icon delivery?', [
        { label: 'CDN', desc: 'Link tag, no install', value: 'cdn' },
        { label: 'npm', desc: 'Install as dependency', value: 'npm' }
      ]);
    }

    // 7. Port
    const port = parseInt(await ask(rl, 'Dev server port?', '4200'));

    const opts = { name, projectType, theme, style, router, icons, iconDelivery, port };

    console.log(heading('Decanting your project...'));

    // Create directories
    const dirs = ['public', '.decantr', 'test', 'src/pages', 'src/components'];
    if (projectType === 'landing') dirs.push('src/sections');
    if (iconDelivery === 'npm') dirs.push('scripts');
    for (const dir of dirs) {
      await mkdir(join(cwd, dir), { recursive: true });
    }

    // Shared files
    const files = [
      ['package.json', packageJson(name, opts)],
      ['decantr.config.json', configJson(opts)],
      ['public/index.html', indexHtml(opts)],
      ['.decantr/manifest.json', manifest(opts)],
      ['CLAUDE.md', claudeMd(opts)]
    ];

    if (iconDelivery === 'npm') {
      files.push(['scripts/vendor-icons.js', vendorIconsJs(opts)]);
    }

    // Project-type files
    let typeFiles;
    if (projectType === 'dashboard') {
      typeFiles = dashboardFiles(opts);
    } else if (projectType === 'landing') {
      typeFiles = landingFiles(opts);
    } else {
      typeFiles = demoFiles(opts);
    }
    files.push(...typeFiles);

    // Write all files
    for (const [path, content] of files) {
      await writeFile(join(cwd, path), content + '\n');
      console.log('  ' + success(path));
    }

    console.log(heading('Your project is ready!'));
    console.log(info('Next steps:'));
    console.log(`    npm install`);
    console.log(`    npx decantr dev`);
    console.log('');

  } finally {
    rl.close();
    stdin.unref();
  }
}
