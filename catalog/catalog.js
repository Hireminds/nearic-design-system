import {mountBuilder} from './runtime.js';

const {tokens, atoms, components} = window.catalogData;
const chapters = {atoms:'Атомы', builder:'Конструктор', components:'Составные блоки', foundations:'Основы'};
const storyGroups = new Map();
let indexMessage = 'Загружаем примеры…';

async function loadStories() {
  try {
    const response = await fetch('./storybook/index.json');
    if (!response.ok) throw new Error('Missing Storybook index');
    const {entries} = await response.json();
    for (const entry of Object.values(entries)) {
      const group = storyGroups.get(entry.title) ?? {stories: []};
      if (entry.type === 'story') group.stories.push(entry);
      if (entry.type === 'docs') group.docs = entry;
      storyGroups.set(entry.title, group);
    }
    indexMessage = 'Примеры для этого компонента пока недоступны.';
  } catch {
    indexMessage = 'Не удалось загрузить примеры Storybook. Обновите страницу, чтобы повторить.';
  }
  if (['', 'atoms', 'components'].includes(current.section)) render();
}
const groups = {
  colors:'Цвета', type:'Типографика', space:'Отступы', radius:'Скругления',
  size:'Размеры и касание', motion:'Движение', opacity:'Прозрачность'
};
const groupUse = {
  colors:'Цвета действий, системных функций, состояний и поверхностей.',
  type:'Размеры текста для заголовков, значений и элементов управления.',
  space:'Расстояния между деталями и внутренние поля.',
  radius:'Геометрия поверхностей и элементов управления.',
  size:'Размеры иконок, дорожек и областей нажатия.',
  motion:'Длительность переходов и режим уменьшенного движения.',
  opacity:'Видимость неактивных и вспомогательных элементов.'
};
const origins = {'pulse-box':'Прототип BOX', proposal:'Предложение'};
const colorRoles = {system:'Системные функции', action:'Действия', feedback:'Состояния', neutral:'Поверхности и текст'};
const sectionItems = section => section === 'atoms' ? atoms : components;
const $ = selector => document.querySelector(selector);
const menuButton = $('#menu-toggle'), sidebar = $('#sidebar'), search = $('#search');
const navigation = $('#navigation'), page = $('#page'), crumb = $('#crumb');
const mobileMenu = matchMedia('(max-width: 800px)');
let current;
let cleanPage;

