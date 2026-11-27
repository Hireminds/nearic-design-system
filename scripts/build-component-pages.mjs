import { readFile, writeFile } from 'node:fs/promises';
import { chapters, navigationHTML, route } from '../catalog/navigation.js';
import { buildShowcases } from '../tooling/showcase/static-showcases.mjs';

const shell = await readFile('catalog/index.html', 'utf8');
const data = JSON.parse((await readFile('dist/data.js', 'utf8')).trim().slice('window.catalogData = '.length, -1));
const items = ['atoms', 'components'].flatMap(section => data[section].map(item => ({...item, section})));
const records = await buildShowcases({
  components: items.map(({id, component, section}) => ({
    id, component, storyFile: `packages/${section === 'atoms' ? 'ui-core' : 'ui-box'}/src/${component}/${component}.stories.tsx`,
  })),
  propsFile: 'storybook/.generated/props.json', outDir: 'dist', previewClass: 'box-example',
});
const samples = {ru: {}, en: {}};
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function pageContent(item, record, lang) {
  const { docsId, primaryId, states, liveHTML, runtimeURL } = record;
  const cards = states.map(({ id, name, htmlByLocale }) => `
    <figure data-state="${escape(name)}">
      <figcaption><button type="button" data-select-story="${escape(id)}" aria-pressed="${id === primaryId}" disabled>${escape(name)}</button>
      <a href="./storybook/?path=/story/${encodeURIComponent(id)}" aria-label="${escape(name)} в Storybook">Storybook</a></figcaption>
      <div class="story-snapshot" inert><div class="box-example">${htmlByLocale[lang]}</div></div>
    </figure>`).join('');
  const usage = item.usage.split(/\n\s*\n/).map(text => '<p>' + escape(text) + '</p>').join('');
  const parts = (item.uses || []).map(id => {
    const atom = data.atoms.find(atom => atom.id === id);
    return `<a href="${route('atoms', id, lang)}">${escape(atom.name)}</a>`;
  });
  return `<div id="box/${item.section}/${item.id}" data-component-page="${item.id}" data-section="${item.section}" data-runtime="${escape(runtimeURL)}" lang="${lang}">
    <div class="page-title"><h1>${escape(item.name)}</h1><p>${escape(item.summary)}</p><span class="proposal">Предложение</span></div>
    <div class="detail-container">
      <div class="part-heading"><h2>Живой пример</h2><a href="./storybook/?path=/docs/${encodeURIComponent(docsId)}">Свойства и TSX в Storybook</a></div>
      <div class="demo" data-family="box" data-platform="box" data-component="${item.id}">${liveHTML[lang]}</div>
      <section class="details">${parts.length ? '<h2>Из чего собран</h2><div class="quick-links">' + parts.join('') + '</div>' : ''}<h2>Применение</h2>${usage}<h2>Состояния и варианты</h2></section>
      <div class="state-grid" data-family="box" data-platform="box">${cards}</div>
    </div></div>`;
}

for (const record of records) {
  const item = items.find(item => item.id === record.id);
  const {ru, en} = record.states.find(state => state.id === record.primaryId).htmlByLocale;
  samples.ru[item.id] = ru;
  if (ru !== en) samples.en[item.id] = en;
  for (const lang of ['ru', 'en']) {
    const current = {section: item.section, entry: item.id};
    const crumb = `<a href="${route('', '', lang)}">Каталог</a><span class="crumb-sep">/</span><a href="${route(item.section, '', lang)}">${chapters[item.section]}</a><span class="crumb-sep">/</span><b>${escape(item.name)}</b>`;
    const content = pageContent(item, record, lang);
    let html = shell.replace('</head>', '<link rel="stylesheet" href="' + escape(record.styleURL) + '">\n</head>')
      .replace('<div id="page"></div>', () => '<div id="page">' + content + '</div>')
      .replace('aria-label="Оглавление"></nav>', () => 'aria-label="Оглавление">' + navigationHTML(data, current, '', lang) + '</nav>')
      .replace('href="#box"', 'href="' + route('', '', lang) + '"');
    // Keep the original script-free Button bookmark. All other detail pages have their own HTML file.
    if (item.id === 'button' && lang === 'ru') await writeFile('dist/index.html', html);
    html = html.replace('<html lang="ru"', '<html data-permalink lang="ru"')
      .replace('<title>Каталог', () => '<title>' + escape(item.name))
      .replace('<p id="crumb"></p>', () => '<p id="crumb">' + crumb + '</p>');
    await writeFile('dist/' + route(item.section, item.id, lang).slice(2), html);
  }
}
await writeFile('dist/samples.js', 'export default ' + JSON.stringify(samples) + ';\n');
