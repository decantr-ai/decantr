#!/bin/sh
HOOK_DIR="$(git rev-parse --show-toplevel)/.git/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ln -sf "$SCRIPT_DIR/pre-commit" "$HOOK_DIR/pre-commit"
echo "Pre-commit hook installed."
