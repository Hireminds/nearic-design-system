import { build } from 'esbuild';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

for (const [name, stylesheet] of [['ui-core', 'styles.css'], ['ui-box', 'patterns.css']]) {
  const directory = 'packages/' + name;
  await build({
    entryPoints: [directory + '/index.tsx'], outfile: directory + '/dist/index.js',
    bundle: true, format: 'esm', target: 'es2022', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', '@nearic/ui-core'],
  });
  await rename(directory + '/dist/index.css', directory + '/dist/' + stylesheet);
  execFileSync('tsc', ['-p', directory + '/tsconfig.build.json'], {stdio:'inherit'});
}

const styleSources = [
  'packages/ui-box/dist/tokens.css',
  'packages/ui-core/dist/styles.css',
  'packages/ui-box/dist/patterns.css',
];
const styles = await Promise.all(styleSources.map(file => readFile(file, 'utf8')));
await writeFile('packages/ui-box/dist/styles.css', styles.join('\n'));
