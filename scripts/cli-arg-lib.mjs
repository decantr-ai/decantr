export function readArgValue(argv, name) {
  const flag = `--${name}`;
  const eqPrefix = `${flag}=`;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === flag) {
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) {
        return null;
      }
      return next;
    }
    if (arg.startsWith(eqPrefix)) {
      return arg.slice(eqPrefix.length);
    }
  }

  return null;
}
