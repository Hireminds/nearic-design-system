import assert from 'node:assert/strict';
import { expect } from 'playwright/test';

// Use a fresh context for both scenarios. The legacy route and static permalink
// must expose the same released components without runtime JavaScript or Storybook.
export async function checkButtonPilot(browser, catalog, entries) {
  const stories = entries.filter(story => story.type === 'story' && story.title === 'BOX/Button');
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await staticContext.newPage();
    for (const suffix of ['button.html', '#box/atoms/button']) {
      await page.goto(catalog + suffix);
      const button = page.locator('.nearic-demo-stage button');
      await expect(button).toBeVisible();
      await expect(button).toHaveText('Подтвердить');
      await expect(button).toHaveCSS('background-color', 'rgb(115, 238, 208)');
      await expect(page.locator('iframe')).toHaveCount(0);
      const cards = page.locator('[data-state]');
      await expect(cards).toHaveCount(stories.length);
      for (const story of stories) {
        const card = cards.filter({has: page.locator('a[href$="/story/' + story.id + '"]')});
        await expect(card.locator('.button-snapshot .nr-button').first()).toBeVisible();
        await expect(card.locator('figcaption')).toContainText(story.name);
      }
      await expect(page.locator('[data-state="Недоступна"] .button-snapshot button')).toBeDisabled();
      await expect(page.locator('[data-nearic-focus-target] button')).toHaveCSS('outline-style', 'solid');
    }
  } finally { await staticContext.close(); }

  const context = await browser.newContext();
  const errors = [], unwanted = [];
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/\/storybook\/|\/runtime\.js/, route => {
      unwanted.push(route.request().url()); return route.abort();
    });
    for (const [suffix, name, label] of [
      ['button.html','Параметры','Содержимое'], ['?lang=en#box/atoms/button','Parameters','Content'],
    ]) {
      await page.goto(catalog + suffix);
      const island = page.locator('[data-nearic-button-live][data-live-ready="true"]');
      const button = island.locator('.nearic-demo-stage button');
      const panel = island.getByRole('group', {name, exact:true});
      await panel.getByRole('textbox', { name: label }).fill('Pilot');
      await expect(button).toHaveText('Pilot');
      await button.evaluate(el => el.setAttribute('data-identity-test', 'one'));
      await page.locator('[data-select-story="box-button--disabled"]').click();
      await expect(button).toBeDisabled();
      await page.locator('[data-select-story="box-button--focus"]').click();
      await expect(button).toBeFocused();
      await expect(button).toHaveAttribute('data-identity-test', 'one');
      await expect(page.locator('iframe')).toHaveCount(0);
    }
    await page.getByRole('navigation').getByRole('link', {name:'Цвета',exact:true}).click();
    await expect(page.locator('[data-nearic-button-live]')).toHaveCount(0);
    await page.goBack();
    await expect(page.locator('[data-nearic-button-live][data-live-ready="true"]')).toHaveCount(1);
    assert.deepEqual(unwanted, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}
