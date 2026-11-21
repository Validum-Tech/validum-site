# validum.tech — сайт проекта Validum

Статический сайт-витрина и документация продукта [Validum](https://github.com/Validum-Tech/validum).
Собирается на Astro, деплоится на GitHub Pages автоматически при пуше в `main`.

## Стек

- **Astro 7** — статическая генерация, без серверного рантайма
- **React 19** — один островок (`src/components/TryForm.tsx`)
- **Tailwind 4** — через `@tailwindcss/vite`
- **Node 22.23.4+**

## Локальная работа

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # статика в dist/
npm run preview   # предпросмотр собранной версии
```

## Оформление

Визуальный язык — «редакционный постер» (выбран в спринте W53 по макету V11):
крупная типографика, волосяные рамки 1px, моно-подписи капсом, никаких скруглений и свечений.

| Класс (global.css) | Назначение |
|---|---|
| `.kicker`, `.kicker-quiet` | надзаголовок-рубрика (моно, капс, tracking .2em) |
| `.label` | мелкая подпись поля/таблицы |
| `.poster`, `.poster-hero`, `.poster-sm` | заголовки-постеры (clamp, line-height .92–.95, tracking −.04em) |
| `.poster-out` | контурное начертание (`-webkit-text-stroke`, есть фолбэк) |
| `.rule` | горизонтальная волосяная линия |
| `.hairline` | контейнер с рамкой 1px и радиусом 3px |
| `.num`, `.num-xl` | цифры: моно + табличные цифры; янтарь — через `text-metric` |
| `.btn-solid`, `.btn-hairline` | кнопки (заливка изумрудом / рамка) |
| `.link-arrow` | текстовая ссылка-действие капсом |
| `.flow-mask` | маска-растворение для бегущих лент |

Правила: изумруд (`text-accent`) — действия и валидные данные, янтарь (`text-metric`) — числа,
красный (`text-danger`) — отказы АБС. Свечения (`--page-glow-*`) приглушены до 4–6%,
`prefers-reduced-motion` выключает счётчики, ленты и тикер на главной.

## Структура

```
src/
├── layouts/BaseLayout.astro   ← <html lang="ru" class="dark">, шапка/подвал
├── components/                ← Header, Footer, home/*, TryForm
├── pages/                     ← index, docs, architecture, roadmap, try, security, changelog
└── styles/global.css          ← единственный источник цветов (токены Tailwind)
public/
├── diagrams/                  ← интерактивная схема архитектуры (HTML + PNG-постер)
├── CNAME                      ← www.validum.tech
└── favicon.svg
```

## Правила

- Только тёмная тема: цвета берутся из токенов `global.css`, хардкод `#hex`/`rgba()` в компонентах не используется.
- Метки интерфейса — по-русски, URL-слаги — латиницей.
- Сборка проверяется перед пушем: `npm run build` должен проходить без ошибок.

## Ветки и деплой

| Ветка | Назначение | Деплой |
|---|---|---|
| `main` | прод: то, что видят пользователи | GitHub Pages, автоматически |
| `dev` | разработка: черновики, эксперименты | нет |

Работа идёт в `dev`. `main` — это опубликованный сайт: push в него запускает деплой, поэтому
`dev → main` мержится только при выпуске релиза (или чтобы срочно поправить ошибку на проде).
Перед PR: `npm run build` и `npm run preview`.
