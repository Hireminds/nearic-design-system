import { useEffect, useState } from 'react';
import { Button, Icon, Row, SettingRow, Slider, Text } from '@nearic/ui';

type RangeField = {
  id: string;
  kind: 'range';
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
};
type ToggleField = { id: string; kind: 'toggle'; label: string; value: boolean };
type Field = RangeField | ToggleField;
export type Values = Record<string, number | boolean>;
type Load = { state: 'loading' | 'failed' } | { state: 'ready'; fields: Field[] };

function isField(data: unknown): data is Field {
  if (!data || typeof data !== 'object') return false;
  const field = data as Record<string, unknown>;
  if (typeof field.id !== 'string' || !field.id || typeof field.label !== 'string') return false;
  if (field.kind === 'toggle') return typeof field.value === 'boolean';
  return field.kind === 'range'
    && typeof field.value === 'number' && Number.isFinite(field.value)
    && typeof field.min === 'number' && Number.isFinite(field.min)
    && typeof field.max === 'number' && Number.isFinite(field.max) && field.max > field.min
    && field.value >= field.min && field.value <= field.max
    && typeof field.step === 'number' && Number.isFinite(field.step) && field.step > 0
    && typeof field.unit === 'string';
}

export function WebSettings({ deviceId, online, values, onChange }: {
  deviceId: string;
  online: boolean;
  values: Values;
  onChange(id: string, value: number | boolean): void;
}) {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    async function request() {
      setLoad({ state: 'loading' });
      try {
        const response = await fetch('./assets/web/settings.json', { signal: abort.signal });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const payload: unknown = await response.json();
        const devices = payload && typeof payload === 'object' && 'devices' in payload ? payload.devices : null;
        const fields: unknown = devices && typeof devices === 'object' ? (devices as Record<string, unknown>)[deviceId] : null;
        if (!Array.isArray(fields) || !fields.every(isField)) throw new Error('Unsupported settings');
        if (!abort.signal.aborted) setLoad({ state: 'ready', fields });
      } catch {
        if (!abort.signal.aborted) setLoad({ state: 'failed' });
      }
    }
    void request();
    return () => abort.abort();
  }, [deviceId, retry]);

  if (load.state === 'failed') return <div role="status" className="pw-load">
    <Text>Не удалось получить настройки.</Text>
    <Button variant="secondary" onClick={() => setRetry(i => i + 1)}>Повторить</Button>
  </div>;
  if (load.state !== 'ready') return <Text role="status" muted>Загружаем настройки…</Text>;
  return <div className="pw-fields">{load.fields.map(field => {
    const value = values[field.id] ?? field.value;
    if (field.kind === 'toggle') return <Row key={field.id} className="pw-field">
      <Icon name={field.id === 'notifications' ? 'bell' : 'settings'} size="small" />
      <SettingRow label={field.label} className="pw-toggle-row" checked={Boolean(value)} disabled={!online}
        onChange={e => onChange(field.id, e.currentTarget.checked)} />
    </Row>;
    return <Row key={field.id} className="pw-field">
      <Row className="pw-field-label">
        <Icon name="volume" size="small" />
        <Text>{field.label}</Text>
      </Row>
      <Row className="pw-volume">
        <Slider label={field.label} min={field.min} max={field.max} step={field.step} value={Number(value)} disabled={!online}
          onChange={e => onChange(field.id, e.currentTarget.valueAsNumber)} />
        <output>{Number(value)}{field.unit}</output>
      </Row>
    </Row>;
  })}</div>;
}
