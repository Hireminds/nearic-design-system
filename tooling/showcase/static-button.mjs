// Evaluate canonical CSF at build time. The client only needs the released Button,
// its serializable args and the same controls renderer used by the technical stories.
import { build } from 'esbuild';
import * as React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { composeStories } from '@storybook/react';
import { readCsf } from 'storybook/internal/csf-tools';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const quote = JSON.stringify;
const tools = name => quote(path.join(here, name));
const bundle = {
  bundle: true, format: 'esm', jsx: 'automatic', target: 'es2022',
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.module.css': 'local-css' },
};
const rawDocs = { name: 'raw-docs', setup(builder) {
  builder.onResolve({ filter: /\.md\?raw$/ }, args => ({
    path: path.resolve(args.resolveDir, args.path.slice(0, -4)), namespace: 'raw-docs',
  }));
  builder.onLoad({ filter: /.*/, namespace: 'raw-docs' }, async args => ({
    contents: await readFile(args.path, 'utf8'), loader: 'text',
  }));
} };

export async function buildButtonShowcase({ storyFile, propsFile, outDir, uiPackage, previewClass }) {
  const filename = path.resolve(storyFile);
  const csf = (await readCsf(filename, { makeTitle: title => title })).parse();
  const entries = csf.indexInputs.filter(entry => entry.type === 'story');
  const manifest = JSON.parse(await readFile(propsFile, 'utf8'));
  const temp = await mkdtemp(path.resolve('node_modules/.nearic-button-'));
  try {
    const compiled = path.join(temp, 'stories.mjs');
    await build({ ...bundle, platform: 'node', outfile: compiled, plugins: [rawDocs],
      external: ['react', 'react-dom', 'storybook', '@storybook/*'],
      stdin: { resolveDir: process.cwd(), contents: [
        'export * as csf from ' + quote(filename),
        'export { ButtonLive } from ' + tools('ButtonLive.tsx'),
        'export { localizedArgTypes } from ' + tools('labels.ts'),
      ].join('\n') },
    });
    const { csf: stories, ButtonLive, localizedArgTypes } = await import(pathToFileURL(compiled));
    const portable = composeStories(stories);
    const indexed = {};
    const states = entries.map(({ exportName, name }) => {
      const story = portable[exportName];
      const html = renderToStaticMarkup(React.createElement(story));
      indexed[story.id] = { args: JSON.parse(JSON.stringify(story.args)), focus: html.includes('data-nearic-focus-target') };
      return { id: story.id, name: name ?? story.storyName, html };
    });
    const primary = states[0];
    if (!primary) throw new Error('Button needs a canonical initial story');
    const Button = stories.default.component;
    if (renderToStaticMarkup(React.createElement(Button, indexed[primary.id].args)) !== primary.html)
      throw new Error('Button live preview requires a canonical first story rendered directly from serializable Button props');
    const primaryArgs = { ...stories.default.argTypes, ...stories[entries[0].exportName].argTypes };
    const liveHTML = {};
    for (const [lang, labels] of Object.entries(manifest.locales)) {
      const argTypes = localizedArgTypes(manifest.components.Button, primaryArgs, labels);
      const model = { primaryId: primary.id, stories: indexed, labels, argTypes, previewClass };
      const html = renderToString(React.createElement(ButtonLive, { model, Button, storyId: primary.id }));
      const data = JSON.stringify(model).replaceAll('<', '\\u003c');
      liveHTML[lang] = '<div data-nearic-button-live><div data-nearic-button-island inert>' + html +
        '</div><script type="application/json">' + data + '</script></div>';
    }
    await build({ ...bundle, minify: true, outfile: path.resolve(outDir, 'button-live.js'),
      stdin: { resolveDir: process.cwd(), contents: [
        'import {Button} from ' + quote(uiPackage),
        'import {mountButtonComponent} from ' + tools('button-client.tsx'),
        'export const mountButton = host => mountButtonComponent(host, Button)',
      ].join('\n') },
    });
    return { docsId: primary.id.split('--')[0] + '--docs', primaryId: primary.id, states, liveHTML };
  } finally { await rm(temp, { recursive: true, force: true }); }
}
