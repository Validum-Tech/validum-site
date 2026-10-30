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

Работа идёт в `dev`, в `main` попадает только проверенная сборка (`npm run build` + просмотр `npm run preview`).
