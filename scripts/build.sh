#!/bin/bash
set -e

filter=${1:-"@lumeland/*"}
dist="./dist"

rm -rf "$dist"
mkdir -p "$dist"

# Test, lint and build
pnpm test
pnpm lint
pnpm build

# Generate tarballs files
pnpm pack --out "$dist/%s.tgz"
rm -rf build

# Extract tarballs
tar -xzf "$tgz" -C "$out" --strip-components=1
rm "$dist/%s.tgz"

# Final tweaks
node scripts/build.ts
pnpm exec oxfmt dist/**/*
