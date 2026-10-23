# 📋 Validum Site — Handoff Document

> **Дата обновления:** 23 октября 2026
> **Статус:** Сайт запущен на `https://validum.tech`. Лендинг, документация и интерактивный генератор кода (Генератор) готовы. Тёмная тема на дизайн-токенах, переключателя нет by design. Навигация — на русском.

---

## 🎯 Проект

**Название:** Validum Site
**Домен:** `validum.tech` (куплен на reg.ru, DNS управляется через Cloudflare)
**Хостинг:** GitHub Pages (репозиторий `Validum-Tech/validum-site`)
**Цель:** Витрина проекта, документация, шпаргалка для QA-инженеров (генератор кода и JSON-ответов).

**Главное правило:** Сайт должен выглядеть как дорогой Enterprise DevTool (в стиле Vercel, Stripe, Linear). Тёмная тема, строгая типографика, много кода и минимум маркетингового булшита. Никаких LLM, только детерминизм.

---

## 🏗️ Стек

| Слой | Технология | Версия |
|---|---|---|
| Генератор | **Astro** | 7.4.2 (static output) |
| Интерактив | **React** | 19.3.1 (islands architecture) |
| React-интеграция | **@astrojs/react** | 7.1.1 |
| Стили | **Tailwind CSS** | 4.3.3 |
| Markdown | **@astrojs/markdown-satteri** | 0.4.5 (Sätteri на Rust) |
| MDX | **@astrojs/mdx** | 8.1.1 |
| Шрифты | Inter, JetBrains Mono | self-hosted / fallback |
| CI/CD | GitHub Actions | Node.js 22.23.4 |
| DNS/CDN | Cloudflare | DNS only (серое облако!) |

> **Примечание:** `@astrojs/markdown-satteri` — официальный пакет от команды Astro (maintainers: `fredkschott`, `matthewp`). Дефолтный Markdown-процессор в Astro 7. Не пугаться странного имени — это не typosquatting.

---

## 📁 Структура репозитория

```text
validum-site/
├── .github/workflows/deploy.yml  ← Деплой на GitHub Pages
├── public/
│   ├── CNAME                     ← Содержит `www.validum.tech`
│   └── favicon.svg               ← Иконка вкладки (V с ветвями)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro      ← Каркас (html, head, class="dark" статически)
│   ├── components/
│   │   ├── Header.astro          ← Шапка с навигацией (6 ссылок, без переключателя темы)
│   │   ├── Footer.astro          ← Подвал
│   │   ├── TryForm.tsx           ← React-компонент (Генератор кода/JSON)
│   │   └── home/
│   │       ├── Hero.astro        ← Главный экран (анимация конвейера + 3D медальон)
│   │       ├── QuickStart.astro  ← Блок с кодом (CLI, Docker, REST)
│   │       ├── Features.astro    ← Bento-сетка с преимуществами
│   │       ├── Comparison.astro  ← Таблица "Validum vs Faker"
│   │       ├── Security.astro    ← Блок про 152-ФЗ
│   │       └── CallToAction.astro← Финальный призыв
│   ├── pages/
│   │   ├── index.astro           ← Сборка всех home-компонентов
│   │   ├── docs/index.astro      ← Документация (сайдбар + контент)
│   │   ├── try.astro             ← Страница-обертка для TryForm
│   │   ├── roadmap.astro         ← Планы развития
│   │   ├── changelog.astro       ← История версий
│   │   └── security.astro        ← Безопасность
│   └── styles/
│       └── global.css            ← Единственный источник правды: дизайн-токены + @theme inline
├── astro.config.mjs
└── package.json
```

---

## 🎨 Ключевые технические решения

### 1. Тема — только тёмная, на дизайн-токенах

**Одна тема (dark).** `class="dark"` на `<html>` — статический, ставится в `BaseLayout.astro` один раз. Переключателя нет by design. Светлая тема удалена 23.10.2026 (была сломана: `dark:`-утилиты привязывались к `prefers-color-scheme`, а не к классу, из-за чего у пользователей со светлой ОС рендерилась каша).

**Два уровня токенов в `src/styles/global.css`:**

1. **Палитра** — сырые цвета, единственное место с hex:
   ```css
   --palette-ink-950: #09090b;
   --palette-emerald-500: #10b981;
   --palette-red-500: #ef4444;
   ```
