# Nearic BOX UI

`@nearic/ui-box` — библиотека React-компонентов и токенов для экрана Nearic BOX 320 × 240. В каталоге можно посмотреть состояния компонентов, проверить управление с клавиатуры и собрать свою строку настройки. [Открыть каталог](https://hireminds.github.io/nearic-design-system/#box) · [Перейти к конструктору](https://hireminds.github.io/nearic-design-system/#box/builder)

## Установка

В проекте с React 18.2 или 19 установите архив библиотеки. [Манифест опубликованной версии с SHA-512](https://hireminds.github.io/nearic-design-system/downloads/package.json)

```sh
npm install https://hireminds.github.io/nearic-design-system/downloads/nearic-ui-box-0.1.0-preview.2.tgz
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

Стили включают токены под селектором `[data-family="box"]`. Для собственного рендерера доступны отдельные импорты `@nearic/ui-box/tokens.css` и `@nearic/ui-box/tokens.json`.

## Разработка

Требуются Node.js 22 с npm и Python 3. Выполните следующие команды и откройте [локальный каталог](http://127.0.0.1:8080/#box).

```sh
npm ci
npm run verify
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

| Директория | Содержимое |
| --- | --- |
| [library](library/) | Атомы, составные компоненты и типы пакета |
| [tokens](tokens/) | Семантические токены и проверка контраста |
| [components](components/) | Описания составных блоков с привязкой к атомам |
| [catalog](catalog/) | Каталог и конструктор на публичном API пакета |
| [docs](docs/) | [Правила компонентов](docs/components.md) и [токенов](docs/tokens.md) |
| [specs](specs/) | [Контракт поставки](specs/001-pulse-library/spec.md) |

Pull request проходит сборку и проверку архива. После слияния в `main` GitHub Pages публикует каталог и npm-архив из одной ревизии. [Workflow публикации](.github/workflows/pages.yml)
