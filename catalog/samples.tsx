import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Variants } from './variants';
import {
  Button, DecisionActions, Icon, IconButton, Link, NetworkRow, Progress, Row,
  Slider, Stack, StatusIndicator, Switch, Text, VolumeControl, iconNames,
  type IconName, type Tone
} from '@nearic/ui-box';

const iconLabels: Record<IconName,string> = {
  wifi:'Wi-Fi', volume:'Звук', minus:'Убавить', plus:'Прибавить', message:'Разговор', back:'Назад',
  settings:'Настройки', warning:'Внимание', check:'Готово', close:'Закрыть', bell:'Уведомления',
  info:'Справка', box:'Экран', device:'Устройство BOX', next:'Далее', wave:'Пульс'
};
const iconTones: Partial<Record<IconName,Tone>> = {
  wifi:'network', volume:'sound', warning:'warning', check:'success', close:'error', info:'info'
};

function Tools({children}: {children: React.ReactNode}) {
  return <div className="demo-tools">{children}</div>;
}
function Choice({label, active, onClick, ...props}: {label:string; active:boolean; onClick:()=>void} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} type="button" aria-pressed={active} onClick={onClick}>{label}</button>;
}
function Connectivity({value, onChange}: {value:boolean; onChange:(online:boolean)=>void}) {
  return <Tools><span>Состояние</span><div className="choice">
    <Choice active={value} label="На связи" data-network="online" onClick={()=>onChange(true)}/>
    <Choice active={!value} label="Вне сети" data-network="offline" onClick={()=>onChange(false)}/>
  </div></Tools>;
}

function ResponseSample() {
  const [result,setResult]=React.useState('');
  const resetRef=React.useRef<HTMLButtonElement>(null);
  const controlsRef=React.useRef<HTMLDivElement>(null);
  const moveFocus=React.useRef(false);
  React.useLayoutEffect(()=>{
    if (!moveFocus.current) return;
    if (result) resetRef.current?.focus({preventScroll:true});
    else controlsRef.current?.querySelector<HTMLButtonElement>('button[data-answer]')?.focus({preventScroll:true});
    moveFocus.current=false;
  },[result]);
  const choose=(choice:'primary'|'secondary')=>{
    moveFocus.current=true;
    setResult(choice==='secondary'?'Отложено':'Запущено');
  };
  return <><div className="nr-sample-area" ref={controlsRef}>
    <Stack className="nr-sample-decision">
      <Text variant="title">Запустить тесты?</Text>
      <DecisionActions onDecision={choose} disabled={!!result}/>
    </Stack>
  </div><Tools><output data-feedback aria-live="polite">{result || 'Ожидается ответ'}</output>
    <button className="small-text" data-reset type="button" ref={resetRef} disabled={!result}
      onClick={()=>{moveFocus.current=true;setResult('')}}>Сбросить</button>
  </Tools></>;
}

function PatternSample({id}:{id:string}) {
  const [online,setOnline]=React.useState(true);
  const [volume,setVolume]=React.useState(60);
  if (id==='box-network') return <><div className="nr-sample-area"><NetworkRow value="Домашняя" online={online}/></div>
    <Connectivity value={online} onChange={setOnline}/></>;
  if (id==='box-actions') return <ResponseSample/>;
  if (id==='box-volume') return <><div className="nr-sample-area"><VolumeControl value={volume} onChange={setVolume}/></div>
    <Tools><span>Шаг</span><span>10%</span></Tools></>;
  return null;
}

