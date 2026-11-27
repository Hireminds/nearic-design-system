import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
import { expect } from 'playwright/test';
import * as box from '@nearic/ui-box';

const directory = fileURLToPath(new URL('../../dist/', import.meta.url));
const prefix = '/nearic-design-system/';
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
  const relative = decodeURIComponent(url.pathname.slice(prefix.length));
  const requestedFile = relative.endsWith('/') || relative === '' ? relative + 'index.html' : relative;
  const file = path.resolve(directory, requestedFile);
  if (!file.startsWith(directory)) { res.writeHead(404).end(); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});

// A pill has circular ends with a straight middle. 50% on an oblong track
// instead produces an ellipse whose horizontal and vertical radii differ.
function radiusInPixels(raw, width, height) {
  const [x, y = x] = raw.split(/\s+/);
  const length = (token, basis) => parseFloat(token) * (token.endsWith('%') ? basis / 100 : 1);
  const rx = length(x, width), ry = length(y, height);
  const clamp = Math.min(1, width / (2 * rx), height / (2 * ry));
  return [rx * clamp, ry * clamp];
}

async function checkSwitchShape(control) {
  const measure = await control.evaluate(input => {
    const style = getComputedStyle(input), rail = getComputedStyle(input, '::before'), knob = getComputedStyle(input, '::after');
    const bounds = input.getBoundingClientRect();
    return {
      hitWidth: bounds.width, hitHeight: bounds.height, opacity: Number(style.opacity),
      railWidth: parseFloat(rail.width), railHeight: parseFloat(rail.height), railLeft: parseFloat(rail.left), railRight: parseFloat(rail.right),
      railRadius: rail.borderTopLeftRadius,
      thumbWidth: parseFloat(knob.width), thumbHeight: parseFloat(knob.height), thumbRadius: knob.borderTopLeftRadius,
      thumbLeft: parseFloat(knob.left), thumbRight: parseFloat(knob.right), trackColor: rail.backgroundColor,
    };
  });
  const { hitWidth, hitHeight, railWidth, railHeight, railRadius, thumbWidth, thumbHeight } = measure;
  assert(hitWidth >= 44 && hitHeight >= 44, 'Switch hit target must be at least 44 × 44 CSS px');
  assert(railWidth > railHeight && railHeight > thumbHeight, 'Rail must enclose the thumb and allow travel');
  const [rx, ry] = radiusInPixels(railRadius, railWidth, railHeight);
  assert(Math.abs(rx - ry) < 0.5 && Math.abs(ry - railHeight / 2) < 0.5,
    'Switch rail must have circular capsule ends; got ' + railWidth + ' × ' + railHeight + ' px with radius ' + railRadius);
  assert.equal(thumbWidth, 20); assert.equal(thumbHeight, 20);
  assert.deepEqual(radiusInPixels(measure.thumbRadius, thumbWidth, thumbHeight), [10, 10]);
  return measure;
}

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const catalog = 'http://127.0.0.1:' + server.address().port + prefix;
const base = catalog + 'storybook/';
let browser;
try {
  const legacyCSS = process.argv[2] && await readFile(process.argv[2], 'utf8');
  browser = process.env.NEARIC_TEST_CDP
    ? await chromium.connectOverCDP(process.env.NEARIC_TEST_CDP)
    : await chromium.launch();
  const context = await browser.newContext({ locale: 'en-US', reducedMotion: 'reduce', viewport: { width: 1280, height: 960 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.setDefaultTimeout(10_000);
  const direct = (id, mode = 'story') => page.goto(base + 'iframe.html?id=' + id + '&viewMode=' + mode);
  const switchStory = async id => {
    await direct('box-switch--' + id);
    const sw = page.getByRole('switch', { name: 'Уведомления' });
    await expect(sw).toBeVisible();
    if (legacyCSS) await page.addStyleTag({ content: legacyCSS });
    return sw;
  };

  const sw = await switchStory('off');
  await expect(sw).not.toBeChecked();
  const off = await checkSwitchShape(sw);
  assert(off.thumbLeft <= off.hitWidth / 4, 'Off thumb should sit on the left');
  await page.keyboard.press('Tab');
  await expect(sw).toBeFocused();
  await expect(sw).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Space');
  await expect(sw).toBeChecked();
  const on = await checkSwitchShape(sw);
  assert(on.thumbRight <= on.hitWidth / 4, 'On thumb should sit on the right');
  assert.notEqual(on.trackColor, off.trackColor);
  const locked = await switchStory('disabled');
  await expect(locked).toBeChecked(); await expect(locked).toBeDisabled();
  const muted = await checkSwitchShape(locked);
  assert(muted.opacity < on.opacity);
  await page.keyboard.press('Tab'); await expect(locked).not.toBeFocused();

  const index = await (await fetch(base + 'index.json')).json();
  const entries = Object.values(index.entries);
  const components = Object.keys(box).filter(name => /^[A-Z]/.test(name));
  assert(components.includes('Card'), 'The BOX profile must export the reusable surface');
  for (const component of components) {
    const group = entries.filter(entry => entry.title === 'BOX/' + component);
    const docs = group.find(entry => entry.type === 'docs'), story = group.find(entry => entry.type === 'story');
    assert(docs && story, 'Missing documentation or live example for ' + component);
    await direct(docs.id, 'docs');
    await expect(page.getByRole('heading', { name: 'Свойства', exact: true }), docs.id).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('table').first()).toContainText('Default');
    await expect(page.getByRole('heading', { name: 'Пример TSX' })).toBeVisible();
    await expect(page.locator('pre').filter({ hasText: 'from' }).first()).toContainText('@nearic/ui-box');
    await direct(story.id);
    await expect(page.locator('#storybook-root [data-family="box"][data-platform="box"]').first()).toBeVisible();
  }

  await page.goto(catalog);
  const componentPages = page.locator('.nav-entries a[href^="#box/atoms/"], .nav-entries a[href^="#box/components/"]');
  await expect(componentPages).toHaveCount(components.length);
  const routes = await componentPages.evaluateAll(links => links.map(link => link.href));
  const catalogDocs = [];
  for (const route of routes) {
    await page.goto(route);
    const link = page.getByRole('link', { name: 'Свойства и TSX в Storybook' });
    await expect(link).toBeVisible();
    catalogDocs.push(await link.evaluate(element => new URL(element.href).searchParams.get('path')));
  }
  assert.deepEqual(catalogDocs.sort(), entries.filter(entry => entry.type === 'docs').map(entry => '/docs/' + entry.id).sort());

  // The showcase embeds the canonical story. Both the component and its generated controls
  // update the same args, including a boolean inherited from native HTML inputs.
  await page.goto(catalog + '#box/atoms/slider');
  const demo = page.frameLocator('iframe[src*="nearicDemo=1"]');
  const slider = demo.locator('input.nr-slider');
  const sliderControl = demo.getByRole('slider', { name: 'Значение', exact: true });
  await expect(slider).toHaveValue('60');
  await demo.getByRole('button', { name: 'Заблокировать' }).click();
  await expect(slider).toBeDisabled();
  await demo.getByRole('button', { name: 'Разблокировать' }).click();
  await expect(slider).toBeEnabled();
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(sliderControl).toHaveValue('65');
  await sliderControl.press('Home');
  await expect(slider).toHaveValue('0');

  await page.goto(catalog + '#box/components/box-actions');
  const decision = page.frameLocator('iframe[src*="nearicDemo=1"]');
  await decision.getByRole('button', { name: 'Запустить', exact: true }).click();
  const reset = decision.getByRole('button', { name: 'Сбросить', exact: true });
  await expect(reset).toBeFocused();
  await expect(decision.locator('[data-feedback]')).toHaveText('Подтверждено');
  await reset.click();
  await expect(decision.getByRole('button', { name: 'Позже', exact: true })).toBeFocused();
  await expect(decision.locator('[data-feedback]')).toHaveText('Ожидается ответ');

  await page.goto(catalog + '?lang=en#box/components/box-volume');
  const volume = page.frameLocator('iframe[src*="nearicDemo=1"]');
  await volume.getByRole('button', { name: 'Прибавить громкость' }).click();
  await expect(volume.getByRole('spinbutton', { name: 'Level', exact: true })).toHaveValue('70');
  await volume.getByRole('spinbutton', { name: 'Level', exact: true }).fill('30');
  await expect(volume.locator('output')).toHaveText('30%');
  await volume.getByRole('button', { name: 'Disable', exact: true }).click();
  await expect(volume.getByRole('button', { name: 'Прибавить громкость' })).toBeDisabled();

  await page.setViewportSize({ width: 320, height: 240 });
  await direct('box-volumecontrol--adjust');
  const card = page.locator('.nr-card.nr-volume');
  await expect(card).toBeVisible();
  for (const button of await card.getByRole('button').all()) {
    const bounds = await button.boundingBox();
    assert(bounds && bounds.height >= 44 && bounds.width >= 44);
  }
  const ssid = 'W'.repeat(32);
  await direct('box-networkrow--long-name');
  const network = page.locator('.nr-network');
  const networkName = network.locator('[data-field=connection]');
  await expect(network).toBeVisible();
  await expect(networkName).toHaveText(ssid);
  await expect(networkName).toHaveAttribute('title', ssid);
  await expect(networkName).toHaveCSS('text-overflow', 'ellipsis');
  assert.match(await network.ariaSnapshot(), new RegExp(ssid));
  const sizes = await network.evaluate(row => {
    const name = row.querySelector('[data-field=connection]');
    const rowBounds = row.getBoundingClientRect();
    const nameBounds = name.getBoundingClientRect();
    return { rowRight: rowBounds.right, nameRight: nameBounds.right, nameLength: name.scrollWidth, nameWidth: name.clientWidth };
  });
  assert(sizes.nameRight <= sizes.rowRight && sizes.nameLength > sizes.nameWidth, 'Long SSID must be visibly clipped inside the Wi-Fi row');
  await direct('box-networkrow--offline');
  await expect(networkName).toHaveText('Вне сети');
  await expect(networkName).not.toHaveAttribute('title', /.+/);
  await page.setViewportSize({ width: 1280, height: 960 });

  await page.goto(base + '?path=/story/box-iconbutton--variants');
  const preview = page.frameLocator('#storybook-preview-iframe');
  const liveButton = preview.getByRole('button', { name: 'Увеличить', exact: true });
  await expect(liveButton).toBeVisible();
  await page.locator('#control-variant').selectOption({ label: 'destructive' });
  await expect(liveButton).toHaveAttribute('data-variant', 'destructive');
  await page.locator('#control-label').fill('Уменьшить');
  const renamed = preview.getByRole('button', { name: 'Уменьшить', exact: true });
  await expect(renamed).toBeVisible();
  await page.locator('#control-disabled').press('Space');
  await expect(renamed).toBeDisabled();

  await direct('box-iconbutton--keyboard');
  const keyboardButton = page.getByRole('button', { name: 'Назад' });
  await expect(keyboardButton).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(keyboardButton).toBeFocused();
  await expect(keyboardButton).toHaveCSS('outline-style', 'solid');
  await keyboardButton.evaluate(el => el.addEventListener('click', () => { el.dataset.activated = 'yes'; }, { once: true }));
  await page.keyboard.press('Enter');
  await expect(keyboardButton).toHaveAttribute('data-activated', 'yes');

  await page.goto(base + '?path=/story/box-switch--off');
  const managerSwitch = preview.getByRole('switch', { name: 'Уведомления' });
  await expect(managerSwitch).not.toBeChecked();
  await page.locator('#control-checked').press('Space'); await expect(managerSwitch).toBeChecked();
  await managerSwitch.click(); await expect(page.locator('#control-checked')).not.toBeChecked();
  await page.locator('#control-disabled').press('Space'); await expect(managerSwitch).toBeDisabled();
  assert.deepEqual(errors, []);
  console.log(components.length + ' typed components with Docs, catalog links and live samples. Switch geometry, long SSID at 320px, keyboard, disabled states and Controls passed.');
  await context.close();
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