2. **Семантические токены** — то, что используют компоненты:
    - Surfaces: `--surface-0/1/2/3`, `--surface-code`
    - Foreground: `--fg`, `--fg-muted`, `--fg-subtle`
    - Borders: `--line`, `--line-strong`
    - Accent: `--accent`, `--accent-light`, `--accent-dark`, `--accent-fg`
    - Danger: `--danger*`, `--danger-surface`, `--danger-border`
    - Success: `--success*`, `--success-surface`, `--success-border`
    - Glows: `--glow-accent-sm/md/lg/xl`, `--glow-danger-sm`, `--glow-success-sm/lg`

**Утилиты — через `@theme inline`.** Блок `@theme inline` превращает семантические токены в Tailwind-утилиты. В компонентах пишем только:

| Токен | Утилита |
|---|---|
| `--surface-0` | `bg-surface-0` |
| `--surface-2` | `bg-surface-2` |
| `--surface-code` | `bg-code` |
| `--fg-muted` | `text-fg-muted` |
| `--line` | `border-line` |
| `--accent` | `text-accent`, `bg-accent`, `border-accent` |
| `--danger` | `text-danger`, `bg-danger-surface` |
| `--glow-accent-md` | `shadow-glow-accent-md` |

**Хардкода hex/rgba в компонентах нет.** Проверка:

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.astro" --include="*.tsx" | grep -v global.css
grep -rn "rgba(" src/ --include="*.astro" --include="*.tsx" | grep -v global.css
```

Оба grep'а должны возвращать пусто (кроме `<style>`-блоков с keyframes — там нет цветов).

**Смена бренда = правка одного блока `:root`.** Захотел синий акцент — меняешь `--accent: #3b82f6`. Захотел фиолетовые glow — правишь `--glow-accent-*`. Компоненты не трогаются.

**`@custom-variant dark` в `global.css`** привязывает `dark:`-утилиты к классу `.dark` (а не к `prefers-color-scheme`). Если в будущем понадобятся условные `dark:` — работают ожидаемо.

### 2. Навигация — на русском, URL — английские

**В хедере — 6 ссылок:**

| URL | Метка |
|---|---|
| `/` | Главная |
| `/docs` | Документация |
| `/roadmap` | Планы |
| `/try` | Попробовать |
| `/security` | Безопасность |
| `/changelog` | Изменения |

**Принцип:** меняем видимые метки, URL-слаги **не трогаем**. Короткие `/roadmap`, `/try`, `/changelog`, `/security` — стандарт DevTools (Vercel, Linear, Stripe): техническая часть на английском, интерфейс — на языке пользователя. Кириллица в URL ломает шаринг, копирование из адресной строки и канонические URL.

**В футере** — те же ссылки + GitHub + Лицензия. При добавлении новой страницы — не забудь про `navLinks` в `Header.astro` и `Footer.astro`.

**Внутри страниц:**
- Eyebrow-метки: `Дорожная карта`, `Релизы`, `Генератор`, `Безопасность`, `Быстрый старт`, `Справочник API`.
- Статусы: `Готово / Дальше / План` (roadmap), `Текущая` (changelog).
- Бейдж в TryForm: `MOCK-РЕЖИМ`.
- Вкладки результата: `JSON / Java / cURL / CLI`.

**Технические имена не переводим:** `JSON`, `Java`, `cURL`, `CLI`, `Apache 2.0`, `Faker`, `Mockaroo`, `GitHub`, `Seed`, `MOCK`, `COPY`, `Picocli`, `Spring Boot`, `JUnit 5`, `Allure`, `Docker`, `Maven`. Это либо имена собственные, либо отраслевой жаргон.

### 3. Hero-анимация (Конвейер)

- Реализована на чистом CSS (keyframes) в `<style>` блоке `Hero.astro`.
- Слева летят красные карточки (битые данные), в центре крутится 3D-медальон, справа вылетают зелёные (валидные).
- **Тайминги:** Цикл 15 секунд. Красные летят каждые 3 секунды. Зелёные появляются с задержкой 0.3с от красных.
- 3D-медальон: две стороны (Щит с галочкой и V с ветвями), крутится с паузами.
- **Цвета карточек** — через токены: `bg-danger-surface border-danger-border shadow-glow-danger-sm` для красных, `bg-success-surface border-accent/XX shadow-glow-success-sm` для зелёных. Ни одного `#1a0808` / `#05140d`.

