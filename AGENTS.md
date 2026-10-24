# validum-site — память проекта

Витрина Validum: лендинг, документация, архитектура, интерактивный мок-генератор. Прод — `https://validum.tech` (GitHub Pages, репозиторий `Validum-Tech/validum-site`). Весь контекст, история решений и чек-листы — в `SITE_HANDOFF.md`; этот файл — краткая выжимка правил.

## Стек

| Слой | Технология |
|---|---|
| Генератор | Astro 7.4.2 (static output) |
| Интерактив | React 19.3.1, islands (`client:load`) |
| Стили | Tailwind 4.3.3 через `@tailwindcss/vite` |
| Markdown/MDX | `@astrojs/markdown-satteri` 0.4.5, `@astrojs/mdx` 8.1.1 |
| Деплой | GitHub Actions, Node 22.23.4, `npm ci && npm run build` → Pages |

## Карта

- `src/styles/global.css` — **единственный источник правды по цветам**: палитра → семантические токены (`--surface-2`, `--line`, `--fg`, `--accent`) → мост в утилиты через `@theme inline` (`bg-surface-2`, `text-fg-muted`, `shadow-glow-accent-md`).
- `src/layouts/BaseLayout.astro` — каркас, `class="dark"` на `<html>` статически, Header + Footer.
- `src/components/Header.astro` — 7 ссылок: Главная, Документация, Архитектура, Планы, Попробовать, Безопасность, Изменения. Переключателя темы нет by design.
- `src/components/TryForm.tsx` — интерактивный генератор: **полностью мок на клиенте**, без сети. Вкладки JSON / Java / CLI / cURL.
- `src/pages/` — `index`, `docs/index`, `architecture`, `roadmap`, `changelog`, `security`, `try`.
- `public/diagrams/` — экспорт archify: `validum-architecture.html` (интерактив) + `.png` (постер для страницы).
- `tools/patch-diagram-nav.mjs` — добавляет в экспорт диаграммы кнопку возврата на сайт (см. ниже).
- `tools/export-site-for-llm.ps1` — выгрузка сайта в `llm-export-site.md` для LLM.

## Жёсткие правила дизайна

1. **Только тёмная тема.** `class="dark"` в `BaseLayout.astro`, `color-scheme: dark`. Светлую не возвращать: она ломала `dark:`-утилиты.
2. **Ни одного hex/rgba в компонентах.** Только токены из `global.css`. Прозрачность — модификатором (`bg-accent/10`), не новым токеном.
3. Стиль — дорогой Enterprise DevTool (Vercel/Stripe/Linear): строгая типографика, много кода, минимум маркетинга. Никаких LLM в продукте — только детерминизм.
4. Метки на русском, URL-слаги английские.

Проверка перед сдачей (должно быть пусто):

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.astro" --include="*.tsx" | grep -v global.css
grep -rn "rgba(" src/ --include="*.astro" --include="*.tsx" | grep -v global.css
grep -rn "Try it\|Roadmap\|Changelog" src/ --include="*.astro" --include="*.tsx"
```

## Сборка и проверка

```bash
npm run dev      # localhost:4321
npm run build    # astro build
npm run preview  # посмотреть dist
```

**В контейнере агента `npm run build` сейчас падает** (`Cannot find native binding: @rolldown/binding-wasm32-wasi`) — `node_modules` собран под другую платформу. Для визуальной проверки бери уже собранный `dist/`:

```bash
python3 -m http.server 4477 --directory dist
```

`npm run check` (astro check) пока не заведён — это техдолг, см. handoff.

## Диаграмма архитектуры

Страница `/architecture` показывает PNG и ведёт на интерактивный экспорт archify в новой вкладке. В экспорте **нет навигации сайта**, поэтому после каждой перегенерации диаграммы запускай:

```bash
node tools/patch-diagram-nav.mjs
```

Скрипт идемпотентно вставляет в тулбар ссылку «← На сайт» (`data-validum-back`), иначе вкладка с диаграммой становится тупиком: выйти можно только кнопкой «назад» браузера. Ссылки на диаграмму в `src/pages/architecture.astro` передают `?theme=dark`, чтобы интерактив не открывался в светлой теме при тёмном сайте.

## Техдолг (не блокирует прод)

- `TryForm.tsx`: `useState<any>`, `payload: any` — заменить на union `IndividualProfile | OrganizationProfile | IpProfile`.
- `package.json`: нет скрипта `check` и шага `npm run check` в CI.
- `tools/export-site-for-llm.ps1`: кодировка UTF-8 по-разному в PS 5.1 и PS 7 (BOM).

## Дальше по плану

1. Реальный API на `/try` через `PUBLIC_API_URL` (нужен VPS).
2. P1.1: публикация `validum-core` в Maven Central → реальные зависимости в Docs.
3. P4.1: демонстрация импорта CSV.

## Дисциплина

Коммиты делает владелец — не коммить и не пушить. Черновики — в `.tmp/` (в `.gitignore`), скриншоты проверок — в `/workspace/screens/`, не в репозиторий.
