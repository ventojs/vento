#!/bin/bash
set -e

rm -rf dist
mkdir -p dist

# Test, lint and build
pnpm test
pnpm lint
pnpm build

# Generate tarballs files
pnpm pack --out dist.tgz
rm -rf build

# Extract tarballs
tar -xzf "dist.tgz" -C dist --strip-components=1
rm dist.tgz

# Final tweaks
node scripts/build.ts
pnpm exec oxfmt dist/**/*
