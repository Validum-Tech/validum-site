#!/usr/bin/env node
/**
 * Добавляет в экспортированную archify-диаграмму кнопку возврата на сайт.
 *
 * Зачем: public/diagrams/*.html — самостоятельный документ со своим тулбаром,
 * навигации сайта в нём нет. Открытый в новой вкладке, он становится тупиком:
 * выйти можно только кнопкой «назад» браузера или закрытием вкладки.
 *
 * Скрипт идемпотентный: если ссылка уже вставлена (маркер data-validum-back),
 * файл не меняется. Поэтому его безопасно гонять после каждой перегенерации
 * диаграммы в archify.
 *
 * Запуск:  node tools/patch-diagram-nav.mjs
 * Проверка: node tools/patch-diagram-nav.mjs --check   (только отчёт, без записи)
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIAGRAMS_DIR = join(ROOT, 'public', 'diagrams');
const CHECK_ONLY = process.argv.includes('--check');

const MARKER = 'data-validum-back';

/**
 * Вниз по стеку archify CSS-переменных: --panel/--panel-border/--text
 * определены в теме диаграммы, фолбэки страхуют от переименования в новой версии.
 */
const BACK_LINK = `    <a ${MARKER}="1" href="../" title="Вернуться на сайт Validum" aria-label="Вернуться на сайт Validum"
       style="display:inline-flex;align-items:center;gap:0.375rem;height:2.25rem;padding:0 0.75rem;margin-right:0.375rem;
              border:1px solid var(--panel-border, rgba(148,163,184,0.35));border-radius:0.6875rem;
              background:color-mix(in srgb, var(--panel, #ffffff) 78%, transparent);
              backdrop-filter:blur(12px);color:var(--text-muted, var(--text, #334155));
              font-family:inherit;font-size:0.8125rem;line-height:1;text-decoration:none;white-space:nowrap;
              box-shadow:0 1px 2px rgba(15,23,42,0.06);transition:color .14s ease, border-color .14s ease;">← На сайт</a>
`;

const TOOLBAR_OPEN = /(<div class="toolbar" role="toolbar" aria-label="Действия с диаграммой">\r?\n)/;

const files = (await readdir(DIAGRAMS_DIR)).filter((f) => f.endsWith('.html'));
if (files.length === 0) {
  console.error('нет html-файлов в public/diagrams');
  process.exit(1);
}

let changed = 0;
let failed = 0;

for (const file of files) {
  const path = join(DIAGRAMS_DIR, file);
  const html = await readFile(path, 'utf8');

  if (html.includes(MARKER)) {
    console.log(`✓ ${file}: ссылка уже есть`);
    continue;
  }
  if (!TOOLBAR_OPEN.test(html)) {
    console.error(`✗ ${file}: не найден тулбар archify — разметка изменилась, патч не применён`);
    failed++;
    continue;
  }
  if (CHECK_ONLY) {
    console.log(`⋯ ${file}: ссылки нет (нужен патч)`);
    continue;
  }

  const patched = html.replace(TOOLBAR_OPEN, `$1${BACK_LINK}`);
  await writeFile(path, patched, 'utf8');
  console.log(`✓ ${file}: ссылка «← На сайт» добавлена (${(patched.length - html.length)} байт)`);
  changed++;
}

console.log(`\nфайлов: ${files.length}, изменено: ${changed}, ошибок: ${failed}`);
if (failed > 0) process.exit(1);
