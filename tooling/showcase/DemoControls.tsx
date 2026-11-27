import * as React from 'react';
import type { Args, StrictArgTypes } from 'storybook/internal/types';
import type { Labels } from './labels';
import './controls.css';

type Props = { args: Args; argTypes: StrictArgTypes; labels: Labels; updateArgs: (changes: Args) => void };

export function DemoControls({ args, argTypes, labels, updateArgs }: Props) {
  const fields = Object.entries(argTypes).flatMap(([key, arg]) => {
    if (!arg.nearic?.labelKey || arg.table?.disable || !arg.control) return [];
    if (key === 'defaultValue' && args.value !== undefined || key === 'defaultChecked' && args.checked !== undefined) return [];
    if (key === 'value' && args.defaultValue !== undefined || key === 'checked' && args.defaultChecked !== undefined) return [];
    const value = args[key];
    const label = labels[arg.nearic.labelKey];
    const control = typeof arg.control === 'string' ? { type: arg.control } : arg.control;
    // Advanced DOM attributes remain available in the technical Controls panel.
    if (control.disable || (key !== 'disabled' && !(key in args) && !arg.nearic.required && !arg.nearic.owned)) return [];
    const update = (next: unknown) => updateArgs({ [key]: next });
    let input;
    if (control.type === 'boolean' && key === 'disabled') {
      return [<button className="nearic-demo-lock" key={key} type="button" aria-pressed={Boolean(value)}
        onClick={() => update(!value)}>{labels[value ? 'actions.enable' : 'actions.disable']}</button>];
    }
    switch (control.type) {
      case 'boolean':
        input = <input type="checkbox" checked={Boolean(value)} onChange={e => update(e.currentTarget.checked)} />;
        break;
      case 'select': case 'radio': case 'inline-radio':
        input = <select value={value ?? ''} onChange={e => update(arg.options?.find(item => String(item) === e.currentTarget.value))}>
          {value === undefined && <option value="" />}
          {arg.options?.map(item => <option key={String(item)} value={String(item)}>{control.labels?.[String(item)] ?? String(item)}</option>)}
        </select>;
        break;
      case 'range': case 'number': {
        const min = control.min ?? (key === 'value' ? args.min : undefined);
        const max = control.max ?? (key === 'value' ? args.max : undefined);
        const range = control.type === 'range' || min !== undefined && max !== undefined;
        input = <><input type={range ? 'range' : 'number'} aria-label={label} min={min} max={max}
          step={control.step ?? (key === 'value' ? args.step : undefined)} value={value ?? ''}
          onChange={e => { const next = e.currentTarget.valueAsNumber; if (Number.isFinite(next)) update(next); }} />
          {range && <span aria-hidden="true">{value}</span>}</>;
        break;
      }
      case 'text':
        if (value !== undefined && typeof value !== 'string') return [];
        input = <input type="text" value={value ?? ''} onChange={e => update(e.currentTarget.value)} />;
        break;
      default: return [];
    }
    return [<label key={key} className="nearic-demo-field"><span>{label}</span>{input}</label>];
  });

  return fields.length ? <fieldset className="nearic-demo-controls"><legend>{labels['controls.title']}</legend>{fields}</fieldset> : null;
}
