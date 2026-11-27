import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ButtonLive, type ButtonModel } from './ButtonLive';

export function mountButtonComponent(host: HTMLElement, Button: React.ElementType) {
  const data = host.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const island = host.querySelector<HTMLElement>('[data-nearic-button-island]');
  if (!data || !island) throw new Error('Incomplete Button preview');
  const model: ButtonModel = JSON.parse(data.textContent!);
  const root = hydrateRoot(island, <ButtonLive Button={Button} model={model} storyId={model.primaryId} host={host} />);
  return () => root.unmount();
}
