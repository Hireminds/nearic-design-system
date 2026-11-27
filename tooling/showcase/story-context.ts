import * as React from 'react';
import type { Args } from 'storybook/internal/types';

// The catalog hosts each rendered CSF in its own React tree. Story callbacks
// and the generated controls share this store, including on the server.
export type ArgStore = [Args, (changes: Args) => void, (names?: string[]) => void];
export const ArgsContext = React.createContext<ArgStore | null>(null);
export function useArgs(): ArgStore {
  const store = React.useContext(ArgsContext);
  if (!store) throw new Error('The story requires a live example context');
  return store;
}
