#!/usr/bin/env bash
set -euo pipefail

OUTPUT_ROOT="${1:?output root is required}"
MINIMUM_FREE_BYTES="${2:-0}"

case "$OUTPUT_ROOT" in
  /*) ;;
  *)
    echo "output root must be absolute" >&2
    exit 1
    ;;
esac

[[ "$MINIMUM_FREE_BYTES" =~ ^[0-9]+$ ]]
test "${RUNNER_ENVIRONMENT:-}" = "github-hosted"
test "${RUNNER_OS:-}" = "Linux"
test "${RUNNER_ARCH:-}" = "X64"

mkdir -p "$OUTPUT_ROOT"
chmod 0700 "$OUTPUT_ROOT"

capture_filesystem() {
  local label="$1"
  df -B1 -P / > "$OUTPUT_ROOT/${label}.filesystem.txt"
  df -i -P / > "$OUTPUT_ROOT/${label}.inodes.txt"
  docker system df > "$OUTPUT_ROOT/${label}.docker.txt"
}

available_bytes() {
  df -B1 --output=avail / | tail -n 1 | tr -d ' '
}

capture_filesystem before
BEFORE_BYTES="$(available_bytes)"

RECLAIM_PATHS=(
  /usr/local/lib/android
  /usr/share/dotnet
  /opt/ghc
  /usr/local/.ghcup
  /usr/share/swift
  /opt/hostedtoolcache/CodeQL
  /usr/local/share/boost
)

: > "$OUTPUT_ROOT/reclaimed-paths.tsv"
for path in "${RECLAIM_PATHS[@]}"; do
  if sudo test -e "$path"; then
    bytes="$(sudo du -sx -B1 "$path" | awk '{print $1}')"
    printf '%s\t%s\n' "$path" "$bytes" >> "$OUTPUT_ROOT/reclaimed-paths.tsv"
    sudo rm -rf --one-file-system -- "$path"
  else
    printf '%s\t0\n' "$path" >> "$OUTPUT_ROOT/reclaimed-paths.tsv"
  fi
done

docker system prune --all --force --volumes > "$OUTPUT_ROOT/docker-prune.txt"
sync

capture_filesystem after
AFTER_BYTES="$(available_bytes)"
RECLAIMED_BYTES="$((AFTER_BYTES - BEFORE_BYTES))"

jq -n -S \
  --argjson beforeBytes "$BEFORE_BYTES" \
  --argjson afterBytes "$AFTER_BYTES" \
  --argjson reclaimedBytes "$RECLAIMED_BYTES" \
  --argjson minimumFreeBytes "$MINIMUM_FREE_BYTES" \
  '{
    schemaVersion: "decantr-benchmark-hosted-runner-storage.v1",
    beforeBytes: $beforeBytes,
    afterBytes: $afterBytes,
    reclaimedBytes: $reclaimedBytes,
    minimumFreeBytes: $minimumFreeBytes,
    status: (if $afterBytes >= $minimumFreeBytes then "ready" else "insufficient" end)
  }' > "$OUTPUT_ROOT/summary.json"

test "$AFTER_BYTES" -ge "$MINIMUM_FREE_BYTES"
