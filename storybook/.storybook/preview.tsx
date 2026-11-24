import type { Preview } from '@storybook/react-vite';
import { ArgTypes, Description, Primary, Source, Stories, Title, useOf } from '@storybook/addon-docs/blocks';
import '@nearic/ui-box/styles.css';
import './preview.css';

const examples = import.meta.glob<string>('../stories/examples/*.tsx', {
  eager: true, query: '?raw', import: 'default',
});

function PackageExample() {
  const { story } = useOf('story', ['story']);
  const component = story.title.split('/').at(-1);
  return <Source language="tsx" code={examples['../stories/examples/' + component + '.tsx']} />;
}

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    Story => <div className="box-example" data-family="box" data-platform="box"><Story /></div>,
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    docs: {
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
