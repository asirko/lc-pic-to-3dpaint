#!/bin/bash
set -e

# Detect version type from commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -n "$LAST_TAG" ]; then
  COMMITS=$(git log "$LAST_TAG"..HEAD --format="%s%n%b")
else
  COMMITS=$(git log --format="%s%n%b")
fi

if echo "$COMMITS" | grep -qiE "BREAKING[ -]CHANGE|^[a-z]+(\(.+\))?!:"; then
  VERSION_TYPE="major"
elif echo "$COMMITS" | grep -qE "^feat(\(.+\))?:"; then
  VERSION_TYPE="minor"
else
  VERSION_TYPE="patch"
fi

echo "Detected version bump: $VERSION_TYPE"

# 1. Bump version in package.json (no commit, no tag)
npm version "$VERSION_TYPE" --no-git-tag-version

# 2. Read new version
NEW_VERSION=$(node -p "require('./package.json').version")

# 3. Update changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# 4. Commit + tag
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): v$NEW_VERSION"
git tag "v$NEW_VERSION"

echo "Release v$NEW_VERSION created. Push with: git push && git push --tags"
