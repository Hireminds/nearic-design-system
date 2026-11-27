import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Exercise each component through the same package entry point available to a consumer.
export function render(Component, props, ...children) {
  return renderToStaticMarkup(createElement(Component, props, ...children));
}
