import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Button, DecisionActions, DeviceCard, Icon, IconButton, Row, Stack, StatusIndicator, Text, TextField,
} from '@nearic/ui';
import { WebSettings } from './WebSettings';
import type { Values } from './WebSettings';
import './PulseWeb.css';

type Platform = 'desktop' | 'mobile';
type Section = 'devices' | 'requests';
type Box = { id: string; name: string; conversation: string; online: boolean; seen: string };
const originalBoxes: Box[] = [
  { id: 'studio', name: 'Студия', conversation: 'Релиз приложения', online: true, seen: 'Только что' },
  { id: 'office', name: 'Кабинет', conversation: 'План недели', online: false, seen: 'Вчера, 18:42' },
];
const newBox: Box = { id: 'living-room', name: 'Гостиная', conversation: 'Без разговора', online: true, seen: 'Только что' };

function Navigation({ section, onOpen, pending, bottom = false }: {
  section: Section; onOpen(section: Section): void; pending: boolean; bottom?: boolean;
}) {
  return <nav className={bottom ? 'pw-bottom-nav' : 'pw-top-nav'} aria-label={bottom ? 'Мобильная навигация' : 'Разделы кабинета'}>
    {(['devices', 'requests'] as const).map(id =>
      <Button key={id} variant="quiet" aria-current={section === id ? 'page' : undefined} onClick={() => onOpen(id)}>
        {bottom && <Icon name={id === 'devices' ? 'box' : 'message'} size="small" />}
        {id === 'devices' ? 'Устройства' : 'Запросы'}
        {id === 'requests' && pending && <span className="pw-count">1</span>}
      </Button>
    )}
  </nav>;
}

function Sheet({ title, onClose, children }: { title: string; onClose(): void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="pw-sheet" aria-labelledby="pw-dialog-title"
    onCancel={e => { e.preventDefault(); onClose(); }}
    onClick={e => {
      if (e.target !== e.currentTarget) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) onClose();
    }}>
    <Row className="pw-sheet-heading">
      <h2 id="pw-dialog-title">{title}</h2>
      <IconButton name="close" label="Закрыть" onClick={onClose} />
    </Row>
    {children}
  </dialog>;
}

function AddBox({ onAdd, onClose }: { onAdd(): void; onClose(): void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (code === '246810') onAdd();
    else setError('Код не совпал. Попробуйте 246810.');
  }
  return <Sheet title="Добавить BOX" onClose={onClose}>
    <p className="pw-intro">В этом эскизе код для проверки — 246810.</p>
    <form onSubmit={submit}>
      <Stack className="pw-code">
        <label htmlFor="pw-pair-code">Код с экрана BOX</label>
        <TextField id="pw-pair-code" label="Код с экрана BOX" value={code} inputMode="numeric" maxLength={6}
          placeholder="000000" autoFocus required pattern="[0-9]{6}" autoComplete="off" aria-invalid={!!error}
          aria-describedby={error ? 'pw-code-error' : undefined} onChange={e => { setCode(e.currentTarget.value); setError(''); }} />
      </Stack>
      {error && <p className="pw-error" id="pw-code-error" role="alert">{error}</p>}
      <div className="pw-sheet-foot"><Button type="submit">Добавить</Button></div>
    </form>
  </Sheet>;
}

function Requests({ section, answer, onAnswer }: {
  section: Section; answer: string; onAnswer(value: string): void;
}) {
  const response = useRef<HTMLDivElement>(null);
  const previousAnswer = useRef(answer);
  useEffect(() => {
    if (answer === previousAnswer.current) return;
    previousAnswer.current = answer;
    response.current?.querySelector<HTMLButtonElement>('button:last-of-type')?.focus({ preventScroll: true });
  }, [answer]);
  return <section className={section === 'devices' ? 'pw-requests' : ''}>
    {section === 'devices' ? <h2 className="pw-section-title">Запросы агента</h2> : <h1>Запросы агента</h1>}
    <div className="pw-request">
      <span className="pw-request-icon"><Icon name={answer ? 'check' : 'message'} /></span>
      <Stack className="pw-request-copy">
        <Text variant="control">Запустить тесты?</Text>
        <Text variant="label" muted>Студия · Релиз приложения</Text>
      </Stack>
      <div className="pw-response" aria-live="polite" ref={response}>
        {answer ? <Row><Text variant="label">{answer}</Text><Button variant="quiet" onClick={() => onAnswer('')}>Сбросить</Button></Row>
          : <DecisionActions primaryLabel="Разрешить" primaryVariant="secondary" secondaryLabel="Позже" secondaryVariant="quiet"
            onDecision={choice => onAnswer(choice === 'primary' ? 'Запуск разрешён' : 'Отложено')} />}
      </div>
    </div>
  </section>;
}

