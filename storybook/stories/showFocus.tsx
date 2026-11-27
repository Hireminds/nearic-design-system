import { useRef, type ReactNode } from 'react';
import { Button, Stack } from '@nearic/ui-box';
import type { Decorator } from '@storybook/react-vite';

function FocusSample({children}: {children: ReactNode}) {
  const target = useRef<HTMLDivElement>(null);
  function focusControl() {
    target.current?.querySelector<HTMLElement>('button, input, a[href]')?.focus({focusVisible: true} as FocusOptions);
  }
  return <Stack>
    <div ref={target} data-nearic-focus-target>{children}</div>
    <Button data-nearic-focus-trigger variant="quiet" onClick={focusControl}>Показать фокус</Button>
  </Stack>;
}

export const showFocus: Decorator = Story => <FocusSample><Story /></FocusSample>;
