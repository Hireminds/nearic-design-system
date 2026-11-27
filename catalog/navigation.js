export const chapters = {atoms:'Атомы', builder:'Конструктор', components:'Составные блоки', foundations:'Основы'};
export const groups = {
  colors:'Цвета', type:'Типографика', space:'Отступы', radius:'Скругления',
  size:'Размеры и касание', motion:'Движение', opacity:'Прозрачность'
};
export function route(section = '', entry = '', lang = 'ru') {
  if (entry && (section === 'atoms' || section === 'components'))
    return './' + encodeURIComponent(entry) + (lang === 'en' ? '.en' : '') + '.html';
  return './' + (lang === 'en' ? '?lang=en' : '') + '#' + ['box', section, entry].filter(Boolean).join('/');
}
const icons = {
  overview:'<rect x="3" y="3" width="7" height="7" rx="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.7"/>'
};
function icon(id) {return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+icons[id]+'</svg>';}
export function navigationHTML({tokens, atoms, components}, current, search = '', lang = 'ru') {
  const sectionItems = section => section === 'atoms' ? atoms : components;
  function navLink(section, entry, label) {
    const selected = current.section === section && current.entry === entry;
    return '<a href="'+route(section,entry,lang)+'" '+(selected?'aria-current="page"':'')+'>'+label+'</a>';
  }
  const query = search.trim().toLocaleLowerCase('ru');
  const match = (...fields) => fields.join(' ').toLocaleLowerCase('ru').includes(query);
  const nav = [];
  if (!query) nav.push('<div class="nav-overview">'+navLink('','',icon('overview')+'Обзор')+'</div>');
  for (const section of Object.keys(chapters)) {
    let entries = [];
    if (section === 'builder') {
      if (!match('конструктор собрать сборка builder')) continue;
    } else if (section === 'foundations') {
      entries = Object.keys(tokens.box).filter(id => match('основы токены',id,groups[id])).map(id => navLink(section,id,groups[id]));
    } else {
      entries = sectionItems(section).filter(item => match(chapters[section], item.name,item.group,item.id)).map(item => navLink(section,item.id,item.name));
    }
    if (entries.length || section === 'builder') {
      nav.push('<div class="nav-chapter">'+navLink(section,'',chapters[section])+'</div>');
      if (entries.length) nav.push('<div class="nav-entries">'+entries.join('')+'</div>');
    }
  }
  return nav.join('') || '<p class="not-found" role="status">Совпадений нет. Попробуйте другое название.</p>';
}
