import type { Decorator, Preview } from '@storybook/react-vite';
import { ArgTypes, Description, Primary, Source, Stories, Title, useOf } from '@storybook/addon-docs/blocks';
import '@nearic/ui-box/styles.css';
import './preview.css';
import { useArgs } from 'storybook/preview-api';
import { localizedArgTypes, type PropModel } from '../../tooling/showcase/labels';
import { DemoShowcase } from '../../tooling/showcase/DemoControls';
import docsModel from '../.generated/props.json';
import { darkTheme } from './theme';

const examples = import.meta.glob<string>('../../packages/*/src/*/*.example.tsx', {
  eager: true, query: '?raw', import: 'default',
});

function PackageExample() {
  const { story } = useOf('story', ['story']);
  const component = story.title.split('/').at(-1);
  return <Source language="tsx" code={Object.entries(examples).find(([file]) => file.endsWith('/' + component + '.example.tsx'))?.[1]} />;
}

const components: Record<string, PropModel> = docsModel.components;
const query = new URLSearchParams(window.location.search);
const labels = docsModel.locales[query.get('lang') === 'en' ? 'en' : 'ru'];

const withExample: Decorator = (Story, context) => {
  const [args, updateArgs] = useArgs();
  const live = context.viewMode === 'story' && query.get('nearicDemo') === '1';
  const example = <div className="box-example"><Story /></div>;
  return <div data-family="box" data-platform="box">
    {live ? <DemoShowcase args={args} argTypes={context.argTypes} labels={labels} updateArgs={updateArgs}>
      {example}
    </DemoShowcase> : example}
  </div>;
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withExample],
  argTypesEnhancers: [context => localizedArgTypes(components[context.title.split('/').at(-1)!] ?? {}, context.argTypes, labels)],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    docs: {
      theme: darkTheme,
      canvas: { sourceState: 'none' },
      page: () => <>
        <Title /><Description /><Primary />
        <h2>Свойства</h2><ArgTypes sort="requiredFirst" />
        <h2>Пример TSX</h2><PackageExample />
        <Stories includePrimary={false} />
      </>,
    },
    options: { storySort: { method: 'alphabetical' } },
  },
};
export default preview;
