import { build } from 'esbuild';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const common = {
  bundle: true,
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  metafile: true,
};
await mkdir('dist/mockups', { recursive: true });
const [catalog, mockups] = await Promise.all([
  build({ ...common, entryPoints: ['catalog/runtime.ts'], outfile: 'dist/runtime.js' }),
  build({
    ...common,
    entryPoints: ['apps/mockups/src/main.tsx'],
    outfile: 'dist/mockups/app.js',
    loader: { '.webp': 'file' },
    assetNames: 'assets/[name]-[hash]',
  }),
]);
for (const [name, result] of [
  ['catalog', catalog],
  ['mockups', mockups],
]) {
  if (!Object.keys(result.metafile.inputs).some((p) => p.endsWith('library/dist/index.js'))) {
    throw new Error(name + ' must import the built @nearic/ui entry');
  }
}
await cp('notices', 'dist/notices', { recursive: true });
await cp('apps/mockups/index.html', 'dist/mockups/index.html');
await cp('apps/mockups/assets', 'dist/mockups/assets', { recursive: true });
await mkdir('dist/downloads', { recursive: true });
const [artifact] = JSON.parse(
  execFileSync(
    'npm',
    ['pack', '--workspace', '@nearic/ui', '--pack-destination', 'dist/downloads', '--json'],
    { encoding: 'utf8' },
  ),
);
await writeFile(
  'dist/downloads/package.json',
  JSON.stringify(
    {
      name: artifact.name,
      version: artifact.version,
      filename: artifact.filename,
      integrity: artifact.integrity,
    },
    null,
    2,
  ) + '\n',
);
await writeFile('dist/.nojekyll', '');
