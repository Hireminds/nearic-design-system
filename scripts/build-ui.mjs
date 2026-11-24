import { build } from 'esbuild';
import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

await mkdir('library/dist', { recursive: true });
await build({
  entryPoints: ['library/index.tsx'],
  outfile: 'library/dist/index.js',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  external: ['react', 'react/jsx-runtime'],
});
execFileSync('tsc', ['-p', 'library/tsconfig.build.json'], { stdio: 'inherit' });
await cp('dist/tokens.css', 'library/dist/tokens.css');
await cp('tokens/tokens.json', 'library/dist/tokens.json');
const styles = await Promise.all(
  ['dist/tokens.css', 'library/atoms.css'].map((p) => readFile(p, 'utf8')),
);
await writeFile('library/dist/styles.css', styles.join('\n'));
