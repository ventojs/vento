#!/bin/bash
set -e

sh ./scripts/build.sh

pnpm publish --access public --dir dist --no-git-checks
rm -rf dist
