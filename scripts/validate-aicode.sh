#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔍 Validating AICODE comments..."

RG_FLAGS=(--hidden --glob '!.git' --glob '!agent-rules.md' --glob '!AGENTS.md' --glob '!mb-rules.md' --glob '!scripts/validate-aicode.sh')

# Block multi-line AICODE comments (protocol requires single-line tags).
if rg -U 'AICODE-.*\n\s*(//|#|/\*)' "${RG_FLAGS[@]}" . >/dev/null; then
  echo "❌ Multi-line AICODE comments found. Keep each tag on a single line."
  exit 1
fi

# Guard against secrets accidentally added to AICODE comments.
if rg 'AICODE-.*\b(api[_-]?key|password|token|secret).*[:=]' "${RG_FLAGS[@]}" . >/dev/null; then
  echo "❌ Potential secrets detected inside AICODE comments. Remove sensitive data."
  exit 1
fi

# Ensure tags always use the AICODE- prefix (no bare WHY/TRAP/...).
if rg '^\s*(//|#|/\*)\s*(WHY|TRAP|LINK|TODO|ASK):' "${RG_FLAGS[@]}" . >/dev/null; then
  echo "❌ Found WHY/TRAP/LINK/TODO/ASK comments without the AICODE- prefix."
  exit 1
fi

echo "✅ AICODE validation passed."
