#!/usr/bin/env node
/**
 * Проверка контента собранной витрины.
 *
 * Что проверяет (и чего не проверяет):
 *   ✔ черновики, забытые в билд-артефактах (`data-draft`, `TODO:`/`FIXME:` в тексте);
 *   ✔ внутренние пометки продукта (`docs/internal`, `validum-dev`, `sprints/`, пути `D:\`);
 *   ✔ версия (package.json ↔ контракт ↔ страницы), устаревшие версии без оговорки;
 *   ✔ цифры: тесты, команды CLI, эндпоинты REST, банки справочника;
 *   ✔ внутренние ссылки на реально существующие страницы.
 *
 *   ✘ не проверяет правдивость текста — только наличие маркеров, чисел и ссылок.
 *
 * Запуск:  node scripts/check-new.mjs [--strict] [--root dist]
 * Код возврата: 0 — ошибок нет, 1 — есть ошибки (при --strict — и предупреждения).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const sourceMode = args.includes('--source');
const allowed = new Set(['--strict', '--source', '--root']);
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--root') { i++; continue; }
  if (!allowed.has(a)) {
    console.error(`FAIL: неизвестный аргумент "${a}". Допустимо: --strict, --source, --root <dir>`);
    process.exit(2);
  }
}
const rootArg = args.indexOf('--root');
const ROOT = rootArg >= 0 ? args[rootArg + 1] : 'dist';
if (rootArg >= 0 && (!args[rootArg + 1] || args[rootArg + 1].startsWith('--'))) {
  console.error('FAIL: после --root нужен каталог, например --root dist');
  process.exit(2);
}

const contract = await import('../src/lib/content-contract.mjs');
const {
  SITE_VERSION,
  EXPECTED_TEST_COUNT,
  EXPECTED_CLI_COMMANDS,
  EXPECTED_REST_ENDPOINTS,
  DEPRECATED_VERSIONS,
  SOFTENER,
  HISTORY_PATHS,
} = contract;

const sitePkg = JSON.parse(readFileSync('package.json', 'utf8'));


/** Все html-файлы билда: [{ file, url, html, text }]. */
function collect(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collect(full));
      continue;
    }
    if (!entry.endsWith('.html')) continue;
    const html = readFileSync(full, 'utf8');
    let url = '/' + relative(ROOT, full).split('\\').join('/');
    url = url.replace(/index\.html$/, '');
    if (!url.endsWith('/')) url += '/';
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');
    out.push({ file: full, url, html, text });
  }
  return out;
}

function collectSources(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectSources(full));
      continue;
    }
    if (!entry.endsWith('.astro')) continue;
    const text = readFileSync(full, 'utf8');
    out.push({ file: full, url: '/' + full.split('src/')[1], html: text, text });
  }
  return out;
}

let pages;
if (sourceMode) {
  pages = collectSources('src');
} else {
  if (!existsSync(ROOT)) {
    console.error(`FAIL: нет каталога "${ROOT}". Сначала: npm run build`);
    process.exit(1);
  }
  pages = collect(ROOT);
}

const fails = [];
const warns = [];

const isHistory = (url) =>
  HISTORY_PATHS.some((re) => re.test(url)) || /(changelog|roadmap)\.astro$/.test(url);
const near = (text, index, radius = 60) =>
  text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius));

// --- 0. Контракт и package.json не разъехались ---------------------------------
if (sitePkg.version !== SITE_VERSION) {
  fails.push(
    `package.json (${sitePkg.version}) ≠ контракт витрины (${SITE_VERSION}) — правь src/lib/content-contract.mjs`,
  );
}

// --- 1. Черновики в билд-артефактах -------------------------------------------
for (const p of pages) {
  if (/data-draft/i.test(p.html)) fails.push(`черновик в билде: ${p.url}`);
  for (const marker of ['TODO:', 'FIXME:', 'XXX:']) {
    if (p.text.includes(marker)) fails.push(`маркер «${marker}» в билде: ${p.url}`);
  }
}

// --- 2. Внутренние пометки продукта -------------------------------------------
const internalMarkers = [
  'docs/internal',
  'validum-dev',
  'validum-tests',
  'sprints/',
  'D:\\',
  'D:/',
  'HANDOFF',
  'test.ps1',
];
for (const p of pages) {
  for (const marker of internalMarkers) {
    if (p.html.includes(marker)) fails.push(`внутренняя пометка «${marker}» на ${p.url}`);
  }
}