function readRoute() {
  const [prefix, sectionKey = '', entryKey = ''] = location.hash.slice(1).split('/');
  if (prefix !== 'box') return {section:'', entry:''};
  const section = Object.hasOwn(chapters,sectionKey) ? sectionKey : '';
  let entry = '';
  if (section === 'atoms' || section === 'components') {
    entry = sectionItems(section).find(item => item.id === entryKey)?.id || '';
  } else if (section === 'foundations' && Object.hasOwn(tokens.box, entryKey)) {
    entry = entryKey;
  }
  return {section, entry};
}
function route(section = '', entry = '') {
  return '#' + ['box', section, entry].filter(Boolean).join('/');
}
function safeText(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
const icons = {
  overview:'<rect x="3" y="3" width="7" height="7" rx="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.7"/>'
};
function icon(id) {return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+icons[id]+'</svg>';}
function navLink(section, entry, label) {
  const selected = current.section === section && current.entry === entry;
  return '<a href="'+route(section,entry)+'" '+(selected?'aria-current="page"':'')+'>'+label+'</a>';
}
function renderNav() {
  const query = search.value.trim().toLocaleLowerCase('ru');
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
  navigation.innerHTML = nav.join('') || '<p class="not-found" role="status">Совпадений нет. Попробуйте другое название.</p>';
}
function pageTitle(title, description, badge = '') {
  return '<div class="page-title"><h1>'+title+'</h1>'+(description?'<p>'+description+'</p>':'')+badge+'</div>';
}
function partHeading(title, url, label) {
  return '<div class="part-heading"><h2>'+title+'</h2>'+(url?'<a href="'+url+'">'+label+'</a>':'')+'</div>';
}
function storyFrame(item, story, controls = false) {
  if (!story) return '<p class="sample-status" role="status">'+indexMessage+'</p>';
  const query = new URLSearchParams({id: story.id, viewMode: 'story'});
  if (controls) query.set('nearicDemo', '1');
  if (new URLSearchParams(location.search).get('lang') === 'en') query.set('lang', 'en');
  const title = safeText(item.name + ' · ' + story.name);
  return '<iframe class="story-frame" title="'+title+'" loading="'+(controls ? 'eager' : 'lazy')+
    '" src="./storybook/iframe.html?'+safeText(query.toString())+'"></iframe>';
}

function sample(item, controls = false) {
  const story = storyGroups.get('BOX/'+item.component)?.stories[0];
  return '<div class="demo" data-family="box" data-component="'+item.id+'">'+storyFrame(item,story,controls)+'</div>';
}

// Storybook runs on the same origin. Measure the rendered story, which may grow
// when arguments change or controls wrap at smaller viewport widths.
function fitStories(parent) {
  const observers = new Map();
  function fit(frame) {
    observers.get(frame)?.disconnect();
    const doc = frame.contentDocument;
    const root = doc?.getElementById('storybook-root');
    if (!root) return;
    const resize = () => {
      const body = doc.defaultView.getComputedStyle(doc.body);
      const height = root.offsetTop + root.offsetHeight + parseFloat(body.paddingBottom);
      if (height > 0) frame.style.height = Math.ceil(height) + 'px';
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    observers.set(frame, observer);
    resize();
  }
  const onLoad = event => { if (event.target.matches?.('.story-frame')) fit(event.target); };
  parent.addEventListener('load', onLoad, true);
  parent.querySelectorAll('.story-frame').forEach(fit);
  return () => {
    parent.removeEventListener('load', onLoad, true);
    for (const observer of observers.values()) observer.disconnect();
  };
}
function detailUrl(item, section) {return route(section,item.id);}
function itemTile(item, section) {
  const url = detailUrl(item,section);
  return '<article class="component-tile"><div class="tile-heading"><div><p class="category">'+item.group+'</p><h3><a class="tile-title" href="'+url+'">'+item.name+'</a></h3></div></div>'+
    sample(item)+'<div class="tile-foot"><p>'+item.summary+'</p><a href="'+url+'" aria-label="Подробнее: '+item.name+'">Подробнее</a></div></article>';
}
function overview() {
  const items = atoms;
  const featured = ['icon','button','slider'].map(id => items.find(item=>item.id===id)).filter(Boolean);
  const extras = items.filter(item=>!featured.includes(item));
  return pageTitle('Каталог BOX','Атомы и составные блоки «Пульса» для сенсорного экрана 320 × 240.')+
    partHeading('Атомы',route('atoms'),'Все атомы')+'<div class="tiles">'+featured.map(item=>itemTile(item,'atoms')).join('')+'</div>'+
    '<div class="quick-links">'+extras.map(item=>'<a href="'+route('atoms',item.id)+'">'+item.name+'</a>').join('')+'</div>'+
    '<a class="builder-link" href="'+route('builder')+'"><strong>Конструктор</strong><span>Собрать свой вариант и получить код</span></a>'+
    partHeading('Составные блоки',route('components'),'Все блоки')+'<div class="pattern-index">'+components.map(item=>'<a href="'+detailUrl(item,'components')+'"><strong>'+item.name+'</strong><span>'+item.summary+'</span></a>').join('')+'</div>'+
    '<section class="foundations-overview">'+partHeading('Основы',route('foundations'),'Все токены')+'<div class="quick-links">'+Object.keys(tokens.box).map(key=>'<a href="'+route('foundations',key)+'">'+groups[key]+'</a>').join('')+'</div></section>';
}
function itemPage(item) {
  const usage = item.usage.split(/\n\s*\n/).map(text => '<p>'+safeText(text)+'</p>').join('');
  const group = storyGroups.get('BOX/'+item.component);
  const storybook = group?.docs && './storybook/?path=/docs/'+encodeURIComponent(group.docs.id);
  const states = (group?.stories ?? []).map(story =>
    '<figure data-state="'+safeText(story.name)+'"><figcaption>'+safeText(story.name)+'</figcaption>'+
    storyFrame(item,story)+'</figure>'
  ).join('');
  const parts = (item.uses || []).map(id => {
    const atom = atoms.find(a => a.id === id);
    return '<a href="'+route('atoms',id)+'">'+atom.name+'</a>';
  });
  return pageTitle(item.name,item.summary,'<span class="proposal">Предложение</span>')+
    '<div class="detail-container">'+partHeading('Живой пример',storybook,'Свойства и TSX в Storybook')+sample(item,true)+'<section class="details">'+
    (parts.length?'<h2>Из чего собран</h2><div class="quick-links">'+parts.join('')+'</div>':'')+
    '<h2>Применение</h2>'+usage+'<h2>Состояния и варианты</h2></section>'+
    '<div class="state-grid">'+states+'</div></div>';
}
function itemIndex(section) {
  const items = sectionItems(section);
  const intro = section==='atoms'?'Самостоятельные элементы с открытым API.':'Комбинации атомов для повторяющихся задач.';
  const names = [...new Set(items.map(item=>item.group))];
  return pageTitle(chapters[section],intro,'<span class="proposal">Предложение</span>')+names.map(group=>'<section class="group-index">'+partHeading(group)+
    '<div class="tiles">'+items.filter(item=>item.group===group).map(item=>itemTile(item,section)).join('')+'</div></section>').join('');
}
function tokenRow(key,t) {
  const symbol='--'+key+'-'+t.key;
  const val=t.value;
  const sampleByGroup = {
    colors:'<i class="color-sample" style="background:var('+symbol+')"></i>',
    type:'<span class="type-sample" style="font-size:var('+symbol+')">Аа</span>',
    space:'<i class="space-sample" style="width:var('+symbol+')"></i>',
    size:'<i class="size-sample" style="width:var('+symbol+');height:var('+symbol+')"></i>',
    radius:'<i class="radius-sample" style="border-top-left-radius:var('+symbol+')"></i>',
    motion:'<i class="motion-sample" style="transition-duration:var('+symbol+')"></i>',
    opacity:'<i class="opacity-sample" style="opacity:var('+symbol+')"></i>'
  };
  const provenance=origins[t.source];
  return '<div class="token-row"><span class="token-demo">'+(sampleByGroup[key]||'')+'</span><div class="token-name"><strong>'+t.label+'</strong><code>'+symbol+'</code></div><code class="token-value">'+
    safeText(key==='colors'?val.toUpperCase():val)+'</code><p>'+t.usage+(provenance?'<small>'+provenance+'</small>':'')+'</p></div>';
}
function foundationTable(key) {
  const rows=tokens.box[key];
  if(key!=='colors')return '<div class="token-list">'+rows.map(t=>tokenRow(key,t)).join('')+'</div>';
  return Object.entries(colorRoles).map(([role,title])=>{
    const matches=rows.filter(t=>(t.role||'neutral')===role);
    return matches.length?'<section class="color-group"><h3>'+title+'</h3><div class="token-list">'+matches.map(t=>tokenRow(key,t)).join('')+'</div></section>':'';
  }).join('');
}
function foundationPage() {
  if(current.entry)return pageTitle(groups[current.entry], groupUse[current.entry])+foundationTable(current.entry);
  return pageTitle('Основы','Визуальные роли и значения для дисплея BOX.')+
    '<div class="foundation-nav">'+Object.keys(tokens.box).map(key=>'<a href="'+route('foundations',key)+'"><strong>'+groups[key]+'</strong><span>'+groupUse[key]+'</span></a>').join('')+'</div>';
}
function menu(open) {
  menuButton.setAttribute('aria-expanded',String(open));
  sidebar.classList.toggle('open',open);
}
function render() {
  if (typeof cleanPage === 'function') cleanPage();
  cleanPage = undefined;
  current=readRoute();
  const {section, entry}=current;
  const item = (section==='atoms'||section==='components') && sectionItems(section).find(x=>x.id===entry);
  const name = item?.name || groups[entry] || chapters[section] || 'Каталог';
  document.title=name+' · Nearic BOX';
  crumb.innerHTML = '<a href="'+route()+'">Каталог</a>'+(section?'<span class="crumb-sep">/</span>'+
    (entry?'<a href="'+route(section)+'">'+chapters[section]+'</a><span class="crumb-sep">/</span>':'')+'<b>'+name+'</b>':'');
  if(section==='builder'){
    page.innerHTML=pageTitle('Конструктор','Соберите строку настройки из базовых элементов.')+'<div id="builder"></div>';
    cleanPage = mountBuilder($('#builder'));
  }else{
    if(section==='foundations')page.innerHTML=foundationPage();
    else if(item)page.innerHTML=itemPage(item);
    else if(section)page.innerHTML=itemIndex(section);
    else page.innerHTML=overview();
    cleanPage = fitStories(page);
  }
  renderNav();
  menu(false);
}
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('#content').focus();});
menuButton.onclick=()=>{const open=!sidebar.classList.contains('open');menu(open);if(open)search.focus();};
search.oninput=renderNav;
navigation.addEventListener('click',e=>{if(e.target.closest('a'))menu(false);});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();if(mobileMenu.matches)menu(true);search.focus();}
  if(e.key==='Escape'&&(sidebar.contains(document.activeElement)||sidebar.classList.contains('open'))){menu(false);search.value='';renderNav();if(mobileMenu.matches)menuButton.focus();else search.blur();}
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
render();
loadStories();
