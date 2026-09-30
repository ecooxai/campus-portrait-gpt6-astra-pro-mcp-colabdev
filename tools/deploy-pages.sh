#!/usr/bin/env bash
# Publish only this project's generated files, preserving the editable source branch.
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
repo='ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev'
branch='gpt6-astra-pro-mcp-colabdev/site'
site_base='/campus-portrait-gpt6-astra-pro-mcp-colabdev/'
build='/build/campus-portrait-pages-gpt6-astra-pro-mcp-colabdev'
stage="$project_dir/.agentwork/pages-likeness85-gpt6-astra-pro-mcp-colabdev"
remote="https://github.com/$repo.git"
command -v gh >/dev/null
mkdir -p "$stage"
BASE_URL="$site_base" BUILD_DIR="$build" npm run build
if [[ ! -d "$stage/.git" ]]; then
  git -c credential.helper= -c 'credential.helper=!gh auth git-credential' clone --depth 1 --single-branch --branch "$branch" "$remote" "$stage"
fi
# Both paths are owned deployment directories; never mirror the source project root.
cp -a "$build/." "$stage/"
: > "$stage/.nojekyll"
git -C "$stage" add -A
if ! git -C "$stage" diff --cached --quiet; then
  git -C "$stage" -c user.name='GPT-6 Astra Pro mcp-colabdev' -c user.email='character-studio@local.invalid' commit -m 'Deploy verified character studio checkpoint'
fi
git -C "$stage" -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -u origin "$branch"
request="$project_dir/.agentwork/pages-request.json"
printf '{"build_type":"legacy","source":{"branch":"%s","path":"/"}}\n' "$branch" > "$request"
if gh api "repos/$repo/pages" > .agentwork/pages-current.json 2>.agentwork/pages-api-error.log; then
  gh api --method PUT "repos/$repo/pages" --input "$request" > .agentwork/pages-configured.json
else
  if ! grep -q '404' .agentwork/pages-api-error.log; then
    cat .agentwork/pages-api-error.log >&2
    exit 1
  fi
  gh api --method POST "repos/$repo/pages" --input "$request" > .agentwork/pages-configured.json
fi
gh api "repos/$repo/pages" --jq .html_url > .agentwork/PAGES_URL.txt
printf 'Pages URL: '; cat .agentwork/PAGES_URL.txt
printf 'Publishing source branch: %s\n' "$branch"
printf 'Inspect status: gh api repos/%s/pages/builds/latest --jq .status\n' "$repo"