export function PulseWeb({ platform }: { platform: Platform }) {
  const [devices, setDevices] = useState(originalBoxes);
  const [selected, setSelected] = useState(originalBoxes[0].id);
  const [section, setSection] = useState<Section>('devices');
  const [modal, setModal] = useState<'settings' | 'add' | null>(null);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState<Record<string, Values>>({});
  const device = devices.find(box => box.id === selected) ?? devices[0];
  function add() {
    setDevices(current => current.some(box => box.id === newBox.id) ? current : [...current, newBox]);
    setSelected(newBox.id);
    setModal(null);
  }
  return <section className="pulse-web" aria-label="Личный кабинет Nearic" data-family="web" data-platform={platform}>
    <header className="pw-topbar">
      <div className="pw-brand"><Icon name="wave" />nearic</div>
      <Navigation section={section} onOpen={setSection} pending={!answer} />
      <span className="pw-person" aria-label="Личный кабинет">А</span>
    </header>
    <div className="pw-content">
      {section === 'devices' && <>
        <Row className="pw-heading">
          <div><h1>Мои устройства</h1><p>{devices.length} BOX · {devices.filter(box => box.online).length} на связи</p></div>
          <Button aria-label="Добавить BOX" onClick={() => setModal('add')} className="pw-add">
            <Icon name="plus" size="small" /><span>Добавить BOX</span>
          </Button>
        </Row>
        <div className="pw-cards">
          <DeviceCard name={device.name} conversation={device.conversation} online={device.online}
            imageSrc="../assets/box.webp" className="pw-feature">
            <Button className="pw-settings-button" variant="secondary" onClick={() => setModal('settings')}>
              <Icon name="settings" size="small" />Настройки BOX
            </Button>
          </DeviceCard>
          {devices.filter(box => box.id !== selected).map(box =>
            <Button key={box.id} variant="secondary" className="pw-other" aria-label={'Выбрать BOX ' + box.name} onClick={() => setSelected(box.id)}>
              <StatusIndicator tone={box.online ? 'success' : 'neutral'}>{box.online ? 'На связи' : 'Вне сети'}</StatusIndicator>
              <Icon className="pw-other-image" name="device" />
              <span className="pw-other-name"><Text variant="heading">{box.name}</Text><Text variant="label" muted>{box.conversation}</Text></span>
              <Icon name="next" size="small" className="pw-next" />
            </Button>
          )}
        </div>
      </>}
      <Requests section={section} answer={answer} onAnswer={setAnswer} />
    </div>
    <Navigation bottom section={section} onOpen={setSection} pending={!answer} />
    {modal === 'settings' && <Sheet title="Настройки BOX" onClose={() => setModal(null)}>
      <p className="pw-intro">{device.name}{!device.online && ' · Вне сети. Последняя связь: ' + device.seen.toLowerCase() + '.'}</p>
      <WebSettings key={device.id} deviceId={device.id} online={device.online} values={saved[device.id] ?? {}}
        onChange={(id, value) => setSaved(current => ({ ...current, [device.id]: { ...current[device.id], [id]: value } }))} />
      <div className="pw-sheet-foot"><Button onClick={() => setModal(null)}>Готово</Button></div>
    </Sheet>}
    {modal === 'add' && <AddBox onAdd={add} onClose={() => setModal(null)} />}
  </section>;
}
