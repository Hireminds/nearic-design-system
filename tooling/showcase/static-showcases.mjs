// Compile the real CSF modules once. Node prerenders the same module graph used for
// hydration, including CSS Module identities, imported images and JSX-valued args.
import { build } from 'esbuild';
import { readCsf } from 'storybook/internal/csf-tools';
import { sanitize, storyNameFromExport, toId } from 'storybook/internal/csf';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const quote = JSON.stringify;

export async function buildShowcases({ components, propsFile, outDir, previewClass }) {
  const manifest = JSON.parse(await readFile(propsFile, 'utf8'));
  const dest = path.resolve(outDir, 'live');
  const resolve = createRequire(path.resolve('package.json')).resolve;
  await mkdir(path.join(dest, 'assets'), { recursive: true });
  await mkdir(path.join(dest, 'styles'), { recursive: true });
  const registry = new Map();
  for (const { id, storyFile, component } of components) {
    if (!/^[a-z][a-z0-9-]*$/.test(id) || registry.has(id)) throw new Error('Invalid or duplicate showcase id: ' + id);
    if (!Object.hasOwn(manifest.components, component)) throw new Error('Missing props for ' + component);
    const file = path.resolve(storyFile);
    const csf = (await readCsf(file, { makeTitle: title => title })).parse();
    const index = csf.indexInputs.filter(entry => entry.type === 'story').map(entry => ({
      id: entry.__id ?? toId(entry.metaId ?? entry.title, entry.exportName),
      name: entry.name ?? storyNameFromExport(entry.exportName), exportName: entry.exportName,
    }));
    if (!index.length) throw new Error('No canonical stories in ' + file);
    const propModel = manifest.components[component];
    const needed = new Set(Object.values(propModel).map(prop => prop.labelKey));
    const locales = Object.fromEntries(Object.entries(manifest.locales).map(([lang, labels]) => [lang,
      Object.fromEntries(Object.entries(labels).filter(([key]) => key.startsWith('controls.') || needed.has(key)))]));
    registry.set(id, { id, file, component, index, locales, propModel,
      docsId: sanitize(csf.meta.id ?? csf.meta.title) + '--docs' });
  }

  const adapters = { name: 'nearic-canonical-stories', setup(builder) {
    builder.onResolve({ filter: /^nearic-entry:/ }, args => ({path: args.path.slice('nearic-entry:'.length), namespace: 'nearic-entry'}));
    builder.onLoad({ filter: /.*/, namespace: 'nearic-entry' }, ({path: id}) => {
      if (id === '_render') return { resolveDir: process.cwd(), contents: "export {renderToString,renderToStaticMarkup} from 'react-dom/server.edge'" };
      const { file, component, locales, propModel, index } = registry.get(id);
      return { resolveDir: process.cwd(), loader: 'jsx', contents: [
        'import * as React from "react"',
        'import {hydrateRoot} from "react-dom/client"',
        'import {createExamples} from ' + quote(path.join(here, 'StoryExample.tsx')),
        'import * as csf from ' + quote(file),
        'const Example=createExamples(csf,' + quote({ component, previewClass, locales, propModel, index }) + ')',
        'export const element=(id,lang,snapshot=false,host)=> <Example {...{id,lang,snapshot,host}} />',
        'export function mountShowcase(host) {',
        '  const root=hydrateRoot(host.querySelector("[data-nearic-island]"),element(host.dataset.story,host.dataset.lang,false,host),{identifierPrefix:host.dataset.prefix});',
        '  return ()=>root.unmount()',
        '}',
      ].join('\n') };
    });
    builder.onResolve({ filter: /^storybook\/preview-api$/ }, () => ({ path: path.join(here, 'story-context.ts') }));
    builder.onResolve({ filter: /^storybook\/test$/ }, () => ({ path: resolve('@vitest/spy') }));
    builder.onResolve({ filter: /^react(?:-dom)?(?:\/.*)?$/ }, args => ({path: resolve(args.path)}));
    builder.onResolve({ filter: /^@nearic\/ui-core$/ }, args => args.pluginData?.workspace ? undefined :
      builder.resolve(args.path, { resolveDir: process.cwd(), kind: 'import-statement', pluginData: {workspace:true} }));
    builder.onResolve({ filter: /\.md\?raw$/ }, args => ({path: path.resolve(args.resolveDir,args.path.slice(0,-4)), namespace:'docs'}));
    builder.onLoad({ filter: /.*/, namespace: 'docs' }, async ({path: file}) => ({contents: await readFile(file,'utf8'), loader:'text'}));
    builder.onLoad({ filter: /\.(?:png|jpe?g|webp|gif|svg|avif)$/i }, async ({path: file}) => {
      const bytes = await readFile(file);
      const name = createHash('sha256').update(bytes).digest('hex').slice(0,12) + '-' + path.basename(file);
      await writeFile(path.join(dest,'assets',name),bytes);
      return {loader:'js',contents:'export default '+quote('./live/assets/' + name)};
    });
  } };

  const server = path.join(dest,'_render.js');
  try {
    const bundle = await build({ metafile: true, entryPoints: [...registry.keys(), '_render'].map(id => ({ in:'nearic-entry:' + id, out:id })),
      outdir: dest, plugins: [adapters], format:'esm', platform:'browser', jsx:'automatic', target:'es2022',
      bundle:true, splitting:true, chunkNames:'chunks/[name]-[hash]', minify:true,
      define:{'process.env.NODE_ENV':'"production"'} });
    for (const input of Object.keys(bundle.metafile.inputs)) {
      if (/(?:^|\/)node_modules\/(?:storybook|@storybook\/[^/]+)\/dist\//.test(input))
        throw new Error('Showcase unexpectedly depends on a Storybook runtime module: ' + input);
    }
    const styles = new Set();
    const { renderToString, renderToStaticMarkup } = await import(pathToFileURL(server));
    const result = [];
    for (const {id,component,docsId,index,locales} of registry.values()) {
      const {element} = await import(pathToFileURL(path.join(dest,id+'.js')));
      const primaryId = index[0].id;
      const states = index.map(({id:storyId,name}) => {
        const htmlByLocale = Object.fromEntries(Object.keys(locales).map(lang => [lang,
          renderToStaticMarkup(element(storyId,lang,true), {identifierPrefix:'sample-'+storyId+'-'})]));
        return {id:storyId, name, html:htmlByLocale.ru, htmlByLocale};
      });
      const liveHTML = {};
      for (const lang of Object.keys(locales)) {
        const prefix='live-'+primaryId+'-';
        const html=renderToString(element(primaryId,lang), {identifierPrefix:prefix});
        const button=component==='Button';
        liveHTML[lang]='<div data-nearic-live'+(button?' data-nearic-button-live':'')+' data-story="'+primaryId+'" data-lang="'+lang+'" data-prefix="'+prefix+'"><div data-nearic-island'+(button?' data-nearic-button-island':'')+' inert>'+html+'</div></div>';
      }
      // esbuild emits a CSS file per entry, including when every byte is identical.
      // Share the content-addressed stylesheet across component pages and languages.
      const cssFile = path.join(dest, id + '.css');
      const css = await readFile(cssFile);
      const cssName = createHash('sha256').update(css).digest('hex').slice(0, 16) + '.css';
      if (!styles.has(cssName)) {
        await writeFile(path.join(dest, 'styles', cssName), css);
        styles.add(cssName);
      }
      await rm(cssFile);
      result.push({id,component,docsId,primaryId,states,liveHTML,runtimeURL:'./live/'+id+'.js', styleURL:'./live/styles/'+cssName});
    }
    return result;
  } finally {
    await rm(server,{force:true});
  }
}
