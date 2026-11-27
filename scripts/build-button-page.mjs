import { readFile, writeFile } from 'node:fs/promises';
import { navigationHTML, route } from '../catalog/navigation.js';
import { buildButtonShowcase } from '../tooling/showcase/static-button.mjs';

const source = await readFile('catalog/index.html', 'utf8');
const data = JSON.parse((await readFile('dist/data.js', 'utf8')).trim().slice('window.catalogData = '.length, -1));
const button = data.atoms.find(item => item.id === 'button');
const { docsId, primaryId, states, liveHTML } = await buildButtonShowcase({
  storyFile: 'packages/ui-core/src/Button/Button.stories.tsx', propsFile: 'storybook/.generated/props.json',
  outDir: 'dist', uiPackage: '@nearic/ui-box', previewClass: 'box-example',
});
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const stateCards = states.map(({ id, name, html }) => `
  <figure data-state="${escape(name)}">
    <figcaption>
      <button type="button" data-select-story="${escape(id)}" aria-pressed="${id === primaryId}" disabled>${escape(name)}</button>
      <a href="./storybook/?path=/story/${encodeURIComponent(id)}" aria-label="${escape(name)} в Storybook">Storybook</a>
    </figcaption>
    <div class="button-snapshot" inert>${html}</div>
  </figure>`).join('');
function content(lang) {
  const usage = button.usage.split(/\n\s*\n/).map(text => '<p>' + escape(text) + '</p>').join('');
  return `<div id="box/atoms/button" data-button-page lang="${lang}">
    <div class="page-title"><h1>${escape(button.name)}</h1><p>${escape(button.summary)}</p><span class="proposal">Предложение</span></div>
    <div class="detail-container">
      <div class="part-heading"><h2>Живой пример</h2><a href="./storybook/?path=/docs/${encodeURIComponent(docsId)}">Свойства и TSX в Storybook</a></div>
      <div class="demo" data-family="box" data-platform="box" data-component="button">${liveHTML[lang]}</div>
      <section class="details"><h2>Применение</h2>${usage}<h2>Состояния и варианты</h2></section>
      <div class="state-grid" data-family="box">${stateCards}</div>
    </div></div>`;
}
const crumb = `<a href="${route()}">Каталог</a><span class="crumb-sep">/</span><a href="${route('atoms')}">Атомы</a><span class="crumb-sep">/</span><b>${escape(button.name)}</b>`;
const buttonRoute = { section: 'atoms', entry: 'button' };
for (const [file, lang] of [['index.html', 'ru'], ['button.html', 'ru'], ['button.en.html', 'en']]) {
  let html = source.replace('</head>', '<link rel="stylesheet" href="./button-live.css">\n</head>')
    .replace('<div id="page"></div>', () => '<div id="page">' + content(lang) + '</div>')
    .replace('aria-label="Оглавление"></nav>', () => 'aria-label="Оглавление">' + navigationHTML(data, buttonRoute) + '</nav>');
  if (file !== 'index.html') html = html.replace('<html lang="ru"', '<html data-button-permalink lang="ru"')
    .replace('<title>Каталог', '<title>' + escape(button.name))
    .replace('<p id="crumb"></p>', '<p id="crumb">' + crumb + '</p>');
  await writeFile('dist/' + file, html);
}
