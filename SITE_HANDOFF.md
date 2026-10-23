# 📋 Validum Site — Handoff Document

> **Дата обновления:** 23 октября 2026
> **Статус:** Сайт запущен на `https://validum.tech`. Лендинг, документация и интерактивный генератор кода (Try it) готовы.

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
| Генератор | **Astro** | 5.x (static output) |
| Интерактив | **React** | 19.x (islands architecture) |
| Стили | **Tailwind CSS** | 4.x |
| Шрифты | Inter, JetBrains Mono | self-hosted / fallback |
| CI/CD | GitHub Actions | Node.js 22.23.4 |
| DNS/CDN | Cloudflare | DNS only (серое облако!) |

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
│   │   └── BaseLayout.astro      ← Каркас (html, head, скрипт темы)
│   ├── components/
│   │   ├── Header.astro          ← Шапка с навигацией
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
│   │   ├── roadmap.astro         ← Roadmap
│   │   ├── changelog.astro       ← История версий
│   │   └── security.astro        ← Безопасность
│   └── styles/
│       └── global.css            ← Tailwind + CSS-переменные для тем
├── astro.config.mjs
└── package.json
```

---

## 🎨 Ключевые технические решения

### 1. Темизация (Светлая / Тёмная)
- Управляется классом `dark` или `light` на теге `<html>`.
- Все цвета вынесены в CSS-переменные в `global.css` (`--bg-main`, `--text-main`, `--color-accent` и т.д.).
- В `BaseLayout.astro` есть inline-скрипт, который читает `localStorage` и ставит тему ДО загрузки страницы (чтобы не было мигания).
- Переключатель темы находится в `Header.astro`.

### 2. Hero-анимация (Конвейер)
- Реализована на чистом CSS (keyframes) в `Hero.astro`.
- Слева летят красные карточки (битые данные), в центре крутится 3D-медальон, справа вылетают зеленые (валидные).
- **Тайминги:** Цикл 15 секунд. Красные летят каждые 3 секунды. Зеленые появляются с задержкой 0.3с от красных.
- 3D-медальон: две стороны (Щит с галочкой и V с ветвями), крутится с паузами.

### 3. Генератор `TryForm.tsx` (Islands)
- Имитирует работу API (Mock-режим).
- **Реализует реальные каскады:** если выбрать `age=16` и `region=MOSCOW`, `familyStatus` станет `SINGLE`, паспорт будет выдан в 14 лет, серия начнется на 77.
- **4 вкладки результата:**
   - **JSON**: как ответит REST API.
   - **Java**: готовый код для `IndividualProfileGenerator.builder()...`
   - **cURL**: команда для терминала.
   - **CLI**: команда для fat JAR.
- Кнопка **COPY** на каждой вкладке.
- Вверху страницы (`try.astro`) честно написано, что это Mock, и даны инструкции по запуску реального API (Docker, CLI, Java).

---

## 🚀 Как деплоить (Важно!)

1. **Локальная разработка:** `npm run dev` (открывается на `http://localhost:4321`).
2. **Сборка:** `npm run build` (проверка, что нет ошибок TypeScript/Astro).
3. **Деплой:** Просто сделай `git push origin main`.
   - GitHub Actions (`.github/workflows/deploy.yml`) автоматически соберет сайт и выкатит его.
   - **Критически важно:** В workflow жестко зафиксирован Node.js `22.23.4`. Не меняй, иначе Astro упадет.

### ⚠️ Нюансы домена и DNS
- Домен куплен на **reg.ru**, но NS-серверы переключены на **Cloudflare**.
- В Cloudflare созданы 4 A-записи (для `@`) и 1 CNAME (для `www`).
- **Все записи должны быть в режиме `DNS only` (серое облако)!** Если включить Proxied (оранжевое), GitHub Pages перестанет видеть домен и выдаст `InvalidDNSError`.
- Файл `public/CNAME` должен содержать `www.validum.tech`.

---

## 🗺️ Что сделано и что дальше

### ✅ Сделано
- [x] Инициализация Astro + React + Tailwind.
- [x] Светлая/тёмная тема (CSS-переменные).
- [x] Главная страница (Hero, Quick Start, Features, Comparison, Security, CTA).
- [x] Страница документации (все 16 эндпоинтов, CLI, Java).
- [x] Страницы Roadmap, Changelog, Security.
- [x] Интерактивный `Try it` (Mock-генератор JSON и кода на Java/CLI/cURL).
- [x] Деплой на GitHub Pages + домен `validum.tech`.

### ⏭️ Следующие шаги (Roadmap сайта)
1. **Реальный API:** Прикрутить `validum-api` (Docker) к `/try` через `PUBLIC_API_URL` (когда появится VPS).
2. **P1.1 Maven Central:** Опубликовать `validum-core` и добавить в Docs реальные зависимости.
3. **P4.1 Импорт CSV:** Добавить страницу с демонстрацией импорта.

---

## 🗣️ Что сказать в новом чате

> «Проект Validum Site. Astro 5 + React islands + Tailwind. Сайт задеплоен на `validum.tech` через GitHub Pages. Есть главная с CSS-анимацией конвейера, страница документации и Mock-генератор кода `/try`. Деплой автоматический через `git push main` (Node 22.23.4). DNS управляется через Cloudflare (только серые облака). Следующий шаг — [вставить нужное]. Прикладываю `SITE_HANDOFF.md` и `llm-export-site.md`. Продолжаем на русском, локальный запуск `npm run dev`.»