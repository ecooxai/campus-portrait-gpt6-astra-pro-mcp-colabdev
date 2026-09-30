#!/usr/bin/env bash
set -euo pipefail
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
repo='ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev'
branch='gpt6-astra-pro-mcp-colabdev/site'
stage="$root/.agentwork/pages-likeness95-gpt6-astra-pro-mcp-colabdev"
build='/build/campus-portrait-pages-gpt6-astra-pro-mcp-colabdev'
if [[ ! -d "$stage/.git" ]]; then
  git clone --quiet --depth 1 --single-branch --branch "$branch" "https://github.com/$repo.git" "$stage"
else
  git -C "$stage" fetch --quiet origin "$branch"
  git -C "$stage" merge --ff-only "origin/$branch"
fi
BASE_URL='/campus-portrait-gpt6-astra-pro-mcp-colabdev/' BUILD_DIR="$build" npm run build
cp -a "$build/." "$stage/"
: > "$stage/.nojekyll"
git -C "$stage" add -A
if ! git -C "$stage" diff --cached --quiet; then
  git -C "$stage" -c user.name='GPT-6 Astra Pro mcp-colabdev' -c user.email='character-studio@local.invalid' commit --quiet -m 'Publish verified character checkpoint and review evidence'
fi
git -C "$stage" -c credential.helper= -c 'credential.helper=!gh auth git-credential' push --quiet origin "$branch"
printf 'Published site commit: '
git -C "$stage" rev-parse HEAD
printf 'Preview: https://ecooxai.github.io/campus-portrait-gpt6-astra-pro-mcp-colabdev/\n'
