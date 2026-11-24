import { build } from 'esbuild';
import { cp, writeFile } from 'node:fs/promises';


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
if (!Object.keys(result.metafile.inputs).some(path => path.endsWith('packages/ui-box/dist/index.js'))) {
  throw new Error('The catalog must import the built @nearic/ui-box package');
}

await cp('packages/ui-box/dist/styles.css', 'dist/styles.css');
await import('./pack.mjs');
await writeFile('dist/.nojekyll', '');
