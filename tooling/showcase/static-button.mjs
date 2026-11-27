// Compatibility with catalogs pinned to the Button pilot's build API and URLs.
import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildShowcases } from './static-showcases.mjs';

export async function buildButtonShowcase({ storyFile, propsFile, outDir, previewClass }) {
  const [button] = await buildShowcases({
    components: [{id: 'button', component: 'Button', storyFile}], propsFile, outDir, previewClass,
  });
  await writeFile(path.resolve(outDir, 'button-live.js'),
    'export { mountShowcase as mountButton } from ' + JSON.stringify(button.runtimeURL) + ';\n');
  await copyFile(path.resolve(outDir, button.styleURL), path.resolve(outDir, 'button-live.css'));
  return button;
}
