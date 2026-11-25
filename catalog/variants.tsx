import { useRef, useState, type ReactNode } from 'react';
import {
  Button, DecisionActions, Icon, IconButton, Link, NetworkRow, Progress, Row, Slider, Stack,
  StatusIndicator, Switch, Text, VolumeControl, type ButtonVariant,
} from '@nearic/ui-box';

type Entry = {id: string; states: string[]};
type Catalog = {atoms: Entry[]; components: Entry[]};
type Variant = (label: string) => ReactNode;

function LabeledButton({label, variant, disabled = false}: {label: string; variant: ButtonVariant; disabled?: boolean}) {
  const [count, setCount] = useState(0);
  return <Button variant={variant} disabled={disabled} onClick={() => setCount(count + 1)}>
    {count ? 'Нажато · ' + count : label}
  </Button>;
}

function VolumeButton({variant, disabled = false}: {variant: ButtonVariant; disabled?: boolean}) {
  const [value, setValue] = useState(50);
  return <Row>
    <IconButton name="plus" label="Прибавить громкость" variant={variant}
      disabled={disabled || value === 100} onClick={() => setValue(value + 10)}/>
    <output aria-live="polite">{value}%</output>
  </Row>;
}

function FocusExample({kind}: {kind: 'button' | 'icon-button' | 'switch' | 'slider' | 'link'}) {
  const target = useRef<HTMLDivElement>(null);
  function focus() {
    const control = target.current?.querySelector<HTMLElement>('button, input, a');
    // Supported browsers display the native keyboard ring on an explicit preview request.
    control?.focus({focusVisible:true} as FocusOptions);
  }
  const controls = {
    button: <Button>Подтвердить</Button>,
    'icon-button': <IconButton name="settings" label="Настройки"/>,
    switch: <Switch label="Уведомления" defaultChecked/>,
    slider: <Slider label="Уровень" defaultValue={60}/>,
    link: <Link href="#box/foundations">Основы</Link>,
  };
  return <div className="focus-example">
    <button className="small-text" type="button" onClick={focus}>Показать фокус</button>
    <div ref={target}>{controls[kind]}</div>
    <small>Нажмите Tab, чтобы перемещать фокус.</small>
  </div>;
}

function LevelExample({initial, disabled = false}: {initial:number; disabled?:boolean}) {
  const [value,setValue]=useState(initial);
  return <Stack><Slider min={0} max={100} step={10} label="Уровень" value={value} disabled={disabled}
    onChange={e=>setValue(e.target.valueAsNumber)}/><output>{value}%</output></Stack>;
}

function VolumeExample({initial}: {initial:number}) {
  const [value,setValue]=useState(initial);
  return <VolumeControl value={value} onChange={setValue}/>;
}

function DecisionExample({initial}: {initial:string}) {
  const [result,setResult]=useState(initial);
  return <Stack className="nr-sample-decision">
    <DecisionActions disabled={!!result} onDecision={choice=>setResult(choice==='primary'?'Подтверждено':'Отложено')}/>
    <output aria-live="polite">{result || 'Ожидается ответ'}</output>
  </Stack>;
}

const displays: Record<string, Variant[]> = {
  icon: [
    ()=><Icon name="wifi" tone="network" size="small" label="Wi-Fi"/>,
    ()=><Icon name="wifi" tone="network" label="Wi-Fi"/>,
    ()=><Icon name="wifi" tone="network" size="large" label="Wi-Fi"/>,
    ()=><Row><Icon name="wifi" tone="network"/><Text>Wi-Fi</Text></Row>,
  ],
  text: [
    ()=><Text variant="title">Громкость</Text>, ()=><Text>Громкость</Text>,
    ()=><Text variant="label" muted>Громкость</Text>,
  ],
  button: [
    ()=><LabeledButton variant="primary" label="Подтвердить"/>,
    ()=><LabeledButton variant="secondary" label="Отложить"/>,
    ()=><LabeledButton variant="quiet" label="Закрыть"/>,
    ()=><LabeledButton variant="destructive" label="Удалить"/>,
    ()=><FocusExample kind="button"/>, ()=><LabeledButton label="Подтвердить" variant="primary" disabled/>,
  ],
  'icon-button': [
    ()=><VolumeButton variant="primary"/>, ()=><VolumeButton variant="secondary"/>,
    ()=><FocusExample kind="icon-button"/>, ()=><VolumeButton variant="secondary" disabled/>,
  ],
  switch: [
    ()=><Switch label="Звук" defaultChecked/>, ()=><Switch label="Звук"/>,
    ()=><FocusExample kind="switch"/>, ()=><Switch label="Звук" disabled/>,
  ],
  slider: [
    ()=><LevelExample initial={0}/>, ()=><LevelExample initial={60}/>, ()=><LevelExample initial={100}/>,
    ()=><FocusExample kind="slider"/>, ()=><LevelExample initial={60} disabled/>,
  ],
  progress: [
    ()=><Progress label="Готовность" value={0}/>, ()=><Progress label="Готовность" value={60}/>,
    ()=><Progress label="Готовность" value={100}/>, ()=><Progress label="Получаем объём"/>,
  ],
  'status-indicator': [
    ()=><StatusIndicator>Вне сети</StatusIndicator>,
    ()=><StatusIndicator tone="success">На связи</StatusIndicator>,
    ()=><StatusIndicator tone="warning">Нужен ответ</StatusIndicator>,
    ()=><StatusIndicator tone="error">Ошибка</StatusIndicator>,
  ],
  link: [()=><Link href="#box/foundations">Основы</Link>, ()=><FocusExample kind="link"/>],
  row: [
    ()=><Row><Icon name="wifi"/><Text>Сеть</Text></Row>,
    ()=><Row style={{maxWidth:'7em'}}><Text>Устройство</Text><Text>подключено</Text></Row>,
  ],
  stack: [
    ()=><Stack><Text>Громкость</Text></Stack>,
    ()=><Stack><Text>Громкость</Text><Progress label="Громкость" value={60}/><Text>60%</Text></Stack>,
  ],
  'box-actions': [
    ()=><DecisionExample initial=""/>, label=><DecisionExample initial={label}/>,
    label=><DecisionExample initial={label}/>,
  ],
  'box-network': [
    ()=><NetworkRow online value="Домашняя"/>,
    ()=><NetworkRow online value="WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"/>,
    ()=><NetworkRow online={false} value=""/>,
  ],
  'box-volume': [()=><VolumeExample initial={0}/>, ()=><VolumeExample initial={60}/>, ()=><VolumeExample initial={100}/>],
};

export function Variants({id}: {id:string}) {
  const catalog = (window as unknown as {catalogData: Catalog}).catalogData;
  const item = [...catalog.atoms, ...catalog.components].find(entry=>entry.id===id);
  const samples = displays[id];
  if (!item || !samples || samples.length!==item.states.length) {
    throw new Error('Each documented state must have a live example: ' + id);
  }
  return <div className="state-grid">{item.states.map((label,i)=>
    <figure key={label} data-state={label}><figcaption>{label}</figcaption>
      <div className="state-example">{samples[i](label)}</div>
    </figure>
  )}</div>;
}
