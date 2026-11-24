const {tokens, components} = window.catalogData;
const platforms = {desktop:'Компьютер',mobile:'Телефон',box:'BOX'};
const groups = {colors:'Цвета',type:'Типографика',space:'Отступы',radius:'Скругления'};
const groupUse = {
 colors:'Роли цветов для фона, текста, поверхностей и действий.',
 type:'Размеры текста для заголовков, подписей и элементов управления.',
 space:'Расстояния внутри элементов и между соседними действиями.',
 radius:'Форма поверхности и отдельного элемента управления.'
};
const groupOrder = ['Устройства','Действия','Настройки','Состояния'];
const $ = selector => document.querySelector(selector);
const el = {menu:$('#menu-toggle'),sidebar:$('#sidebar'),search:$('#search'),nav:$('#navigation'),page:$('#page'),profiles:$('#profiles'),crumb:$('#crumb')};
let current = {platform:'desktop',section:'',entry:''};
const mobileMenu = matchMedia('(max-width: 800px)');
function readRoute() {
  const [wanted,section='',entry=''] = location.hash.slice(1).split('/');
  const platform = Object.hasOwn(platforms,wanted) ? wanted : (wanted==='device' ? 'box' : mobileMenu.matches ? 'mobile' : 'desktop');
  const family = platform==='box' ? 'box' : 'web';
  const items = components.filter(c=>c.family===family).sort((a,b)=>groupOrder.indexOf(a.group)-groupOrder.indexOf(b.group));
  const validSection = ['components','foundations'].includes(section) ? section : '';
  const validEntry = section==='components' && items.some(c=>c.id===entry) || section==='foundations' && Object.hasOwn(groups,entry);
  return {platform,section:validSection,entry:validEntry ? entry : '',family,items};
}
function route(section='',entry='',platform=current.platform) {
  return '#'+[platform,section,entry].filter(Boolean).join('/');
}
const icons = {
 desktop:'<rect x="2" y="3.5" width="20" height="14" rx="2.4"/><path d="M8 21h8m-4-3.5V21"/>',
 mobile:'<rect x="6" y="2" width="12" height="20" rx="2.7"/><path d="M11 18.4h2"/>',
 box:'<rect x="2.5" y="4" width="19" height="13.5" rx="2.8"/><path d="m6 18-2 3h16l-2-3"/>',
 overview:'<rect x="3" y="3" width="7" height="7" rx="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.7"/>'
};
function icon(id) {return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg>`}
function navLink(section,entry,label) {
  const active = current.section===section && current.entry===entry;
  return `<a href="${route(section,entry)}" ${active?'aria-current="page"':''}>${label}</a>`;
}
function renderNav() {
  const query=el.search.value.trim().toLocaleLowerCase('ru');
  const match = (...parts)=>parts.join(' ').toLocaleLowerCase('ru').includes(query);
  let found=0;
  let html = !query?`<div class="nav-overview">${navLink('','',icon('overview')+'Обзор')}</div>`:'';
  const groupLinks = Object.entries(groups).filter(([key,title])=>match(key,title,'Токены Основы')).map(([key,title])=>navLink('foundations',key,title));
  if(groupLinks.length){found+=groupLinks.length;html+=`<div class="nav-chapter">${navLink('foundations','','Основы')}</div><div class="nav-entries">${groupLinks.join('')}</div>`}
  const items=current.items.filter(c=>match(c.id,c.name,c.group));
  if(items.length){
    found+=items.length;
    html+=`<div class="nav-chapter">${navLink('components','','Компоненты')}</div>`;
    for(const group of groupOrder){
      const rows=items.filter(c=>c.group===group);
      if(rows.length)html+=`<div class="nav-group-title">${group}</div><div class="nav-entries">${rows.map(c=>navLink('components',c.id,c.name)).join('')}</div>`;
    }
  }
  el.nav.innerHTML=found?html:'<p class="not-found" role="status">Совпадений нет. Попробуйте другое название.</p>';
}
function paneTitle(title,copy='',meta=''){
  return `<div class="page-title"><h1>${title}</h1>${copy?`<p>${copy}</p>`:''}${meta}</div>`;
}
function sample(c) {
  return `<div class="demo ${c.family==='box'?'device-demo':''}" data-component="${c.id}" data-family="${c.family}">${c.example}</div>`;
}
function componentTile(c) {
  return `<article class="component-tile"><div class="tile-heading"><div><p class="category">${c.group}</p><h3><a class="tile-title" href="${route('components',c.id)}">${c.name}</a></h3></div><span class="proposal">Предложение</span></div>${sample(c)}<div class="tile-foot"><p>${c.summary}</p><a href="${route('components',c.id)}" aria-label="Подробнее о компоненте ${c.name}">Подробнее</a></div></article>`;
}
function partHeading(title,url,label) {return `<div class="part-heading"><h2>${title}</h2>${url?`<a href="${url}">${label}</a>`:''}</div>`}
function miniGroup(key) {
  const list=tokens[current.family][key];
  if(key==='colors')return `<div class="mini-palette">${['accent','text','muted','surface','canvas'].map(k=>`<i style="background:var(--colors-${k})"></i>`).join('')}</div>`;
  if(key==='type')return `<div class="mini-type">Аа<span>Бб</span><small>Вв</small></div>`;
  if(key==='space')return `<div class="mini-space">${list.map(t=>`<i style="height:${t.value}"></i>`).join('')}</div>`;
  return `<div class="mini-radius">${list.map(t=>`<i style="border-top-left-radius:${t.value}"></i>`).join('')}</div>`;
}
function foundationTile(key){return `<a class="foundation-tile" href="${route('foundations',key)}">${miniGroup(key)}<strong>${groups[key]}</strong></a>`}
function overview() {
  const copy=current.family==='box'?'Сенсорные компоненты и токены «Пульса» для экрана BOX 320 × 240.':'Компоненты и токены «Пульса» для личного кабинета Nearic.';
  return paneTitle('Каталог',copy)+partHeading('Компоненты',route('components'),'Все компоненты')+
    `<div class="tiles">${current.items.map(componentTile).join('')}</div>`+
    `<section class="foundations-overview">${partHeading('Основы',route('foundations'),'Все токены')}<div class="foundation-grid">${Object.keys(groups).map(foundationTile).join('')}</div></section>`;
}
function componentPage(c) {
  return paneTitle(c.name,c.summary,'<span class="proposal">Предложение</span>')+
    '<div class="detail-container">'+partHeading('Живой пример')+sample(c)+
    `<section class="details"><h2>Применение</h2><p>${c.usage}</p><h2>Состояния и варианты</h2><ul>${c.states.map(s=>`<li>${s}</li>`).join('')}</ul></section></div>`;
}
function componentIndex() {
  return paneTitle('Компоненты','Живые образцы, варианты и правила применения.')+groupOrder.map(group=>{
    const items=current.items.filter(c=>c.group===group);
    if(!items.length)return '';
    return `<section class="group-index">${partHeading(group)}<div class="tiles">${items.map(componentTile).join('')}</div></section>`;
  }).join('');
}
function foundationTable(key) {
  const list=tokens[current.family][key];
  return `<div class="token-list">${list.map(t=>{
    const symbol='--'+key+'-'+t.key;
    const effectiveValue=t.platforms?.[current.platform]||t.value;
    let sample='';
    if(key==='colors')sample=`<i class="color-sample" style="background:var(${symbol})"></i>`;
    if(key==='type')sample=`<span class="type-sample" style="font-size:var(${symbol})">Аа</span>`;
    if(key==='space')sample=`<i class="space-sample" style="width:var(${symbol})"></i>`;
    if(key==='radius')sample=`<i class="radius-sample" style="border-top-left-radius:var(${symbol})"></i>`;
    return `<div class="token-row"><span class="token-demo">${sample}</span><div class="token-name"><strong>${t.label}</strong><code>${symbol}</code></div><code class="token-value">${key==='colors'?effectiveValue.toUpperCase():effectiveValue}</code><p>${t.usage}</p></div>`;
  }).join('')}</div>`;
}
function foundationPage() {
  if(current.entry)return paneTitle(groups[current.entry],groupUse[current.entry])+foundationTable(current.entry);
  return paneTitle('Основы','Визуальные решения и значения токенов для выбранной платформы.')+
    Object.keys(groups).map(key=>`<section class="token-block">${partHeading(groups[key],route('foundations',key),'Открыть группу')}${foundationTable(key)}</section>`).join('');
}
function menu(open) {
  el.menu.setAttribute('aria-expanded',String(open));
  el.sidebar.classList.toggle('open',open);
}
function render() {
  current=readRoute();
  document.documentElement.dataset.family=current.family;document.documentElement.dataset.platform=current.platform;
  const c=current.items.find(c=>c.id===current.entry);
  const chapter = current.section==='components' ? 'Компоненты' : 'Основы';
  const name=c?.name||groups[current.entry]||chapter;
  document.title=(current.section?name:'Каталог')+' · Nearic Design System';
  el.crumb.innerHTML = `<span>Пульс</span><span class="crumb-sep">/</span>${current.section
    ? `<a href="${route()}">Каталог</a><span class="crumb-sep">/</span>${current.entry?`<a href="${route(current.section)}">${chapter}</a><span class="crumb-sep">/</span>`:''}<b>${name}</b>`
    : '<b>Каталог</b>'}`;
  el.profiles.innerHTML=Object.entries(platforms).map(([id,label])=>{
    const nextFamily=id==='box'?'box':'web';
    const preserve=current.section!=='components'||nextFamily===current.family;
    return `<a href="${route(current.section,preserve?current.entry:'',id)}" aria-current="${id===current.platform?'true':'false'}">${icon(id)}${label}</a>`;
  }).join('');
  el.page.innerHTML=!current.section?overview():current.section==='foundations'?foundationPage():c?componentPage(c):componentIndex();
  renderNav();menu(false);
}
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();document.querySelector('main').focus()});
el.menu.onclick=()=>{const open=!el.sidebar.classList.contains('open');menu(open);if(open)el.search.focus()};
el.search.oninput=renderNav;
el.nav.addEventListener('click',e=>{if(e.target.closest('a'))menu(false)});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();if(mobileMenu.matches)menu(true);el.search.focus()}
  if(e.key==='Escape'){menu(false);el.search.value='';renderNav();if(mobileMenu.matches)el.menu.focus();else el.search.blur()}
});
function pick(el){el.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));}
function updateSwitch(example) {
 const input=example.querySelector('input[role=switch]');
 example.querySelector('[data-field=switch-status]').textContent=input.disabled?'BOX вне сети':input.checked?'Включены на BOX':'Выключены на BOX';
}
el.page.addEventListener('change',e=>{if(e.target.matches('input[role=switch]'))updateSwitch(e.target.closest('.demo'))});
el.page.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const demo=b.closest('.demo');if(!demo)return;
  if(b.hasAttribute('data-network')){
    const online=b.dataset.network==='online';pick(b);
    const sample=demo.querySelector('.device-card');
    if(sample)sample.dataset.network=b.dataset.network;
    const network=demo.querySelector('.network-row');if(network)network.dataset.network=b.dataset.network;
    demo.querySelector('[data-field=connection]').textContent=online?(sample?'На связи':'Домашняя'):'Вне сети';
  }else if(b.hasAttribute('data-switch-available')){
    pick(b);demo.querySelector('input').disabled=b.dataset.switchAvailable!=='yes';updateSwitch(demo);
  }else if(b.hasAttribute('data-answer')||b.hasAttribute('data-reset')){
    const chosen=b.hasAttribute('data-answer');const feedback=demo.querySelector('[data-feedback]');
    feedback.textContent=chosen?b.dataset.answer:demo.dataset.family==='box'?'Ожидается ответ':'Ожидается';
    feedback.setAttribute('aria-live','polite');demo.querySelectorAll('[data-answer]').forEach(a=>a.disabled=chosen);
    const reset=demo.querySelector('[data-reset]');reset.disabled=!chosen;
    (chosen?reset:demo.querySelector('[data-answer]')).focus({preventScroll:true});
  }else if(b.hasAttribute('data-step')){
    const output=demo.querySelector('output');const vol=Math.max(0,Math.min(100,parseInt(output.textContent)+Number(b.dataset.step)));
    output.textContent=vol+'%';demo.querySelector('.volume-track i').style.width=vol+'%';
    demo.querySelector('[data-step="-10"]').disabled=vol===0;demo.querySelector('[data-step="10"]').disabled=vol===100;
  }
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
render();
