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
  const story = model.stories[storyId];
  const [args, setArgs] = React.useState(story.args);
  const stage = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (!host) return;
    host.querySelector<HTMLElement>('[data-nearic-button-island]')!.inert = false;
    host.dataset.liveReady = 'true';
    if (story.focus) stage.current?.querySelector('button')?.focus({ focusVisible: true } as FocusOptions);
  }, [host, story]);

  return <DemoShowcase args={args} argTypes={model.argTypes} labels={model.labels}
    updateArgs={changes => setArgs(previous => ({ ...previous, ...changes }))}>
    <div ref={stage} className={model.previewClass}><Button {...args} /></div>
  </DemoShowcase>;
}
