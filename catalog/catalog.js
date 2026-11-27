import { chapters, groups, navigationHTML, route as catalogRoute } from './navigation.js';

const {tokens, atoms, components} = window.catalogData;
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
const initialPage = page.querySelector('[data-component-page]');
const permalink = document.documentElement.hasAttribute('data-permalink');
const lang = (new URLSearchParams(location.search).get('lang') || initialPage?.lang) === 'en' ? 'en' : 'ru';
const route = (section, entry) => catalogRoute(section, entry, lang);

function readRoute() {
  const [prefix, sectionKey = '', entryKey = ''] = location.hash.slice(1).split('/');
  if (prefix !== 'box') {
    return permalink ? { section: initialPage.dataset.section, entry: initialPage.dataset.componentPage } : { section: '', entry: '' };
  }
  const section = Object.hasOwn(chapters,sectionKey) ? sectionKey : '';
  let entry = '';
  if (section === 'atoms' || section === 'components') {
    entry = sectionItems(section).find(item => item.id === entryKey)?.id || '';
  } else if (section === 'foundations' && Object.hasOwn(tokens.box, entryKey)) {
    entry = entryKey;
  }
  return {section, entry};
}
function safeText(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
function renderNav() {
  navigation.innerHTML = navigationHTML(window.catalogData, current, search.value, lang);
}
function pageTitle(title, description, badge = '') {
  return '<div class="page-title"><h1>'+title+'</h1>'+(description?'<p>'+description+'</p>':'')+badge+'</div>';
}
function partHeading(title, url, label) {
  return '<div class="part-heading"><h2>'+title+'</h2>'+(url?'<a href="'+url+'">'+label+'</a>':'')+'</div>';
}
function sample(item) {
  return '<div class="demo story-snapshot" data-family="box" data-platform="box" inert><div class="box-example" data-tile-sample="'+item.id+'"></div></div>';
}
function fillSamples() {
  const samples = page.querySelectorAll('[data-tile-sample]');
  if (!samples.length) return;
  import('./samples.js').then(({ default: previews }) => {
    for (const node of samples) if (node.isConnected) {
      const id = node.dataset.tileSample;
      node.innerHTML = previews[lang][id] ?? previews.ru[id];
    }
  }).catch(error => console.error('Catalog samples could not be loaded', error));
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
function openComponentPage(componentPage) {
  componentPage.setAttribute('data-active-page', '');
  const host = componentPage.querySelector('[data-nearic-live]');
  let canceled = false;
  let unmount;
  const chooseState = event => {
    const control = event.target.closest('[data-select-story]');
    if (!control) return;
    host.dispatchEvent(new CustomEvent('nearic:select-story', { detail: control.dataset.selectStory }));
    for (const button of page.querySelectorAll('[data-select-story]'))
      button.setAttribute('aria-pressed', String(button === control));
  };
  const enableSelections = () => {
    for (const button of page.querySelectorAll('[data-select-story]')) button.disabled = false;
  };
  page.addEventListener('nearic:live-ready', enableSelections);
  page.addEventListener('click', chooseState);
  import(componentPage.dataset.runtime).then(({mountShowcase}) => {
    if (!canceled) unmount = mountShowcase(host);
  }).catch(error => console.error('Live controls could not initialize', error));
  return () => {
    canceled = true;
    page.removeEventListener('nearic:live-ready', enableSelections);
    page.removeEventListener('click', chooseState);
    unmount?.();
  };
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
    const target = $('#builder');
    let unmount;
    import('./runtime.js').then(({mountBuilder}) => {
      if (target.isConnected) unmount = mountBuilder(target);
    });
    cleanPage = () => unmount?.();
  }else if(item){
    if (!initialPage?.isConnected || initialPage.dataset.componentPage !== entry || initialPage.lang !== lang) {
      // A legacy fragment can only reach the server as an index request.
      // Replace that history slot with the component's generated document.
      location.replace(route(section, entry));
      return;
    }
    cleanPage = openComponentPage(initialPage);
  }else{
    if(section==='foundations')page.innerHTML=foundationPage();
    else if(section)page.innerHTML=itemIndex(section);
    else page.innerHTML=overview();
    fillSamples();
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
window.addEventListener('hashchange', () => {
  const next = readRoute();
  if (current.section === next.section && current.entry === next.entry) return;
  render();
  window.scrollTo(0, 0);
});
render();
