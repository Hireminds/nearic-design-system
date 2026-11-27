import * as React from 'react';
import { Icon, Slider, Switch } from '@nearic/ui-core';
import type { Args, StrictArgTypes } from 'storybook/internal/types';
import type { Labels } from './labels';
import './controls.css';

type Props = { args: Args; argTypes: StrictArgTypes; labels: Labels; updateArgs: (changes: Args) => void };
type NumberProps = {
  value: number | string | undefined;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  required: boolean;
  onValue: (next: number | undefined) => void;
};

function NumberField({ value, min, max, step, required, onValue }: NumberProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    if (value == null) {
      if (!input.validity.badInput) input.value = '';
    } else if (input.valueAsNumber !== Number(value)) {
      input.value = String(value);
    }
  }, [value]);

  // Let the browser keep intermediate entries such as "-" and "1." while typing.
  return <input ref={ref} className="nearic-demo-input" type="number" min={min} max={max}
    step={step ?? 'any'} required={required} onChange={event => {
      const input = event.currentTarget;
      if (Number.isFinite(input.valueAsNumber) && input.validity.valid) onValue(input.valueAsNumber);
      else if (input.value === '' && !input.validity.badInput && !required) onValue(undefined);
    }} onBlur={event => {
      const input = event.currentTarget;
      if (!input.validity.valid) input.value = value == null ? '' : String(value);
    }} />;
}

type Field = { key: string; node: React.ReactElement };
const constraintKeys = ['min', 'max', 'step'];

export function DemoControls({ args, argTypes, labels, updateArgs }: Props) {
  const fields: Field[] = [];
  const bounds: Field[] = [];
  // An optional number can be cleared. Keep its field editable when Storybook drops the empty arg.
  const editedKeys = React.useRef(new Set<string>());

  for (const [key, arg] of Object.entries(argTypes)) {
    if (!arg.nearic?.labelKey || arg.table?.disable || !arg.control) continue;
    if (key === 'defaultValue' && args.value !== undefined || key === 'defaultChecked' && args.checked !== undefined) continue;
    if (key === 'value' && args.defaultValue !== undefined || key === 'checked' && args.defaultChecked !== undefined) continue;
    const control = typeof arg.control === 'string' ? { type: arg.control } : arg.control;
    // Advanced DOM attributes remain available in the technical Controls panel.
    if (control.disable || (key !== 'disabled' && !(key in args) && !arg.nearic.required && !arg.nearic.owned && !editedKeys.current.has(key))) continue;
    const value = args[key];
    const label = labels[key === 'disabled' ? 'controls.lock' : arg.nearic.labelKey];
    const update = (next: unknown) => {
      editedKeys.current.add(key);
      updateArgs({ [key]: next });
    };
    let input: React.ReactNode;
    let fieldClass = 'nearic-demo-field';
    switch (control.type) {
      case 'boolean':
        fieldClass += ' nearic-demo-switch';
        input = <Switch label={label} checked={Boolean(value)} onChange={event => update(event.currentTarget.checked)} />;
        break;
      case 'select': case 'radio': case 'inline-radio': {
        const options = arg.options ?? [];
        // Native option values are strings. Keep the original type, including 1 versus "1".
        const hasTypedOptions = options.some(item => typeof item !== 'string');
        const optionValue = (item: unknown) => hasTypedOptions ? String(options.indexOf(item)) : String(item);
        input = <span className="nearic-demo-select">
          <select className="nearic-demo-input" value={value == null ? '' : optionValue(value)} onChange={event => {
            const selected = event.currentTarget.value;
            update(options.find(item => optionValue(item) === selected));
          }}>
            {value === undefined && <option value="" />}
            {options.map(item => <option key={optionValue(item)} value={optionValue(item)}>{control.labels?.[String(item)] ?? String(item)}</option>)}
          </select>
          <Icon name="next" size="small" />
        </span>;
        break;
      }
      case 'range': case 'number': {
        const isValue = key === 'value' || key === 'defaultValue';
        const min = control.min ?? (isValue ? args.min : undefined);
        const max = control.max ?? (isValue ? args.max : undefined);
        const step = control.step ?? (isValue ? args.step : undefined);
        if (control.type === 'range' || min != null && max != null) {
          fieldClass += ' nearic-demo-range';
          input = <><span className="nearic-demo-reading" aria-hidden="true">{value ?? '—'}</span>
            <Slider label={label} min={min} max={max} step={step} value={value ?? ''}
              onChange={event => update(event.currentTarget.valueAsNumber)} /></>;
        } else {
          input = <NumberField value={value} min={min} max={max} step={step}
            required={Boolean(arg.nearic.required)} onValue={update} />;
        }
        break;
      }
      case 'text':
        if (value !== undefined && typeof value !== 'string') continue;
        input = <input className="nearic-demo-input" type="text" value={value ?? ''} onChange={event => update(event.currentTarget.value)} />;
        break;
      default: continue;
    }
    const target = control.type === 'number' && constraintKeys.includes(key) ? bounds : fields;
    target.push({ key, node: <label key={key} className={fieldClass}><span className="nearic-demo-label">{label}</span>{input}</label> });
  }

  if (!fields.length && !bounds.length) return null;
  return <fieldset className="nearic-demo-controls">
    <legend><Icon name="settings" /><span>{labels['controls.title']}</span></legend>
    <div className="nearic-demo-fields">
      {fields.filter(field => field.key !== 'disabled').map(field => field.node)}
      {bounds.length > 0 && <div className="nearic-demo-bounds">
        {constraintKeys.map(key => bounds.find(field => field.key === key)?.node)}
      </div>}
      {fields.find(field => field.key === 'disabled')?.node}
    </div>
  </fieldset>;
}