function AtomSample({id}:{id:string}) {
  const [checked,setChecked]=React.useState(true);
  const [level,setLevel]=React.useState(60);
  const [disabled,setDisabled]=React.useState(false);
  const [indeterminate,setIndeterminate]=React.useState(false);
  const [answer,setAnswer]=React.useState('');
  let content: React.ReactNode;
  switch (id) {
    case 'icon':
      content=<div className="nr-symbols">{iconNames.map(name=><div key={name}>
        <Icon name={name} tone={iconTones[name]} size="large"/><Text variant="label">{iconLabels[name]}</Text>
      </div>)}</div>; break;
    case 'text':
      content=<Stack><Text variant="title">Заголовок</Text><Text>Основной текст</Text><Text variant="label" muted>Подпись</Text></Stack>; break;
    case 'button':
      content=<Stack><Row>{(['primary','secondary','quiet','destructive'] as const).map((v,i)=>{
        const label=['Разрешить','Позже','Отмена','Удалить'][i];
        return <Button key={v} variant={v} onClick={()=>setAnswer(label)}>{label}</Button>;
      })}<Button disabled>Недоступно</Button></Row><output aria-live="polite">{answer && 'Выбрано: '+answer}</output></Stack>; break;
    case 'icon-button':
      content=<Row><IconButton name="minus" label="Убавить" disabled={level===0} onClick={()=>setLevel(level-10)}/>
        <output aria-live="polite">{level}%</output><IconButton name="plus" label="Прибавить" disabled={level===100} onClick={()=>setLevel(level+10)}/>
        <IconButton name="settings" label="Настройки недоступны" disabled/></Row>; break;
    case 'switch':
      content=<Stack><label className="nr-sample-line"><Switch label="Уведомления" checked={checked} onChange={e=>setChecked(e.target.checked)}/>
        <Text>{checked?'Включено':'Выключено'}</Text></label>
        <label className="nr-sample-line"><Switch label="Уведомления недоступны" disabled/><Text variant="label" muted>Недоступно</Text></label></Stack>; break;
    case 'slider':
      content=<Stack><Text variant="label">Уровень</Text><Slider label="Уровень" min={0} max={100} step={10} value={level} disabled={disabled} onChange={e=>setLevel(Number(e.target.value))}/>
        <Row><output>{level}%</output><Button variant="quiet" onClick={()=>setDisabled(!disabled)}>{disabled?'Включить':'Заблокировать'}</Button></Row></Stack>; break;
    case 'progress':
      content=<Stack><Progress label="Готовность" value={indeterminate?undefined:level}/><Row>
        <IconButton name="minus" label="Уменьшить процент" disabled={indeterminate||level===0} onClick={()=>setLevel(level-10)}/>
        <output aria-live="polite">{indeterminate?'Загрузка':level+'%'}</output><IconButton name="plus" label="Увеличить процент" disabled={indeterminate||level===100} onClick={()=>setLevel(level+10)}/>
      </Row><Button variant="quiet" onClick={()=>setIndeterminate(!indeterminate)}>{indeterminate?'Показать процент':'Без известного объёма'}</Button></Stack>; break;
    case 'status-indicator':
      content=<Stack><StatusIndicator tone="success">На связи</StatusIndicator><StatusIndicator>Вне сети</StatusIndicator>
        <StatusIndicator tone="warning">Нужен ответ</StatusIndicator><StatusIndicator tone="error">Ошибка</StatusIndicator></Stack>; break;
    case 'link':
      content=<Link href="#box/foundations">Открыть основы</Link>; break;
    case 'row':
      content=<Row><Icon name="wifi" tone="network"/><Text>Wi-Fi</Text><StatusIndicator tone="success">На связи</StatusIndicator></Row>; break;
    case 'stack':
      content=<Stack><Text variant="heading">Громкость</Text><Progress label="Громкость" value={60}/><Text variant="label" muted>60%</Text></Stack>; break;
    default: return null;
  }
  return <div className="nr-sample-area nr-atom-area">{content}</div>;
}

const mounted=new WeakMap<HTMLElement,{root:Root; owner:symbol}>();
/** Mount the catalog samples inside a freshly rendered catalog pane. Dispose before replacing it. */
export function mountSamples(container: HTMLElement): () => void {
  const selector='[data-atom-demo], [data-pattern-demo], [data-state-demo]';
  const elements=Array.from(container.querySelectorAll<HTMLElement>(selector));
  if (container.matches(selector)) elements.unshift(container);
  const owner=Symbol();
  flushSync(()=>{
    for (const element of elements) {
      const root=mounted.get(element)?.root ?? createRoot(element);
      mounted.set(element,{root,owner});
      const {atomDemo, patternDemo, stateDemo} = element.dataset;
      if (atomDemo) root.render(<AtomSample id={atomDemo}/>);
      if (patternDemo) root.render(<PatternSample id={patternDemo}/>);
      if (stateDemo) root.render(<Variants id={stateDemo}/>);
    }
  });
  return ()=>{
    for (const element of elements) {
      const entry=mounted.get(element);
      if (entry?.owner===owner) {entry.root.unmount();mounted.delete(element)}
    }
  };
}
