import type { StrictArgTypes, StrictInputType } from 'storybook/internal/types';

export type Labels = Record<string, string>;
type PropInfo = { labelKey: string; kind: string; type?: string; options?: string[]; required: boolean; owned: boolean };
export type PropModel = Record<string, PropInfo>;

export function localizedArgTypes(model: PropModel, storyArgTypes: StrictArgTypes, labels: Labels): StrictArgTypes {
  const result = { ...storyArgTypes };
  for (const [key, prop] of Object.entries(model)) {
    const existing = storyArgTypes[key];
    if (!existing && !prop.owned && key !== 'disabled') continue;
    const translated = labels[prop.labelKey];
    if (!translated) throw new Error('Missing prop translation: ' + prop.labelKey);
    const inferred: StrictInputType = {
      name: key, control: false, table: { type: { summary: prop.type } },
    };
    switch (prop.kind) {
      case 'text': case 'number': case 'boolean': case 'select':
        inferred.control = { type: prop.kind };
        break;
    }
    if (prop.options) inferred.options = prop.options;
    result[key] = {
      ...inferred, ...existing,
      name: key,
      description: [translated, existing?.description].filter(Boolean).join(' · '),
      nearic: { ...existing?.nearic, labelKey: prop.labelKey, required: prop.required, owned: prop.owned },
    };
  }
  return result;
}
