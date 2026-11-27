import * as React from 'react';
import type { Args, StrictArgTypes } from 'storybook/internal/types';
import { DemoShowcase } from './DemoControls';
import { ArgsContext, type ArgStore } from './story-context';
import { localizedArgTypes, type Labels, type PropModel } from './labels';

type Parameters = Record<string, any>;
type Context = {
  id: string; name: string; title: string; args: Args; initialArgs: Args; parameters: Parameters;
  argTypes: StrictArgTypes; globals: Record<string, unknown>; viewMode: 'story'; component: React.ElementType;
};
type CsfStory = {
  args?: Args; argTypes?: StrictArgTypes; parameters?: Parameters;
  render?: (args: Args, context: Context) => React.ReactNode;
  decorators?: ((Story: React.ComponentType, context: Context) => React.ReactNode)[];
};
type CsfMeta = CsfStory & { title: string; component: React.ElementType };
type CsfModule = { default: CsfMeta } & Record<string, CsfStory>;
export type StoryIndex = { id: string; name: string; exportName: string };
type Story = StoryIndex & {
  args: Args; argTypes: StrictArgTypes; parameters: Parameters; View: React.ComponentType;
};
type Config = {
  component: string; previewClass: string; propModel: PropModel; locales: Record<string, Labels>; index: StoryIndex[];
};
type LiveInputs = { id: string; lang: string; host?: HTMLElement };
const RenderContext = React.createContext<Context | null>(null);

function mergeParameters(base: Parameters, overrides: Parameters) {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const before = base[key];
    result[key] = before && value && Object.getPrototypeOf(before) === Object.prototype && Object.getPrototypeOf(value) === Object.prototype
      ? mergeParameters(before, value) : value;
  }
  return result;
}

function DefaultView() {
  const context = React.useContext(RenderContext)!;
  return React.createElement(context.component, context.args);
}

function prepare(csf: CsfModule, entry: StoryIndex): Story {
  const meta = csf.default;
  const variant = csf[entry.exportName];
  const render = variant.render ?? meta.render;
  let View: React.ComponentType = render ? () => {
    const context = React.useContext(RenderContext)!;
    return render(context.args, context);
  } : DefaultView;
  for (const decorate of [...variant.decorators ?? [], ...meta.decorators ?? []]) {
    const Inner: React.ComponentType = View;
    View = () => decorate(Inner, React.useContext(RenderContext)!);
  }
  return { ...entry, View, args: { ...meta.args, ...variant.args },
    argTypes: { ...meta.argTypes, ...variant.argTypes },
    parameters: mergeParameters(meta.parameters ?? {}, variant.parameters ?? {}),
  };
}

export function createExamples(csf: CsfModule, config: Config) {
  const stories = Object.fromEntries(config.index.map(entry => [entry.id, prepare(csf, entry)]));
  if (!config.index.length) throw new Error('No stories for ' + config.component);

  function StoryExample({ id, lang, host, snapshot = false }: LiveInputs & { snapshot?: boolean }) {
    const [selected, setSelected] = React.useState(() => ({ id, args: stories[id].args, revision: 0 }));
    const story = stories[selected.id];
    const { args } = selected;
    const stage = React.useRef<HTMLDivElement>(null);
    const requestedFocus = React.useRef(false);
    const labels = config.locales[lang];
    const argTypes = React.useMemo(() => {
      const types = localizedArgTypes(config.propModel, story.argTypes, labels);
      for (const key of story.parameters.controls?.exclude ?? []) {
        if (typeof key === 'string' && types[key]) types[key] = { ...types[key], control: false };
      }
      return types;
    }, [story, labels]);

    React.useLayoutEffect(() => {
      if (!host) return;
      function select(event: Event) {
        const next = (event as CustomEvent).detail;
        if (typeof next !== 'string' || !Object.hasOwn(stories, next)) return;
        requestedFocus.current = true;
        setSelected(previous => ({ id: next, args: stories[next].args, revision: previous.revision + 1 }));
      }
      host.addEventListener('nearic:select-story', select);
      host.querySelector<HTMLElement>('[data-nearic-island]')!.inert = false;
      host.dataset.liveReady = 'true';
      host.dispatchEvent(new Event('nearic:live-ready', { bubbles: true }));
      if (config.component === 'Button') host.dispatchEvent(new Event('nearic:button-ready', { bubbles: true }));
      return () => host.removeEventListener('nearic:select-story', select);
    }, [host]);

    React.useLayoutEffect(() => {
      if (requestedFocus.current) {
        requestedFocus.current = false;
        stage.current?.querySelector<HTMLElement>('[data-nearic-focus-target] :is(button,input,a[href])')?.focus({ focusVisible: true } as FocusOptions);
      }
    }, [selected]);

    const update = React.useCallback((changes: Args) => {
      setSelected(previous => ({ ...previous, args: { ...previous.args, ...changes } }));
    }, []);
    const reset = React.useCallback((names?: string[]) => {
      setSelected(previous => {
        const initial = stories[previous.id].args;
        return { ...previous, args: names ? { ...previous.args, ...Object.fromEntries(names.map(key => [key, initial[key]])) } : initial };
      });
    }, []);
    const store: ArgStore = [args, update, reset];
    const context: Context = { id: story.id, title: csf.default.title, name: story.name, args,
      initialArgs: story.args, parameters: story.parameters, argTypes,
      component: csf.default.component, globals: {}, viewMode: 'story' };
    const content = <ArgsContext.Provider value={store}>
      <RenderContext.Provider value={context}><story.View key={story.View === DefaultView ? undefined : selected.revision} /></RenderContext.Provider>
    </ArgsContext.Provider>;
    if (snapshot) return content;
    return <DemoShowcase args={args} argTypes={argTypes} labels={labels} updateArgs={update}>
      <div className={config.previewClass} ref={stage}>{content}</div>
    </DemoShowcase>;
  }
  return StoryExample;
}
