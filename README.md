<p align="center">
  <img src="icon.svg" alt="Pocket ID Logo" width="21%">
</p>

# Pocket ID on StartOS

> **Upstream docs:** <https://pocket-id.org/docs/introduction>
>
> Everything not listed in this document should behave the same as upstream
> Pocket ID. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable.

[Pocket ID](https://github.com/pocket-id/pocket-id) is a simple, self-hosted OIDC provider that lets users authenticate to your services with passkeys instead of passwords.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                  |
| ------------- | -------------------------------------- |
| Image         | `ghcr.io/pocket-id/pocket-id`          |
| Architectures | x86_64, aarch64                        |
| Entrypoint    | upstream entrypoint (`useEntrypoint()`) — handles PUID/PGID and chowns `/app/data` |

---

## Volume and Data Layout

| Volume | Mount Point  | Purpose                                                                |
| ------ | ------------ | ---------------------------------------------------------------------- |
| `main` | `/app/data`  | Pocket ID database (SQLite by default), key material, and `store.json` |

`store.json` lives at the root of the `main` volume and holds the StartOS-managed env values (`APP_URL`, `ENCRYPTION_KEY`, `TRUST_PROXY`).

---

## Installation and First-Run Flow

1. On install StartOS generates a fresh `ENCRYPTION_KEY` (44-char base62) into `store.json`.
2. The `.local` LAN URL is selected as the default primary URL (`APP_URL`); change it later via the **Set Primary URL** action.
3. Start the service. Once the web UI is reachable, browse to `/setup` and create the first admin account — Pocket ID's standard upstream onboarding.

There is no separate "config" wizard inside StartOS; everything else is configured from the Pocket ID admin UI.

---

## Configuration Management

StartOS owns these env vars (passed to the daemon, persisted in `store.json`):

| Variable         | Source                                        |
| ---------------- | --------------------------------------------- |
| `APP_URL`        | **Set Primary URL** action                    |
| `ENCRYPTION_KEY` | Generated once on install                     |
| `TRUST_PROXY`    | Hardcoded `true` (StartOS terminates TLS)     |

All other Pocket ID settings — LDAP, SMTP, OIDC clients, branding, etc. — are managed from inside the Pocket ID admin UI and persisted in the SQLite database under `/app/data`.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                              |
| --------- | ---- | -------- | ------------------------------------ |
| `http`    | 1411 | HTTP     | Web UI, OIDC endpoints, WebAuthn API |

WebAuthn (passkeys) requires HTTPS — use one of the StartOS-provided `.local`, Tor, or clearnet HTTPS URLs. Plain HTTP via raw IP will not let users register or use passkeys.

---

## Actions (StartOS UI)

| Action              | Purpose                                                                                                                                                           | Inputs                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Set Primary URL** | Choose which of the service's HTTP URLs is treated as the primary — used as `APP_URL`, the WebAuthn relying-party origin, and embedded in tokens / emails / links. | `url`: one of the available HTTP URLs   |

> **Warning:** Pocket ID scopes passkeys to the primary URL's hostname. Changing `APP_URL` after passkeys have been registered invalidates them; users will need to re-enroll.

---

## Backups and Restore

**Included in backup:**

- `main` volume — SQLite database, encryption key file (if any), and `store.json`

**Restore behavior:** the volume is restored before startup. `ENCRYPTION_KEY` is preserved (it must be: it decrypts the data).

---

## Health Checks

| Check         | Method                  | Grace period |
| ------------- | ----------------------- | ------------ |
| Web Interface | Port listening on 1411  | 30s          |

---

## Dependencies

None.

---

## Limitations and Differences

1. **SQLite only.** Pocket ID supports PostgreSQL upstream; this package runs the default embedded SQLite. Sufficient for typical home / small-org deployments.
2. **`MAXMIND_LICENSE_KEY` not exposed.** Optional GeoIP lookups are off until/unless this package surfaces an action for it.
3. **No SMTP wiring yet.** Configure email (for password resets, invites, etc.) from inside the Pocket ID admin UI.
4. **Primary URL coupling.** Because passkeys are scoped per hostname, treat the primary URL as effectively permanent once users start enrolling.

---

## What Is Unchanged from Upstream

- Admin UI, user UI, and `/setup` first-run flow
- OIDC endpoints and behavior
- LDAP integration (configure from the admin UI)
- Audit log, API tokens, custom claims, branding
- The image entrypoint, including PUID/PGID handling

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: pocket-id
image: ghcr.io/pocket-id/pocket-id
architectures: [x86_64, aarch64]
volumes:
  main: /app/data
ports:
  http: 1411
dependencies: none
startos_managed_env_vars:
  - APP_URL
  - ENCRYPTION_KEY
  - TRUST_PROXY
actions:
  - set-primary-url
```
