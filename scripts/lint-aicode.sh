#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v rg >/dev/null 2>&1; then
  echo "❌ Требуется ripgrep (rg) для проверки AICODE-якорей." >&2
  exit 1
fi

EXCLUDE_GLOB='!{.git,node_modules,.nuxt,.output,dist,build,.cache}'
VALIDATION_EXCLUDES=(--glob '!docs/**' --glob '!*.[mM][dD]' --glob '!*.bak')
RG="rg --pcre2"

echo "👉 Текущие AICODE-якоря (держите их в фокусе перед изменениями):"
$RG -n --hidden --glob "$EXCLUDE_GLOB" "AICODE-" .

# Проверяем, что используются только разрешённые префиксы.
if $RG -n --hidden --glob "$EXCLUDE_GLOB" "${VALIDATION_EXCLUDES[@]}" 'AICODE-(?!NOTE|TODO|CONTRACT|TRAP|LINK|ASK)[A-Z]+:' .; then
  echo "❌ Найдены неизвестные AICODE-префиксы. Разрешены NOTE/TODO/CONTRACT/TRAP/LINK/ASK." >&2
  exit 1
fi

# Долгоживущие теги должны содержать дату.
if $RG -n --hidden --glob "$EXCLUDE_GLOB" "${VALIDATION_EXCLUDES[@]}" 'AICODE-(TRAP|CONTRACT):(?!.*[0-9]{4}-[0-9]{2}-[0-9]{2})' .; then
  echo "❌ Теги TRAP/CONTRACT должны содержать дату в формате [YYYY-MM-DD]." >&2
  exit 1
fi

echo "✅ AICODE-якоря выглядят валидно."
