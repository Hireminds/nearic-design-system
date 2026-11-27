import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../../packages/*/src/*/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
  typescript: { reactDocgen: false },
  viteFinal(config) {
    return { ...config, base: './' };
  },
};
export default config;
