import { build } from 'esbuild';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

for (const name of ['ui-core', 'ui-box']) {
  const directory = 'packages/' + name;
  await build({
    entryPoints: [directory + '/index.tsx'], outfile: directory + '/dist/index.js',
    bundle: true, format: 'esm', target: 'es2022', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', '@nearic/ui-core'],
  });
  execFileSync('tsc', ['-p', directory + '/tsconfig.build.json'], {stdio:'inherit'});
}
await cp('packages/ui-core/styles.css', 'packages/ui-core/dist/styles.css');
await cp('packages/ui-box/patterns.css', 'packages/ui-box/dist/patterns.css');
const styleSources = ['packages/ui-box/dist/tokens.css', 'packages/ui-core/styles.css', 'packages/ui-box/patterns.css'];
const styles = await Promise.all(styleSources.map(file=> readFile(file, 'utf8')));
await writeFile('packages/ui-box/dist/styles.css', styles.join('\n'));
