import assert from 'node:assert/strict';
import { expect } from 'playwright/test';

function viewSignature(root) {
  const attributes = ['aria-label', 'aria-hidden', 'type', 'data-variant', 'data-size', 'data-tone', 'data-muted', 'href', 'min', 'max', 'step', 'd'];
  return {
    text: root.textContent.trim(),
    elements: [...root.querySelectorAll('button,input,progress,a,svg,path,[data-variant],[data-tone]')].map(node => [
      node.localName, ...attributes.map(attr => node.getAttribute(attr)), node.disabled, node.checked, node.value,
    ]),
  };
}

async function checkEdit(component, live) {
  const stage = live.locator('.nearic-demo-stage');
  const fields = live.getByRole('group', {name:'Параметры', exact:true});
  if (['Button','Card','Link','Row','Stack','StatusIndicator','Text'].includes(component)) {
    await fields.getByRole('textbox', {name:'Содержимое', exact:true}).fill('Проверка ' + component);
    await expect(stage).toContainText('Проверка ' + component);
  } else if (component === 'Icon') {
    await fields.getByRole('combobox', {name:'Размер', exact:true}).selectOption('large');
    await expect(stage.locator('svg')).toHaveAttribute('data-size', 'large');
  } else if (component === 'IconButton') {
    await fields.getByRole('textbox', {name:'Подпись', exact:true}).fill('Прибавить');
    await expect(stage.getByRole('button', {name:'Прибавить', exact:true})).toBeEnabled();
  } else if (component === 'Progress') {
    await fields.getByRole('spinbutton', {name:'Значение', exact:true}).fill('35');
    await expect(stage.getByRole('progressbar')).toHaveAttribute('value', '35');
  } else if (component === 'Slider') {
    await fields.getByRole('slider', {name:'Значение', exact:true}).press('End');
    await expect(stage.getByRole('slider')).toHaveValue('100');
    await stage.getByRole('slider').press('Home');
    await expect(fields.getByRole('slider')).toHaveValue('0');
  } else if (component === 'Switch') {
    const control = fields.getByRole('switch', {name:'Включён', exact:true});
    await control.press('Space');
    await expect(stage.getByRole('switch')).toBeChecked();
    await stage.getByRole('switch').press('Space');
    await expect(control).not.toBeChecked();
  } else if (component === 'DecisionActions') {
    await fields.getByRole('textbox', {name:'Основное действие', exact:true}).fill('Принять');
    await stage.getByRole('button', {name:'Принять', exact:true}).click();
    await expect(stage.locator('[data-feedback]')).toHaveText('Подтверждено');
  } else if (component === 'NetworkRow') {
    await fields.getByRole('textbox', {name:'Значение', exact:true}).fill('Home 2.4');
    await expect(stage.locator('[data-field="connection"]')).toHaveText('Home 2.4');
  } else if (component === 'VolumeControl') {
    await fields.getByRole('slider', {name:'Уровень', exact:true}).press('End');
    await expect(stage.locator('output')).toHaveText('100%');
    await stage.getByRole('button', {name:'Убавить громкость'}).click();
    await expect(fields.getByRole('slider')).toHaveValue('90');
  } else {
    throw new Error('Add a user-facing live interaction for ' + component);
  }
}

export async function checkStaticCatalog(browser, catalog, entries, items) {
  const staticContext = await browser.newContext({javaScriptEnabled:false, viewport:{width:320,height:750}});
  try {
    const page = await staticContext.newPage();
    for (const item of items) {
      const stories = entries.filter(story => story.type === 'story' && story.title === 'BOX/' + item.component);
      assert(stories.length > 0, item.component);
      for (const suffix of [item.id + '.html', item.id + '.en.html']) {
        await page.goto(catalog + suffix);
        await expect(page.locator('.nearic-demo-stage .box-example > :first-child')).toBeVisible();
        await expect(page.locator('iframe')).toHaveCount(0);
        const cards = page.locator('[data-state]');
        await expect(cards).toHaveCount(stories.length);
        for (const story of stories) {
          const card = cards.filter({has:page.locator('a[href$="/story/' + story.id + '"]')});
          await expect(card.locator('.story-snapshot .box-example > :first-child')).toBeVisible();
          await expect(card.locator('figcaption')).toContainText(story.name);
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'A 320px catalog must fit all states of ' + suffix);
      }
    }
    await page.goto(catalog + '#box/atoms/button');
    await expect(page.locator('.nearic-demo-stage button')).toHaveCSS('background-color', 'rgb(115, 238, 208)');
    await expect(page.locator('[data-state="Недоступна"] .story-snapshot button')).toBeDisabled();
    await expect(page.locator('[data-nearic-focus-target] button')).toHaveCSS('outline-style', 'solid');
  } finally { await staticContext.close(); }

  const context = await browser.newContext();
  const errors = [], unwanted = [];
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/\/storybook\/|\/runtime\.js/, route => {
      unwanted.push(route.request().url()); return route.abort();
    });
    for (const {id,component,section} of items) {
      await page.goto(catalog + '#box/' + section + '/' + id);
      const live = page.locator('[data-nearic-live][data-live-ready="true"]');
      await expect(live).toHaveCount(1);
      const host = await live.elementHandle();
      const stage = live.locator('.nearic-demo-stage .box-example');
      const cards = page.locator('[data-state]');
      await checkEdit(component, live);
      for (const card of await cards.all()) {
        const select = card.locator('[data-select-story]');
        await select.click();
        await expect(select).toHaveAttribute('aria-pressed', 'true');
        const snapshot = await card.locator('.story-snapshot .box-example').evaluate(viewSignature);
        await expect.poll(() => stage.evaluate(viewSignature), {message:component + ' / ' + await select.textContent()}).toEqual(snapshot);
      }
      assert(await host.evaluate(node => node.isConnected), 'Choosing a state must keep one live host: ' + component);
      await expect(page.locator('iframe')).toHaveCount(0);
    }

    await page.goto(catalog + '?lang=en#box/atoms/button');
    const live = page.locator('[data-nearic-live][data-live-ready="true"]');
    const button = live.locator('.nearic-demo-stage button').first();
    await live.getByRole('textbox', {name:'Content'}).fill('English');
    await expect(button).toHaveText('English');
    const committed = await page.locator('[data-select-story="box-button--focus"]').evaluate(control => {
      control.click();
      return control.getAttribute('aria-pressed') === 'true'
        && document.querySelector('[data-nearic-live]').dataset.activeStory === control.dataset.selectStory
        && document.activeElement.closest('[data-nearic-focus-target]') !== null;
    });
    assert(committed, 'A selection must commit its story, handlers and focus before the next input event');
    await expect(button).toBeFocused();
    await page.getByRole('navigation').getByRole('link', {name:'Цвета',exact:true}).click();
    await expect(page.getByRole('heading', {name:'Цвета',exact:true,level:1})).toBeVisible();
    await expect(live).toHaveCount(0);
    await page.evaluate(() => history.back());
    await expect(page).toHaveURL(catalog + 'button.en.html');
    await expect(live).toHaveCount(1);
    await live.getByRole('switch', {name:'Lock example',exact:true}).click();
    await expect(button).toBeDisabled();
    await page.goto(catalog);
    await expect(page.locator('.component-tile .story-snapshot .box-example > *').first()).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    assert.deepEqual(unwanted, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}
