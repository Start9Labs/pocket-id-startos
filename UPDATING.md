# Updating the upstream version

Upstream is the prebuilt image `ghcr.io/pocket-id/pocket-id`, pinned by release tag.

## Determining the upstream version

The pin is `dockerVersion` in `startos/manifest/index.ts`. The latest release:

```sh
gh release view -R pocket-id/pocket-id --json tagName -q .tagName
```

Confirm the tag's image index carries both `linux/amd64` and `linux/arm64` before bumping.

## Applying the bump

1. Set `dockerVersion` in `startos/manifest/index.ts` to the new tag, keeping its `v` prefix.
2. Set `version` in `startos/versions/current.ts` to the tag without the `v`, followed by `:0`, and rewrite `releaseNotes`.
3. Read the upstream release notes for new required environment variables; `startos/main.ts` passes the daemon's environment.