// --- 3. Версии -----------------------------------------------------------------
const versionRe = /\b(0\.\d{1,2}\.\d{1,2})\b/g;
let versionOnHome = false;
for (const p of pages) {
  for (const m of p.text.matchAll(versionRe)) {
    const v = m[1];
    const known = v === SITE_VERSION || DEPRECATED_VERSIONS.includes(v);
    if (!known) continue;
    if (v === SITE_VERSION && p.url === '/') versionOnHome = true;
    if (v === SITE_VERSION) continue;
    if (SOFTENER.test(near(p.text, m.index))) continue;
    if (isHistory(p.url)) continue;
    warns.push(`устаревшая версия ${v} без оговорки: ${p.url}`);
  }
}
const versionWhere = sourceMode
  ? pages.some((p) => /Header\.astro$/.test(p.url) && p.text.includes(SITE_VERSION))
  : versionOnHome;
if (!versionWhere) {
  fails.push(
    sourceMode
      ? `версия ${SITE_VERSION} не найдена в src/components/Header.astro — бейдж витрины отстал`
      : `на главной нет текущей версии ${SITE_VERSION} — витрина выглядит устаревшей`,
  );
}

// --- 4. Цифры в тексте ---------------------------------------------------------
// Правило «цифра должна быть равна итогу» применимо только к итоговым заявлениям.
// «3 эндпоинта у validate» или «8 команд перечислены» — это не итог, такие числа не трогаем:
// поэтому у каждой проверки есть допустимый диапазон "похоже на итог".
const numberChecks = [
  {
    re: /(\d{2,4})\s*(?:тест|теста|тестов|ТК)/gi,
    expected: EXPECTED_TEST_COUNT,
    what: 'тестов',
    plausible: (n) => n >= 100 && n <= 5000,
  },
  {
    re: /(\d{1,2})\s*(?:команд[аы]?|команд(?=\s))/gi,
    expected: EXPECTED_CLI_COMMANDS,
    what: 'команд CLI',
    plausible: (n) => n >= 5 && n <= 15,
  },
  {
    re: /(\d{1,3})\s*(?:REST-)?эндпоинт/gi,
    expected: EXPECTED_REST_ENDPOINTS,
    what: 'эндпоинтов',
    plausible: (n) => n >= 10 && n <= 30,
  },
];

for (const p of pages) {
  for (const check of numberChecks) {
    for (const m of p.text.matchAll(check.re)) {
      const value = Number(m[1]);
      const context = near(p.text, m.index);
      if (value === check.expected) continue;
      if (!check.plausible(value)) continue;
      if (SOFTENER.test(context)) continue;
      if (isHistory(p.url)) continue;
      warns.push(`число «${m[0].trim()}» (ожидается ${check.expected} ${check.what}): ${p.url}`);
    }
  }
  for (const m of p.text.matchAll(/(\d{3,4})\s*(?:банк|банков|банка)/gi)) {
    const value = Number(m[1]);
    if (value >= 300 && value <= 400 && !SOFTENER.test(near(p.text, m.index)) && !isHistory(p.url)) {
      warns.push(`точное число банков «${m[0].trim()}» — пиши «около 370»: ${p.url}`);
    }
  }
}

// --- 5. Внутренние ссылки существуют (только в режиме билда) -------------------
if (!sourceMode) for (const p of pages) {
  for (const m of p.html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (href.startsWith('/_astro/') || href.startsWith('/diagrams/') || /\.[a-z]{2,4}$/i.test(href)) {
      continue;
    }
    const target = href.endsWith('/') ? join(ROOT, href, 'index.html') : join(ROOT, href);
    const asHtml = existsSync(target) || existsSync(target + '.html') || existsSync(join(ROOT, href, 'index.html'));
    if (!asHtml) warns.push(`битая ссылка ${href} на ${p.url}`);
  }
}

// --- Отчёт ---------------------------------------------------------------------
const uniq = (xs) => [...new Set(xs)];
const F = uniq(fails);
const W = uniq(warns);

console.log(`Проверено страниц: ${pages.length} (контракт: ${SITE_VERSION}, тестов ${EXPECTED_TEST_COUNT})`);
if (F.length) {
  console.log(`\nОШИБКИ (${F.length}):`);
  F.forEach((x) => console.log(`  ✗ ${x}`));
}
if (W.length) {
  console.log(`\nПРЕДУПРЕЖДЕНИЯ (${W.length}):`);
  W.forEach((x) => console.log(`  ! ${x}`));
}
if (!F.length && !W.length) console.log('\nЧисто.');

process.exit(F.length > 0 || (strict && W.length > 0) ? 1 : 0);
