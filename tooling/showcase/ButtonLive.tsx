import * as React from 'react';
import { DemoShowcase } from './DemoControls';
import type { Args, StrictArgTypes } from 'storybook/internal/types';
import type { Labels } from './labels';

export type ButtonModel = {
  primaryId: string;
  stories: Record<string, { args: Args; focus: boolean }>;
  argTypes: StrictArgTypes;
  labels: Labels;
  previewClass: string;
};
type Props = {
  Button: React.ElementType;
  model: ButtonModel;
  storyId: string;
  host?: HTMLElement;
};

export function ButtonLive({ Button, model, storyId, host }: Props) {
  const [selected, setSelected] = React.useState(() => ({ id: storyId, args: model.stories[storyId].args }));
  const stage = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (!host) return;
    function select(event: Event) {
      const id = (event as CustomEvent).detail;
      if (typeof id === 'string' && Object.hasOwn(model.stories, id)) setSelected({ id, args: model.stories[id].args });
    }
    host.addEventListener('nearic:select-story', select);
    host.querySelector<HTMLElement>('[data-nearic-button-island]')!.inert = false;
    host.dataset.liveReady = 'true';
    host.dispatchEvent(new Event('nearic:button-ready', { bubbles: true }));
    return () => host.removeEventListener('nearic:select-story', select);
  }, [host, model]);

  React.useLayoutEffect(() => {
    if (host && model.stories[selected.id].focus)
      stage.current?.querySelector('button')?.focus({ focusVisible: true } as FocusOptions);
  }, [host, model, selected.id]);

  return <DemoShowcase args={selected.args} argTypes={model.argTypes} labels={model.labels}
    updateArgs={changes => setSelected(previous => ({ ...previous, args: { ...previous.args, ...changes } }))}>
    <div ref={stage} className={model.previewClass}><Button {...selected.args} /></div>
  </DemoShowcase>;
}