### 4. Генератор `TryForm.tsx` (Islands)

- Имитирует работу API (Mock-режим). Бейдж в углу карточки параметров — `MOCK-РЕЖИМ`.
- **Реализует реальные каскады:** если выбрать `age=16` и `region=MOSCOW`, `familyStatus` станет `SINGLE`, паспорт будет выдан в 14 лет, серия начнётся на 77.
- **4 вкладки результата:**
    - **JSON**: как ответит REST API.
    - **Java**: готовый код для `IndividualProfileGenerator.builder()...`
    - **cURL**: команда для терминала.
    - **CLI**: команда для fat JAR.
- Кнопка **COPY** на каждой вкладке. `navigator.clipboard.writeText(...).catch(...)` — на случай, если Clipboard API недоступен (http:// без TLS, нет разрешения).
- Вверху страницы (`try.astro`) честно написано, что это Mock, и даны инструкции по запуску реального API (Docker, CLI, Java).
- **Стилизация:** все цвета через токены. Код-блок — `bg-code`, разделители — `border-line`, кнопка копирования — `bg-surface-2 hover:bg-surface-3`.
- **Типизация:** `import { useState, type ChangeEvent } from 'react'` — без `React.ChangeEvent` (namespace `React` не импортирован). Явные `any` в `result`, `mock`, `payload` — техдолг, не ломает strict, но кандидат на сужение типов.

### 5. Единый источник правды для цветов

- **Файл:** `src/styles/global.css`. Больше нигде цвета не задаются.
- **Уровни:** палитра (`--palette-*`) → семантические токены (`--surface-*`, `--fg-*`, `--accent`, ...) → Tailwind-утилиты через `@theme inline`.
- **Правило для новых компонентов:** использовать только токен-утилиты. Хочешь новый оттенок — добавляешь токен в `:root`, потом утилиту в `@theme inline`. Не пишешь hex в компоненте.

---

## 🚀 Как деплоить (Важно!)

1. **Локальная разработка:** `npm run dev` (открывается на `http://localhost:4321`).
2. **Сборка:** `npm run build` (проверка, что нет ошибок TypeScript/Astro).
3. **Деплой:** Просто сделай `git push origin main`.
    - GitHub Actions (`.github/workflows/deploy.yml`) автоматически соберёт сайт и выкатит его.
    - **Критически важно:** В workflow жёстко зафиксирован Node.js `22.23.4`. Не меняй, иначе Astro упадёт.

### ⚠️ Нюансы домена и DNS

- Домен куплен на **reg.ru**, но NS-серверы переключены на **Cloudflare**.
- В Cloudflare созданы 4 A-записи (для `@`) и 1 CNAME (для `www`).
- **Все записи должны быть в режиме `DNS only` (серое облако)!** Если включить Proxied (оранжевое), GitHub Pages перестанет видеть домен и выдаст `InvalidDNSError`.
- Файл `public/CNAME` должен содержать `www.validum.tech`.

### ⚠️ Нюанс темы

- **Не добавлять переключатель темы** без переписывания всей системы цветов. Сайт спроектирован под одну тёмную тему. Если когда-нибудь понадобится светлая — это отдельная задача на всю дизайн-систему, а не «галочка в хедере».
- **Не хардкодить цвета в компонентах.** Всегда через токены (`bg-surface-2`, `text-fg-muted`, `border-line`, `shadow-glow-accent-md`). Если нужен новый оттенок — сначала токен в `:root`, потом утилита в `@theme inline`.

### ⚠️ Нюанс навигации

- **URL-слаги не переводим на кириллицу.** Метки в хедере/футере — русские, пути — английские. Это стандарт DevTools и защищает от проблем с шарингом и копированием URL.

---

## 🎨 Дизайн-система: шпаргалка

### Палитра

| Токен | Значение | Использование |
|---|---|---|
| `--palette-ink-950` | `#09090b` | базовый фон |
| `--palette-ink-200` | `#a1a1aa` | muted-текст |
| `--palette-ink-50` | `#fafafa` | основной текст |
| `--palette-emerald-500` | `#10b981` | акцент (success, валидные данные) |
| `--palette-red-500` | `#ef4444` | danger (битые данные) |

### Семантические токены → утилиты

| Токен | Утилита | Где использовать |
|---|---|---|
| `--surface-0` | `bg-surface-0` | фон страницы, корень блоков кода |
| `--surface-1` | `bg-surface-1` | footer, `thead`, полоски в табах |
| `--surface-2` | `bg-surface-2` | карточки, панели |
| `--surface-3` | `bg-surface-3` | hover-состояния |
| `--surface-code` | `bg-code` | `<pre>` блоки |
| `--fg` | `text-fg` | основной текст |
| `--fg-muted` | `text-fg-muted` | подписи, описания |
| `--fg-subtle` | `text-fg-subtle` | placeholder, disabled |
| `--line` | `border-line` | разделители, границы карточек |
| `--accent` | `text-accent bg-accent border-accent` | бренд-акцент |
| `--accent-fg` | `text-accent-fg` | текст на акцентном фоне (кнопки) |
| `--danger` | `text-danger` | красный текст |
| `--danger-surface` | `bg-danger-surface` | фон красных карточек в Hero |
| `--danger-border` | `border-danger-border` | границы красных карточек |
| `--success-surface` | `bg-success-surface` | фон зелёных карточек в Hero |
| `--glow-accent-sm` | `shadow-glow-accent-sm` | небольшое свечение (лого, кнопка) |
| `--glow-accent-md` | `shadow-glow-accent-md` | среднее (primary CTA) |
| `--glow-accent-lg` | `shadow-glow-accent-lg` | сильное (медальон, CTA-иконка) |
| `--glow-accent-xl` | `shadow-glow-accent-xl` | лазерная линия |
| `--glow-danger-sm` | `shadow-glow-danger-sm` | свечение красных карточек |
| `--glow-success-sm` | `shadow-glow-success-sm` | свечение зелёных карточек |

### Прозрачность через opacity-модификатор

`bg-accent/10`, `border-accent/20`, `bg-accent/5` — работают как обычно. Не заводи отдельный токен под каждую прозрачность.

### Пример: новая карточка

```astro
<div class="p-6 rounded-2xl border border-line bg-surface-2 hover:border-accent/40 transition-colors">
  <div class="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
    <svg>...</svg>
  </div>
  <h3 class="text-xl font-semibold mb-3">Заголовок</h3>
  <p class="text-fg-muted leading-relaxed text-sm">Описание</p>
</div>
```

Ни одного hex. Ни одного `rgba`. Ни одного `dark:`.

---

## 🗺️ Что сделано и что дальше

### ✅ Сделано

- [x] Инициализация Astro + React + Tailwind.
- [x] **Дизайн-система на токенах** (23.10.2026): палитра → семантические токены → утилиты через `@theme inline`. Хардкод цветов вычищен из всех компонентов.
- [x] **Светлая тема удалена.** Тёмная тема статическая (`class="dark"` на `<html>`). Переключатель убран из `Header.astro`. Сломанный `dark:`-вариант пофикшен через `@custom-variant dark`.
- [x] **Переименование навигации на русский** (23.10.2026): `Roadmap` → `Планы`, `Try it` → `Попробовать`, `Changelog` → `Изменения`. URL-слаги оставлены английскими. Статусы-бейджи: `Готово/Дальше/План`, `Текущая`. В `TryForm`: `MOCK MODE` → `MOCK-РЕЖИМ`, `JSON Response` → `JSON`.
- [x] **Хедер расширен до 6 ссылок:** Главная, Документация, Планы, Попробовать, Безопасность, Изменения.
- [x] Главная страница (Hero, Quick Start, Features, Comparison, Security, CTA).
- [x] Страница документации (все 16 эндпоинтов, CLI, Java).
- [x] Страницы Планы, Изменения, Безопасность.
- [x] Интерактивный Генератор (`/try`) — Mock-генератор JSON и кода на Java/CLI/cURL.
- [x] Деплой на GitHub Pages + домен `validum.tech`.
- [x] `<script>`-блоки в `QuickStart.astro` и `docs/index.astro` типизированы через generic (`querySelectorAll<HTMLElement>`, `<HTMLPreElement>` и т.д.) — красных подчёркиваний в IDE нет.

### ⏭️ Следующие шаги (Roadmap сайта)

1. **Реальный API:** Прикрутить `validum-api` (Docker) к `/try` через `PUBLIC_API_URL` (когда появится VPS).
2. **P1.1 Maven Central:** Опубликовать `validum-core` и добавить в Docs реальные зависимости.
3. **P4.1 Импорт CSV:** Добавить страницу с демонстрацией импорта.

### 📝 Технический долг (не блокирует прод)

- **`TryForm.tsx`:** заменить `any` (`result`, `mock`, `payload`) на union-тип `IndividualProfile | OrganizationProfile | IpProfile`.
- **`docs/index.astro`:** H1 `Validum Documentation` — английский, при русском eyebrow `Документация`. Кандидат на `Документация Validum`.
- **`package.json`:** добавить скрипт `"check": "astro check"` и шаг `npm run check` в CI. Ловит тип-ошибки (как `React.ChangeEvent`) до мержа.
- **`tools/export-site-for-llm.ps1`:** `-Encoding UTF8` по-разному работает в PS 5.1 и PS 7 (BOM). Для детерминизма — `utf8NoBOM` или `[System.IO.File]::ReadAllText` с явным `UTF8Encoding`.

---

## 🧪 Проверка после изменений

```bash
# Убедиться, что хардкода цветов нет
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.astro" --include="*.tsx" | grep -v global.css
grep -rn "rgba(" src/ --include="*.astro" --include="*.tsx" | grep -v global.css
grep -rn "var(--bg-\|var(--text-\|var(--border-\|var(--card-" src/ --include="*.astro" --include="*.tsx"

# Убедиться, что англицизмы в навигации вычищены
grep -rn "Try it\|Roadmap\|Changelog" src/ --include="*.astro" --include="*.tsx"

# Сборка
npm run dev      # http://localhost:4321
npm run build    # проверка TS/Astro-ошибок
npm run check    # astro check (если добавишь скрипт)
```

Все три grep'а должны быть пусты (кроме `<style>` с keyframes). Четвёртый должен совпасть только с URL-путями (`href="/roadmap"`), не с метками. Если появились строки — в компонент просочился хардкод или англицизм.

### Быстрая проверка темы

Открой сайт в DevTools → Elements → `<html>`. Должен быть `class="dark"`. В `<head>` не должно быть inline-скрипта, читающего `localStorage`. В `Header.astro` нет кнопки `#theme-toggle`.

### Быстрая проверка токенов

Открой DevTools → Elements → выбери любую карточку → Computed. Значения `background-color`, `border-color`, `color` должны резолвиться из CSS-переменных (`--surface-2`, `--line`, `--fg`). Если видишь литеральный hex — компонент не переведён на токены.

### Быстрая проверка навигации

Хедер: Главная · Документация · Планы · Попробовать · Безопасность · Изменения. Все ссылки ведут на русскоязычные страницы с русскими H1 и eyebrow. URL-слаги (`/roadmap`, `/try`, `/changelog`, `/security`) — английские.

---

## 🗣️ Что сказать в новом чате

> «Проект Validum Site. Astro 7.4.2 + React 19.3.1 islands + Tailwind 4.3.3 + `@astrojs/markdown-satteri` (официальный Sätteri-парсер от команды Astro). Сайт задеплоен на `validum.tech` через GitHub Pages. Есть главная с CSS-анимацией конвейера, страница документации и Mock-генератор кода `/try`. Деплой автоматический через `git push origin main` (Node 22.23.4). DNS управляется через Cloudflare (только серые облака). Тема одна — тёмная, на дизайн-токенах: все цвета в `src/styles/global.css` (`:root` → семантические токены → `@theme inline` → утилиты `bg-surface-2`, `text-fg-muted`, `border-line`, `shadow-glow-accent-md`). Хардкода hex/rgba в компонентах нет. Светлая тема удалена, переключателя нет by design. Навигация на русском (`Планы`, `Попробовать`, `Изменения`), URL-слаги английские. Следующий шаг — [вставить нужное]. Прикладываю `SITE_HANDOFF.md` и `llm-export-site.md`. Продолжаем на русском, локальный запуск `npm run dev`.»