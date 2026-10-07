#!/usr/bin/env bash
# Post-deploy cache check (.playbook/stacks/vinext-cloudflare/caching.md).
# Usage: bash scripts/check-cache.sh https://<production host>
set -euo pipefail
base="${1:?usage: bash scripts/check-cache.sh https://<production host>}"

# Edit both lists: public routes must come from Workers Cache, per-user never.
public_routes=(/)
per_user_routes=(/dashboard)

cache_status() { curl -s -o /dev/null -D - "$base$1" | tr -d '\r' | awk -F': ' 'tolower($1)=="x-vinext-cache"{print $2}'; }
for path in "${public_routes[@]}"; do
  cache_status "$path" >/dev/null
  case "$(cache_status "$path")" in HIT|UPDATING) ;; *) echo "public page not cached: $path"; exit 1 ;; esac
done
for path in "${per_user_routes[@]}"; do
  case "$(cache_status "$path")" in HIT|UPDATING) echo "per-user page served from cache: $path"; exit 1 ;; esac
done
echo "cache check passed"
