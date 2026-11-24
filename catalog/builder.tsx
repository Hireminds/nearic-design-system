import {useEffect, useState, type ComponentProps} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, Icon, Row, Switch, Text} from '@nearic/ui';

// @example-start
type SettingProps = {
  iconName: ComponentProps<typeof Icon>['name'];
  label: string;
  tone: ComponentProps<typeof Icon>['tone'];
  control: 'switch' | 'button';
  checked: boolean;
  variant: ComponentProps<typeof Button>['variant'];
  disabled: boolean;
};

function SettingRow({iconName, tone, label, control, checked, variant, disabled}: SettingProps) {
  const [chosen, setChosen] = useState(false);
  return (
    <Row style={{justifyContent: 'space-between', flexWrap: 'wrap'}}>
      <Row><Icon name={iconName} tone={tone} /><Text>{label}</Text></Row>
      {control === 'switch'
        ? <Switch label={label} defaultChecked={checked} disabled={disabled} />
        : <Button variant={variant} disabled={disabled} onClick={() => setChosen(!chosen)}>
            {chosen ? 'Выбрано' : 'Выбрать'}
          </Button>}
    </Row>
  );
}
// @example-end

type Platform = 'desktop' | 'mobile' | 'box';
const initial: SettingProps = {
  iconName: 'bell', tone:'inherit', label: 'Уведомления', control: 'switch',
  variant: 'primary', checked: true, disabled: false
};
const iconNames = {
  bell:'Колокольчик', wifi:'Wi-Fi', volume:'Громкость', message:'Сообщение',
  settings:'Настройки', info:'Информация'
};
const tones = {inherit:'Основной', network:'Сеть', sound:'Звук', info:'Информация', success:'Успех', warning:'Предупреждение', error:'Ошибка'};
const variants = {primary:'Основная', secondary:'Вторичная', quiet:'Текстовая', destructive:'Опасное действие'};
let lastSettings = initial;

function snippet(model: SettingProps, platform: Platform): string {
  const {builderRecipe} = (window as unknown as {catalogData:{builderRecipe:string}}).catalogData;
  return [
    'import {useState, type ComponentProps} from "react";',
    'import {Button, Icon, Row, Switch, Text} from "@nearic/ui";',
    'import "@nearic/ui/styles.css";',
    '',builderRecipe,'',
    'export default function Example() {',
    '  return (',
    '    <div data-family="'+(platform==='box'?'box':'web')+'" data-platform="'+platform+'">',
    '      <SettingRow {...'+JSON.stringify(model,null,2).split('\n').join('\n      ')+'} />',
    '    </div>', '  );','}'
  ].join('\n');
}
function Builder({platform}:{platform:Platform}) {
  const [settings, setSettings] = useState<SettingProps>(lastSettings);
  const [copyStatus,setCopyStatus] = useState('');
  useEffect(()=>{lastSettings=settings;setCopyStatus('');},[settings]);
  const model = {...settings, label: settings.label.trim() || initial.label};
  const code = snippet(model,platform);
  function change<K extends keyof SettingProps>(key: K, value: SettingProps[K]) {
    setSettings(prev=>({...prev,[key]:value}));
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('Код скопирован.');
    } catch {
      const el = document.getElementById('builder-source');
      const selection = window.getSelection();
      if (el && selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setCopyStatus('Код выделен. Скопируйте его через меню браузера.');
    }
  }
  return <>
    <div className="builder-work">
      <form className="builder-fields" aria-label="Параметры сборки" onSubmit={e=>e.preventDefault()}>
        <label>Подпись<input name="label" type="text" maxLength={48} value={settings.label} onChange={e=>change('label',e.target.value)} /></label>
        <label>Иконка<select name="iconName" value={settings.iconName} onChange={e=>change('iconName',e.target.value as SettingProps['iconName'])}>
          {Object.entries(iconNames).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Цвет иконки<select name="tone" value={settings.tone} onChange={e=>change('tone',e.target.value as SettingProps['tone'])}>
          {Object.entries(tones).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Управление<select name="control" value={settings.control} onChange={e=>change('control',e.target.value as SettingProps['control'])}>
          <option value="switch">Переключатель</option><option value="button">Кнопка</option>
        </select></label>
        {settings.control==='button' ? <label>Приоритет<select name="variant" value={settings.variant} onChange={e=>change('variant',e.target.value as SettingProps['variant'])}>
          {Object.entries(variants).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select></label> : <label className="builder-check"><input type="checkbox" name="checked" checked={settings.checked} onChange={e=>change('checked',e.target.checked)} />Включён при открытии</label>}
        <label className="builder-check"><input type="checkbox" name="disabled" checked={settings.disabled} onChange={e=>change('disabled',e.target.checked)} />Заблокирован</label>
      </form>
      <div className="builder-output"><h2>Ваш образец</h2><div className="builder-stage">
        <div className="builder-setting"><SettingRow key={JSON.stringify(model)} {...model} /></div>
      </div></div>
    </div>
    <div className="builder-code"><div className="part-heading"><h2>Код сборки</h2><button className="copy-code" type="button" onClick={copy}>Скопировать TSX</button></div>
      <pre className="code" tabIndex={0} aria-label="Код сборки"><code id="builder-source">{code}</code></pre>
      <p role="status">{copyStatus}</p>
    </div>
  </>;
}
export function mountBuilder(host: HTMLElement, platform: Platform): () => void {
  const root = createRoot(host);
  root.render(<Builder platform={platform}/>);
  return () => root.unmount();
}
