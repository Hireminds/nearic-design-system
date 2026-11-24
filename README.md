# Nearic Design System

«Пульс» — дизайн-система для личного кабинета Nearic и браузерного представления экрана BOX 320 × 240.

[Каталог компонентов](https://hireminds.github.io/nearic-design-system/) · [Полные макеты](https://hireminds.github.io/nearic-design-system/mockups/) · [Сборки и публикации](https://github.com/Hireminds/nearic-design-system/actions/workflows/pages.yml)

| Каталог | Назначение |
| --- | --- |
| [library](library/) | Исходники пакета `@nearic/ui`. Публичные TSX-компоненты, стили, типы и список атомов |
| [tokens](tokens/) | Токены, профили, происхождение значений и проверка контраста |
| [components](components/) | Карточки составных блоков и ссылки на атомы в `uses` |
| [catalog](catalog/) | Каталог атомов, составных блоков, токенов и конструктор |
| [apps/mockups](apps/mockups/) | Отдельное React-приложение. Веб-экраны в `src/web/`, экраны BOX в `src/box/` |
| [docs/components.md](docs/components.md) | Правила композиции, доступности и ревью |
| [docs/tokens.md](docs/tokens.md) | Семантические роли, восстановленные значения первого «Пульса» и предлагаемые дополнения |
| [specs](specs/) | Контракт библиотеки для ревью |

## Подключение

Внутри монорепозитория npm workspaces устанавливает пакет как зависимость приложения макетов. В другом проекте с React используйте архив пакета из последней публикации Pages. Версия и контрольная сумма указаны в [манифесте архива](https://hireminds.github.io/nearic-design-system/downloads/package.json).

```sh
npm install https://hireminds.github.io/nearic-design-system/downloads/nearic-ui-0.1.0-preview.1.tgz
```

```tsx
import { Button, Icon } from '@nearic/ui';
import '@nearic/ui/styles.css';

export function Confirm({ onConfirm }: { onConfirm: () => void }) {
  return <div data-family="web" data-platform="mobile">
    <Button onClick={onConfirm}><Icon name="check" />Подтвердить</Button>
  </div>;
}
```

## Локальная сборка

Требуются Node.js 22, npm и Python 3.

```sh
npm ci
npm run verify
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Откройте [каталог](http://127.0.0.1:8080/) или [приложение макетов](http://127.0.0.1:8080/mockups/). Файл данных для демонстрации настроек отдаётся локальным HTTP-сервером. Интеграция с сервисом и проверка физических кнопок и дисплея BOX идут отдельно.

## Публикация

GitHub Actions устанавливает зависимости по lock-файлу, проверяет токены и TypeScript, собирает пакет, каталог и приложение макетов. Коммит в `main` публикует каталог в корне Pages, полноэкранные примеры в `/mockups/`, архив пакета в `/downloads/`. Pull request проходит проверки без публикации. [Конфигурация CI](.github/workflows/pages.yml).

Изображение платы адаптировано из проекта [Espressif ESP-BOX](https://github.com/espressif/esp-box/blob/master/docs/_static/esp32_s3_box_3.png). На дисплей наложен знак Nearic. [Лицензия изображения](notices/espressif-esp-box-LICENSE).
