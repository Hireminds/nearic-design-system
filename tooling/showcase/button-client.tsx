import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ButtonLive, type ButtonModel } from './ButtonLive';

export function mountButtonComponent(host: HTMLElement, Button: React.ElementType) {
  const data = host.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const island = host.querySelector<HTMLElement>('[data-nearic-button-island]');
  if (!data || !island) throw new Error('Incomplete Button preview');
  const model: ButtonModel = JSON.parse(data.textContent!);
  let selection = 0;
  const preview = (storyId: string) => <ButtonLive key={selection} Button={Button} model={model} storyId={storyId} host={host} />;
  const root = hydrateRoot(island, preview(model.primaryId));
  function select(event: Event) {
    const id = (event as CustomEvent).detail;
    if (typeof id !== 'string' || !Object.hasOwn(model.stories, id)) return;
    selection++;
    root.render(preview(id));
  }
  host.addEventListener('nearic:select-story', select);
  return () => {
    host.removeEventListener('nearic:select-story', select);
    root.unmount();
  };
}
