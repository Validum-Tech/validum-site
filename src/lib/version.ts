/**
 * Типизированный фасад над `content-contract.mjs`.
 *
 * Значения живут в `.mjs`, чтобы их читал скрипт `scripts/check-new.mjs`
 * обычным `node` (без сборщика). Страницы импортируют отсюда.
 */

export {
  SITE_VERSION,
  EXPECTED_TEST_COUNT,
  EXPECTED_CLI_COMMANDS,
  EXPECTED_REST_ENDPOINTS,
  DEPRECATED_VERSIONS,
  SOFTENER,
  HISTORY_PATHS,
} from './content-contract.mjs';
