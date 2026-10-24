#!/usr/bin/env bash
# badges-meta CI sanity: the threshold gate must hold across all paths.
#  - path A: below threshold  -> no badge rendered (comment sentinel)
#  - path B: above threshold  -> badge rendered   (shields.io link present)
#  - path C: strict, no data  -> exit 1
set -euo pipefail
cd "$(dirname "$0")/.."

M="node module/badges-meta/badges-meta.mjs"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# A: all metrics below default threshold -> nothing rendered
printf '{"stargazers_count":3,"open_issues_count":1}' > "$TMP/low.json"
A="$($M owner/repo --data "$TMP/low.json")"
if ! grep -q "nothing rendered" <<<"$A"; then
  echo "FAIL: path A expected 'nothing rendered', got: $A"; exit 1
fi
echo "  ✓ below-threshold drops badge row"

# B: stars high -> shield rendered
printf '{"stargazers_count":250,"open_issues_count":12}' > "$TMP/high.json"
B="$($M owner/repo --data "$TMP/high.json")"
if ! grep -q "img.shields.io" <<<"$B"; then
  echo "FAIL: path B expected a shields badge, got: $B"; exit 1
fi
echo "  ✓ above-threshold renders badge"

# C: strict + no data -> nonzero exit
if $M owner/repo --strict >/dev/null 2>&1; then
  echo "FAIL: path C expected nonzero exit"; exit 1
fi
echo "  ✓ strict-without-data fails the build"

echo "badges-meta sanity: all paths OK"