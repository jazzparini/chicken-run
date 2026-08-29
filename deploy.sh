#!/usr/bin/env bash
# Sube los cambios y dispara el deploy automático a Azure Static Web Apps.
set -e
cd "$(dirname "$0")"
msg="${1:-Update site}"
git add -A
git commit -m "$msg"
git push
