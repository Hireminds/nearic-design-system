import { build } from 'esbuild';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const result = await build({
  entryPoints: ['catalog/runtime.ts'],
  outfile: 'dist/runtime.js',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  metafile: true,
});
if (!Object.keys(result.metafile.inputs).some(path => path.endsWith('library/dist/index.js'))) {
  throw new Error('The catalog must import the built @nearic/ui-box package');
}

await cp('library/dist/styles.css', 'dist/styles.css');
await mkdir('dist/downloads', { recursive: true });
const [artifact] = JSON.parse(execFileSync('npm', [
  'pack', '--workspace', '@nearic/ui-box', '--pack-destination', 'dist/downloads', '--json',
], { encoding: 'utf8' }));
const { name, version, filename, integrity } = artifact;
await writeFile('dist/downloads/package.json', JSON.stringify({ name, version, filename, integrity }, null, 2) + '\n');
await writeFile('dist/.nojekyll', '');
