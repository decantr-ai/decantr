#!/usr/bin/env bash
set -euo pipefail

# Auto Mode Template for Decantr Monorepo
# Runs Claude Code headlessly on task files with pre-approved tools.
#
# Usage:
#   ./tools/auto-run.sh <task-file.md>       # Single task
#   ./tools/auto-run.sh --queue              # Process all tasks in queue/
#   ./tools/auto-run.sh --dry-run <file>     # Show what would run without executing
#   ./tools/auto-run.sh --help               # Show usage

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
QUEUE_DIR="$SCRIPT_DIR/auto-tasks/queue"
DONE_DIR="$SCRIPT_DIR/auto-tasks/done"
LOG_DIR="$PROJECT_DIR/logs/auto"

ALLOWED_TOOLS='Read,Write,Edit,Glob,Grep,Bash'

DRY_RUN=false

# --- Helpers ---

usage() {
  cat <<'USAGE'
Usage: auto-run.sh [OPTIONS] [TASK_FILE]

Options:
  --queue       Process all .md files in tools/auto-tasks/queue/
  --dry-run     Show the claude command without executing
  --help        Show this help message

Task file format:
  ---
  type: generate
  name: my-task
  ---
  Your prompt here...

Types: generate, refactor, style, component, debug
USAGE
}

timestamp() {
  date +"%Y-%m-%d-%H%M%S"
}

log_path() {
  local name="$1"
  echo "$LOG_DIR/$(timestamp)-${name}.log"
}

# Parse frontmatter from a task file.
# Sets: TASK_TYPE, TASK_NAME, TASK_BODY
parse_task() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    echo "Error: task file not found: $file" >&2
    return 1
  fi

  TASK_TYPE=""
  TASK_NAME=""
  TASK_BODY=""

  local in_frontmatter=false
  local frontmatter_done=false
  local body_lines=()

  while IFS= read -r line; do
    if [[ "$frontmatter_done" == false ]]; then
      if [[ "$line" == "---" && "$in_frontmatter" == false ]]; then
        in_frontmatter=true
        continue
      elif [[ "$line" == "---" && "$in_frontmatter" == true ]]; then
        in_frontmatter=false
        frontmatter_done=true
        continue
      elif [[ "$in_frontmatter" == true ]]; then
        # Parse key: value
        local key value
        key="$(echo "$line" | sed 's/:.*//' | xargs)"
        value="$(echo "$line" | sed 's/^[^:]*://' | xargs)"
        case "$key" in
          type) TASK_TYPE="$value" ;;
          name) TASK_NAME="$value" ;;
        esac
        continue
      fi
    fi
    body_lines+=("$line")
  done < "$file"

  TASK_BODY="$(printf '%s\n' "${body_lines[@]}")"

  # Fallback name from filename
  if [[ -z "$TASK_NAME" ]]; then
    TASK_NAME="$(basename "$file" .md)"
  fi
}

# Run a single task file
run_task() {
  local file="$1"
  local start_time end_time duration

  parse_task "$file" || return 1

  local logfile
  logfile="$(log_path "$TASK_NAME")"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Task:    $TASK_NAME"
  echo "Type:    ${TASK_TYPE:-none}"
  echo "Source:  $file"
  echo "Log:     $logfile"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "[DRY RUN] Would execute:"
    echo "  claude -p <prompt> --allowedTools '$ALLOWED_TOOLS'"
    echo ""
    echo "Prompt preview (first 500 chars):"
    echo "${TASK_BODY:0:500}"
    echo "..."
    return 0
  fi

  mkdir -p "$LOG_DIR"
  start_time=$(date +%s)

  # Run Claude Code in non-interactive mode
  # Use --output-format json since text mode writes to TTY, bypassing stdout.
  # Extract assistant text from JSON and write to log.
  local raw_json
  raw_json="$(mktemp)"

  if claude -p "$TASK_BODY" --output-format json --allowedTools "$ALLOWED_TOOLS" < /dev/null > "$raw_json" 2>&1; then
    # Extract assistant message text from JSON output
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
    end_time=$(date +%s)
    duration=$(( end_time - start_time ))
    echo ""
    cat "$logfile"
    echo ""
    echo "✓ Completed: $TASK_NAME (${duration}s)"
    echo "  Log: $logfile"
    return 0
  else
    # On failure, save raw output as log
    mv "$raw_json" "$logfile"
    end_time=$(date +%s)
    duration=$(( end_time - start_time ))
    echo ""
    echo "✗ Failed: $TASK_NAME (${duration}s)"
    echo "  Log: $logfile"
    return 1
  fi
}

# Process all tasks in the queue directory
run_queue() {
  local tasks=()
  local passed=0
  local failed=0
  local failed_names=()

  # Collect tasks alphabetically
  while IFS= read -r -d '' file; do
    tasks+=("$file")
  done < <(find "$QUEUE_DIR" -maxdepth 1 -name '*.md' -print0 | sort -z)

  if [[ ${#tasks[@]} -eq 0 ]]; then
    echo "No task files found in $QUEUE_DIR"
    return 0
  fi

  echo "Found ${#tasks[@]} task(s) in queue"
  echo ""

  for file in "${tasks[@]}"; do
    if run_task "$file"; then
      # Move to done on success
      mv "$file" "$DONE_DIR/"
      passed=$(( passed + 1 ))
    else
      # Leave in queue on failure
      failed=$(( failed + 1 ))
      failed_names+=("$(basename "$file")")
    fi
    echo ""
  done

  # Summary
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Queue Summary"
  echo "  Passed: $passed"
  echo "  Failed: $failed"
  if [[ $failed -gt 0 ]]; then
    echo "  Failed tasks (still in queue):"
    for name in "${failed_names[@]}"; do
      echo "    - $name"
    done
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  [[ $failed -eq 0 ]]
}

# --- Main ---

main() {
  local mode="single"
  local task_file=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --queue)
        mode="queue"
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --help|-h)
        usage
        exit 0
        ;;
      *)
        task_file="$1"
        shift
        ;;
    esac
  done

  if [[ "$mode" == "queue" ]]; then
    run_queue
  elif [[ -n "$task_file" ]]; then
    run_task "$task_file"
  else
    echo "Error: provide a task file or use --queue" >&2
    usage
    exit 1
  fi
}

main "$@"
