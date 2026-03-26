#!/usr/bin/env bash
set -euo pipefail

# Auto Mode for Decantr Monorepo
# Runs Claude Code headlessly on queued task files.
#
# Usage:
#   ./tools/auto-run.sh --queue              # Process all tasks in queue/
#   ./tools/auto-run.sh <task-file.md>       # Single task
#   ./tools/auto-run.sh --dry-run <file>     # Preview without executing

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
QUEUE_DIR="$SCRIPT_DIR/auto-tasks/queue"
DONE_DIR="$SCRIPT_DIR/auto-tasks/done"
LOG_DIR="$PROJECT_DIR/logs/auto"

ALLOWED_TOOLS='Read,Write,Edit,Glob,Grep,Bash(pnpm *),Bash(cd *),Bash(node *),Bash(git *),Bash(ls *),Bash(mkdir *),Bash(cp *)'

DRY_RUN=false

timestamp() { date +"%Y-%m-%d-%H%M%S"; }
log_path() { echo "$LOG_DIR/$(timestamp)-${1}.log"; }

parse_task() {
  local file="$1"
  [[ -f "$file" ]] || { echo "Error: $file not found" >&2; return 1; }

  TASK_TYPE="" TASK_NAME="" TASK_BODY=""
  local in_fm=false fm_done=false body_lines=()

  while IFS= read -r line; do
    if [[ "$fm_done" == false ]]; then
      if [[ "$line" == "---" && "$in_fm" == false ]]; then in_fm=true; continue
      elif [[ "$line" == "---" && "$in_fm" == true ]]; then in_fm=false; fm_done=true; continue
      elif [[ "$in_fm" == true ]]; then
        local key value
        key="$(echo "$line" | sed 's/:.*//' | xargs)"
        value="$(echo "$line" | sed 's/^[^:]*://' | xargs)"
        case "$key" in type) TASK_TYPE="$value" ;; name) TASK_NAME="$value" ;; esac
        continue
      fi
    fi
    body_lines+=("$line")
  done < "$file"

  TASK_BODY="$(printf '%s\n' "${body_lines[@]}")"
  [[ -z "$TASK_NAME" ]] && TASK_NAME="$(basename "$file" .md)"
}

run_task() {
  local file="$1"
  parse_task "$file" || return 1
  local logfile; logfile="$(log_path "$TASK_NAME")"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Task:   $TASK_NAME"
  echo "Type:   ${TASK_TYPE:-auto}"
  echo "Source: $file"
  echo "Log:    $logfile"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [[ "$DRY_RUN" == true ]]; then
    echo "[DRY RUN] Would execute claude -p with ${#TASK_BODY} chars"
    return 0
  fi

  mkdir -p "$LOG_DIR"
  local start_time; start_time=$(date +%s)
  local raw_json; raw_json="$(mktemp)"

  if (cd "$PROJECT_DIR" && claude -p "$TASK_BODY" --output-format json --allowedTools "$ALLOWED_TOOLS" < /dev/null > "$raw_json" 2>&1); then
    python3 -c "
import sys, json
data = json.load(open('$raw_json'))
for msg in data:
    if msg.get('type') == 'assistant':
        for block in msg.get('message', {}).get('content', []):
            if block.get('type') == 'text':
                print(block['text'])
" > "$logfile"
    rm -f "$raw_json"
    local duration=$(( $(date +%s) - start_time ))
    echo ""; cat "$logfile"; echo ""
    echo "✓ Completed: $TASK_NAME (${duration}s)"
    return 0
  else
    mv "$raw_json" "$logfile"
    local duration=$(( $(date +%s) - start_time ))
    echo "✗ Failed: $TASK_NAME (${duration}s)"
    return 1
  fi
}

run_queue() {
  local tasks=() passed=0 failed=0 failed_names=()
  while IFS= read -r -d '' file; do tasks+=("$file"); done < <(find "$QUEUE_DIR" -maxdepth 1 -name '*.md' -print0 | sort -z)

  [[ ${#tasks[@]} -eq 0 ]] && { echo "No tasks in queue"; return 0; }
  echo "Found ${#tasks[@]} task(s) — estimated $(( ${#tasks[@]} * 15 )) minutes"
  echo ""

  for file in "${tasks[@]}"; do
    if run_task "$file"; then
      mv "$file" "$DONE_DIR/"; passed=$(( passed + 1 ))
    else
      failed=$(( failed + 1 )); failed_names+=("$(basename "$file")")
    fi
    echo ""
  done

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Queue: $passed passed, $failed failed"
  [[ $failed -gt 0 ]] && printf '  Still in queue: %s\n' "${failed_names[@]}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  [[ $failed -eq 0 ]]
}

# --- Main ---
mode="single"; task_file=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --queue) mode="queue"; shift ;; --dry-run) DRY_RUN=true; shift ;;
    --help|-h) echo "Usage: auto-run.sh [--queue|--dry-run] [task.md]"; exit 0 ;;
    *) task_file="$1"; shift ;;
  esac
done

if [[ "$mode" == "queue" ]]; then run_queue
elif [[ -n "$task_file" ]]; then run_task "$task_file"
else echo "Usage: auto-run.sh [--queue] [task.md]"; exit 1; fi
