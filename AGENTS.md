# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

## This repo

- Keep the image split into `dockerImage` and `dockerVersion` in `startos/manifest/index.ts` and template them into `dockerTag`. `s9pk.mk` reads the package id with `awk -F"'" '/id:/'`, and `pocket-id/pocket-id:` contains `id:`; a single-quoted tag, or that substring in a comment in this file, makes `make` fail with "multiple target patterns".
