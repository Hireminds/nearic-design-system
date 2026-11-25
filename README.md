# Nearic UI

Токены, атомарные React-компоненты и блоки для сенсорного экрана Nearic BOX 320 × 240. В каталоге можно сравнить живые состояния и собрать свою строку настройки. [Каталог BOX](https://hireminds.github.io/nearic-design-system/#box) · [Конструктор](https://hireminds.github.io/nearic-design-system/#box/builder) · [Storybook](https://hireminds.github.io/nearic-design-system/storybook/)

| Пакет | Что поставляет |
| --- | --- |
| [@nearic/tokens](packages/tokens) | Общие семантические значения в JSON и CSS. Не требует React. |
| [@nearic/ui-core](packages/ui-core) | Общие атомы, типы и стили. React 18.2 или 19 предоставляет приложение. |
| [@nearic/ui-box](packages/ui-box) | Оформление BOX, три составных блока и реэкспорты общих атомов. |

## Установка

Выберите пакет нужного уровня из [релиза v0.1.0-preview.3](https://github.com/Hireminds/nearic-design-system/releases/tag/v0.1.0-preview.3). UI-архив включает свои зависимости Nearic той же версии. Для интерфейса BOX установите в приложении с React один архив.

```sh
npm install https://github.com/Hireminds/nearic-design-system/releases/download/v0.1.0-preview.3/nearic-ui-box-0.1.0-preview.3.tgz
```

```tsx
import { useState } from 'react';
import { NetworkRow, Stack, VolumeControl } from '@nearic/ui-box';
import '@nearic/ui-box/styles.css';

export function SoundSettings() {
  const [volume, setVolume] = useState(60);
  return <Stack data-family="box">
    <NetworkRow online value="Домашняя" />
    <VolumeControl value={volume} onChange={setVolume} />
  </Stack>;
}
```

Если приложению нужны общие примитивы и собственная тема, объявите оба прямых импорта как зависимости.

```sh
npm install https://github.com/Hireminds/nearic-design-system/releases/download/v0.1.0-preview.3/nearic-tokens-0.1.0-preview.3.tgz https://github.com/Hireminds/nearic-design-system/releases/download/v0.1.0-preview.3/nearic-ui-core-0.1.0-preview.3.tgz
```

```tsx
import '@nearic/tokens/tokens.css';
import '@nearic/ui-core/styles.css';
import { Switch } from '@nearic/ui-core';

export const Notifications = () => <Switch label="Уведомления" defaultChecked />;
```

Для смешанного интерфейса поверх базы и атомов импортируйте `@nearic/ui-box/overrides.css` и `@nearic/ui-box/patterns.css`. Для собственного рендерера доступны `@nearic/tokens/tokens.json`, разница `@nearic/ui-box/overrides.json` и разрешённые значения `@nearic/ui-box/tokens.json`. [Манифест архивов с SHA-512](https://hireminds.github.io/nearic-design-system/downloads/package.json)

## Разработка

Требуются Node.js 22 с npm и Python 3. Из корня репозитория выполните команды и откройте [локальный каталог](http://127.0.0.1:8080/#box).

```sh
npm ci
npm run verify
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Проверка покрывает разрешение токенов, контраст, типы, содержимое архивов и установку в отдельные проекты. [Правила компонентов](docs/components.md) · [Токены](docs/tokens.md) · [Контракт поставки](specs/001-pulse-library/spec.md) · [Публикация каталога](.github/workflows/pages.yml)


## Работа с атомами

В Codex откройте этот репозиторий и вызовите `$nearic-ui-atom`. Скилл дополняет спецификацию библиотеки, оформляет свойства и состояния атома и связывает их с примерами и тестами Storybook. Для команды `specify` используйте версию 1.4.3.

```sh
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.4.3
specify integration status --json
specify workflow resolve speckit
```

[Скилл атомов](.agents/skills/nearic-ui-atom/SKILL.md) · [Контракт](specs/001-pulse-library/spec.md) · [Процесс в Codex](docs/process/chat-workflows.md)
