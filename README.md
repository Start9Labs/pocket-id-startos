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
- [Connecting Client Services](#connecting-client-services)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| Image         | `ghcr.io/pocket-id/pocket-id`                                                      |
| Architectures | x86_64, aarch64                                                                    |
| Entrypoint    | upstream entrypoint (`useEntrypoint()`) — handles PUID/PGID and chowns `/app/data` |

---

## Volume and Data Layout

| Volume | Mount Point | Purpose                                                                |
| ------ | ----------- | ---------------------------------------------------------------------- |
| `main` | `/app/data` | Pocket ID database (SQLite by default), key material, and `store.json` |

`store.json` lives at the root of the `main` volume and holds the StartOS-managed env values (`APP_URL`, `ENCRYPTION_KEY`).

---

## Installation and First-Run Flow

1. On install StartOS generates a fresh `ENCRYPTION_KEY` (44-char base62) into `store.json`.
2. Install raises a critical **Set Primary URL** task; the service cannot start until it is run. No URL is preselected, and the choices are the interface's HTTPS domain addresses only, so the user must first add a public or private domain to the Web UI interface.
3. The first run of **Set Primary URL** raises an important **Create First Admin User** task. Once the service is running, that action returns `<APP_URL>/setup`, Pocket ID's upstream onboarding page, where the first admin registers a passkey.

There is no separate "config" wizard inside StartOS; everything else is configured from the Pocket ID admin UI.

---

## Configuration Management

StartOS owns these env vars passed to the daemon. `APP_URL` and `ENCRYPTION_KEY` are persisted in `store.json`:

| Variable         | Source                                                         |
| ---------------- | -------------------------------------------------------------- |
| `APP_URL`        | **Set Primary URL** action                                     |
| `ENCRYPTION_KEY` | Generated once on install                                      |
| `TRUST_PROXY`    | Hardcoded `true` in `startos/main.ts` (StartOS terminates TLS) |

All other Pocket ID settings — LDAP, SMTP, OIDC clients, branding, etc. — are managed from inside the Pocket ID admin UI and persisted in the SQLite database under `/app/data`.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                              |
| --------- | ---- | -------- | ------------------------------------ |
| `http`    | 1411 | HTTP     | Web UI, OIDC endpoints, WebAuthn API |

The primary URL (`APP_URL`) must be an HTTPS public or private domain on this interface. It is the OIDC issuer, and two parties must reach it at that exact URL:

- **The user's browser** — the login page and the WebAuthn ceremony. Passkeys need a secure context and a hostname, which rules out IP addresses.
- **Each client service's backend** — discovery, token exchange and signing keys. A client cannot be pointed at an internal address instead, because the issuer in the discovery document and in every token must match the URL the client was configured with.

`.local`, IP and Tor addresses are therefore not offered: StartOS DNS does not resolve `.local` for service containers, passkeys don't work on IPs, and client containers can't reach `.onion` without a Tor proxy.

| Primary URL                  | Client services that work                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Public domain, Let's Encrypt | Any OIDC-capable service                                                            |
| Public domain, Root CA       | Only those whose package trusts the StartOS Root CA                                 |
| Private domain               | Only those whose package trusts the StartOS Root CA, and only from the LAN or a VPN |

StartOS DNS answers private domains for service containers locally, so name resolution is not the obstacle for a private domain; certificate trust is. A client package trusts the Root CA by writing it into its container and pointing the runtime at it (for Node, `NODE_EXTRA_CA_CERTS` — see `uptime-kuma-startos/startos/main.ts`).

---

## Actions (StartOS UI)

| Action                      | Purpose                                                                                                                                                                                               | Inputs                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Set Primary URL**         | Choose which of the interface's HTTPS domain URLs is treated as the primary — used as `APP_URL`, the WebAuthn relying-party origin, and embedded in tokens / emails / links. Service must be stopped. | `url`: one of the HTTPS domain URLs |
| **Create First Admin User** | Hidden; surfaced as a task after the first primary URL is set. Returns `<APP_URL>/setup` as a copyable link and QR code. Service must be running.                                                     | none                                |

An init watcher monitors the primary URL and the interface's addresses, including after initial setup. If `APP_URL` is unset or its address is removed, StartOS raises a critical **Set Primary URL** task.

> **Warning:** Pocket ID scopes passkeys to the primary URL's hostname. Changing `APP_URL` after passkeys have been registered invalidates them; users will need to re-enroll.

---

## Backups and Restore

**Included in backup:**

- `main` volume — SQLite database, encryption key file (if any), and `store.json`

**Restore behavior:** the volume is restored before startup. `ENCRYPTION_KEY` is preserved (it must be: it decrypts the data).

---

## Health Checks

| Check         | Method                                                      | Grace period |
| ------------- | ----------------------------------------------------------- | ------------ |
| Web Interface | Port listening on 1411                                      | 30s          |
| Primary URL   | `APP_URL` is still one of the interface's HTTPS domain URLs | —            |

**Primary URL** succeeds with a message saying whether the domain is public or private; for a private domain it notes that clients must be on the LAN or a VPN and must trust the Root CA. It fails if the domain has been removed from the interface. It does not test reachability.

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

## Connecting Client Services

No StartOS dependency or package integration is involved. The admin registers each service in Pocket ID's admin UI (**OIDC Clients**) with that service's callback URL, then enters the client ID, client secret and discovery URL (`<APP_URL>/.well-known/openid-configuration`) in the service's own settings.

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
  - create-initial-admin
health_checks:
  - primary
  - primary-url
primary_url: https public-domain or private-domain only (OIDC issuer, WebAuthn RP ID)
```
