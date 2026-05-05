## How the upstream version is pulled
- `startos/manifest/index.ts` splits the upstream image into `dockerImage` (`ghcr.io/pocket-id/pocket-id`) and `dockerVersion` (`vX.Y.Z`) consts that are template-stringed into `dockerTag`. Keep them split — see notes below.

## Build gotcha (do not regress)
- `s9pk.mk` derives `PACKAGE_ID` via `awk -F"'" '/id:/ {print $2}' startos/manifest/index.ts`. The upstream docker tag contains the substring `id:` (`pocket-id/pocket-id`), so a single-quoted `dockerTag: '…/pocket-id:vX.Y.Z'` line makes `PACKAGE_ID` multi-valued and `make` fails with "multiple target patterns. Stop." Keep `dockerImage` / `dockerVersion` split into separate `const`s and template-string them; do not put the literal `id:` substring in any quoted value or comment in this file.

## Upstream
- Pocket ID — passkey-first OIDC provider. Repo: <https://github.com/pocket-id/pocket-id>. Image: `ghcr.io/pocket-id/pocket-id` (x86_64 + aarch64).
