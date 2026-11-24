import {mountSamples, mountBuilder} from './runtime.js';

const {tokens, atoms, components} = window.catalogData;
const platforms = {desktop:'Компьютер', mobile:'Телефон', box:'BOX'};
const chapters = {atoms:'Атомы', builder:'Конструктор', components:'Составные блоки', foundations:'Основы'};
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
const origins = {'pulse-box':'Прототип BOX', 'pulse-web':'Макет кабинета', proposal:'Предложение'};
const colorRoles = {system:'Системные функции', action:'Действия', feedback:'Состояния', neutral:'Поверхности и текст'};
const sectionItems = (section, family) => section === 'atoms'
  ? atoms.filter(item => item.families.includes(family))
  : components.filter(item => item.family === family);
const $ = selector => document.querySelector(selector);
const menuButton = $('#menu-toggle'), sidebar = $('#sidebar'), search = $('#search');
const navigation = $('#navigation'), page = $('#page'), platformNav = $('#profiles'), crumb = $('#crumb');
const mobileMenu = matchMedia('(max-width: 800px)');
let current;
let cleanPage;

function readRoute() {
  const [wanted, sectionKey = '', entryKey = ''] = location.hash.slice(1).split('/');
  const platform = Object.hasOwn(platforms,wanted) ? wanted : wanted === 'device' ? 'box' : mobileMenu.matches ? 'mobile' : 'desktop';
  const family = platform === 'box' ? 'box' : 'web';
  const section = Object.hasOwn(chapters,sectionKey) ? sectionKey : '';
  let entry = '';
  if (section === 'atoms' || section === 'components') {
    entry = sectionItems(section, family).find(item => item.id === entryKey)?.id || '';
  } else if (section === 'foundations' && Object.hasOwn(tokens[family], entryKey)) {
    entry = entryKey;
  }
  return {platform, family, section, entry};
}
function route(section = '', entry = '', platform = current.platform) {
  return '#' + [platform, section, entry].filter(Boolean).join('/');
}
function safeText(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
const icons = {
  desktop:'<rect x="2" y="3.5" width="20" height="14" rx="2.4"/><path d="M8 21h8m-4-3.5V21"/>',
  mobile:'<rect x="6" y="2" width="12" height="20" rx="2.7"/><path d="M11 18.4h2"/>',
  box:'<rect x="2.5" y="4" width="19" height="13.5" rx="2.8"/><path d="m6 18-2 3h16l-2-3"/>',
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
      entries = Object.keys(tokens[current.family]).filter(id => match('основы токены',id,groups[id])).map(id => navLink(section,id,groups[id]));
    } else {
      entries = sectionItems(section,current.family).filter(item => match(chapters[section], item.name,item.group,item.id)).map(item => navLink(section,item.id,item.name));
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
function sample(item, section) {
  const isAtom = section === 'atoms';
  return '<div class="demo '+(current.family==='box'?'device-demo':'')+'" data-family="'+current.family+'" data-component="'+item.id+'">'+
    (isAtom?'<div data-atom-demo="'+item.id+'"></div>':item.example)+'</div>';
}
function detailUrl(item, section) {return route(section,item.id);}
function itemTile(item, section) {
  const url = detailUrl(item,section);
  return '<article class="component-tile"><div class="tile-heading"><div><p class="category">'+item.group+'</p><h3><a class="tile-title" href="'+url+'">'+item.name+'</a></h3></div></div>'+
    sample(item,section)+'<div class="tile-foot"><p>'+item.summary+'</p><a href="'+url+'" aria-label="Подробнее: '+item.name+'">Подробнее</a></div></article>';
}
function overview() {
  const items = sectionItems('atoms',current.family);
  const featured = ['icon','button','slider'].map(id => items.find(item=>item.id===id)).filter(Boolean);
  const extras = items.filter(item=>!featured.includes(item));
  return pageTitle('Каталог «Пульс»','Атомы и составные блоки для '+(current.family==='box'?'сенсорного экрана BOX.':'кабинета Nearic.'))+
    partHeading('Атомы',route('atoms'),'Все атомы')+'<div class="tiles">'+featured.map(item=>itemTile(item,'atoms')).join('')+'</div>'+
    '<div class="quick-links">'+extras.map(item=>'<a href="'+route('atoms',item.id)+'">'+item.name+'</a>').join('')+'</div>'+
    '<a class="builder-link" href="'+route('builder')+'"><strong>Конструктор</strong><span>Собрать свой вариант и получить код</span></a>'+
    partHeading('Составные блоки',route('components'),'Все блоки')+'<div class="pattern-index">'+sectionItems('components',current.family).map(item=>'<a href="'+detailUrl(item,'components')+'"><strong>'+item.name+'</strong><span>'+item.summary+'</span></a>').join('')+'</div>'+
    '<section class="foundations-overview">'+partHeading('Основы',route('foundations'),'Все токены')+'<div class="quick-links">'+Object.keys(tokens[current.family]).map(key=>'<a href="'+route('foundations',key)+'">'+groups[key]+'</a>').join('')+'</div></section>';
}
function itemPage(item, section) {
  let code = '';
  if (item.code) code = '<h2>Код</h2><pre class="code"><code>'+safeText(item.code)+'</code></pre>';
  const parts = (item.uses || []).map(id => {
    const atom = atoms.find(a => a.id === id);
    return '<a href="'+route('atoms',id)+'">'+atom.name+'</a>';
  });
  return pageTitle(item.name,item.summary,'<span class="proposal">Предложение</span>')+
    '<div class="detail-container">'+partHeading('Живой пример')+sample(item,section)+'<section class="details">'+
    (parts.length?'<h2>Из чего собран</h2><div class="quick-links">'+parts.join('')+'</div>':'')+
    '<h2>Применение</h2><p>'+item.usage+'</p><h2>Состояния и варианты</h2><ul>'+item.states.map(state=>'<li>'+state+'</li>').join('')+'</ul>'+code+'</section></div>';
}
function itemIndex(section) {
  const items = sectionItems(section,current.family);
  const intro = section==='atoms'?'Самостоятельные элементы с открытым API.':'Комбинации атомов для повторяющихся задач.';
  const names = [...new Set(items.map(item=>item.group))];
  return pageTitle(chapters[section],intro,'<span class="proposal">Предложение</span>')+names.map(group=>'<section class="group-index">'+partHeading(group)+
    '<div class="tiles">'+items.filter(item=>item.group===group).map(item=>itemTile(item,section)).join('')+'</div></section>').join('');
}
function tokenRow(key,t) {
  const symbol='--'+key+'-'+t.key;
  const val=t.platforms?.[current.platform]||t.value;
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
  const rows=tokens[current.family][key];
  if(key!=='colors')return '<div class="token-list">'+rows.map(t=>tokenRow(key,t)).join('')+'</div>';
  return Object.entries(colorRoles).map(([role,title])=>{
    const matches=rows.filter(t=>(t.role||'neutral')===role);
    return matches.length?'<section class="color-group"><h3>'+title+'</h3><div class="token-list">'+matches.map(t=>tokenRow(key,t)).join('')+'</div></section>':'';
  }).join('');
}
function foundationPage() {
  if(current.entry)return pageTitle(groups[current.entry], groupUse[current.entry])+foundationTable(current.entry);
  return pageTitle('Основы','Визуальные роли и значения для выбранной платформы.')+
    '<div class="foundation-nav">'+Object.keys(tokens[current.family]).map(key=>'<a href="'+route('foundations',key)+'"><strong>'+groups[key]+'</strong><span>'+groupUse[key]+'</span></a>').join('')+'</div>';
}
function menu(open) {
  menuButton.setAttribute('aria-expanded',String(open));
  sidebar.classList.toggle('open',open);
}
function render() {
  if (typeof cleanPage === 'function') cleanPage();
  cleanPage = undefined;
  current=readRoute();
  const {platform, family, section, entry}=current;
  document.documentElement.dataset.family=family;
  document.documentElement.dataset.platform=platform;
  const item = (section==='atoms'||section==='components') && sectionItems(section,family).find(x=>x.id===entry);
  const name = item?.name || groups[entry] || chapters[section] || 'Каталог';
  document.title=name+' · Nearic Design System';
  crumb.innerHTML = '<a href="'+route()+'">Каталог</a>'+(section?'<span class="crumb-sep">/</span>'+
    (entry?'<a href="'+route(section)+'">'+chapters[section]+'</a><span class="crumb-sep">/</span>':'')+'<b>'+name+'</b>':'');
  platformNav.innerHTML=Object.entries(platforms).map(([id,label])=>{
    const preserve=section!=='components' || (id==='box')===(family==='box');
    return '<a href="'+route(section,preserve?entry:'',id)+'" aria-current="'+(id===platform)+'">'+icon(id)+label+'</a>';
  }).join('');
  if(section==='builder'){
    page.innerHTML=pageTitle('Конструктор','Соберите строку настройки из базовых элементов.')+'<div id="builder"></div>';
    cleanPage = mountBuilder($('#builder'),platform);
  }else{
    if(section==='foundations')page.innerHTML=foundationPage();
    else if(item)page.innerHTML=itemPage(item,section);
    else if(section)page.innerHTML=itemIndex(section);
    else page.innerHTML=overview();
    cleanPage = mountSamples(page);
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
