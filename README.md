<p align="center">
  <img src="icon.svg" alt="Pocket ID Logo" width="21%">
</p>

# Pocket ID on StartOS

> Everything not listed in this document should behave the same as upstream
> Pocket ID. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Pocket ID](https://github.com/pocket-id/pocket-id) is a self-hosted OIDC provider that signs users in to other services with passkeys instead of passwords.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs the upstream image unmodified, in a single subcontainer.

| Property      | Value                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Image         | `ghcr.io/pocket-id/pocket-id`, upstream unmodified                        |
| Architectures | x86_64, aarch64                                                           |
| Entrypoint    | Upstream entrypoint, which handles PUID/PGID and chowns `/app/data`       |
| Subcontainers | `pocket-id-sub` — the Pocket ID server (web UI, OIDC endpoints, WebAuthn) |

---

## Volume and Data Layout

All state lives on one volume, which also holds the package's `store.json`.

| Volume | Mount Point | Contents                                                       |
| ------ | ----------- | -------------------------------------------------------------- |
| `main` | `/app/data` | Embedded SQLite database, Pocket ID key material, `store.json` |

---

## File Models

The package writes no Pocket ID configuration file. It keeps its own settings in `store.json` and passes them to Pocket ID as environment variables on every launch; everything else — OIDC clients, users, groups, SMTP, LDAP, branding — is set in Pocket ID's admin UI and stored in its database.

`store.json` (JSON, root of `main`):

| Key              | Seeded                             | Rewritten by        | Delivered as     |
| ---------------- | ---------------------------------- | ------------------- | ---------------- |
| `APP_URL`        | Empty at install                   | **Set Primary URL** | `APP_URL`        |
| `ENCRYPTION_KEY` | Random 44-character key at install | Nothing             | `ENCRYPTION_KEY` |

Pocket ID reads both variables on every launch, so `store.json` is authoritative. A hand edit to `APP_URL` survives, but if it is not one of the interface's HTTPS domain URLs the **Set Primary URL** task is raised and the service cannot start. Never change `ENCRYPTION_KEY`: it decrypts data already in the database.

`TRUST_PROXY=true` is also set on every launch, not stored, because StartOS terminates TLS in front of the service.

---

## Dependencies

None. Services that sign in through Pocket ID are configured as OIDC clients in Pocket ID's admin UI and in their own settings; neither side declares a StartOS dependency.

---

## Network Access and Interfaces

One interface serves everything Pocket ID exposes.

| Interface | Type | Port | Protocol | Purpose                              |
| --------- | ---- | ---- | -------- | ------------------------------------ |
| `http`    | ui   | 1411 | HTTP     | Web UI, OIDC endpoints, WebAuthn API |

The primary URL (`APP_URL`) is the OIDC issuer and the WebAuthn relying-party ID, and it must be an HTTPS public or private domain on this interface. Two parties reach it at that exact URL: the user's browser, for the login page and passkey ceremony, and each client service's backend, for discovery, token exchange and signing keys. A client cannot be pointed at an internal address, because the issuer in the discovery document and in every token must match the URL the client was configured with.

`.local`, IP and Tor addresses are therefore not offered: service containers cannot resolve `.local`, passkeys don't work on IPs, and client containers can't reach `.onion` without a Tor proxy.

| Primary URL                  | Client services that work                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Public domain, Let's Encrypt | Any OIDC-capable service                                                            |
| Public domain, Root CA       | Only those whose package trusts the StartOS Root CA                                 |
| Private domain               | Only those whose package trusts the StartOS Root CA, and only from the LAN or a VPN |

Service containers resolve private domains through StartOS DNS, so a private domain fails on certificate trust, not name resolution. A client service whose sign-in fails at the callback with a TLS error is in this case.

The interface nominates the primary URL as its preferred launch address, so **Open UI** opens Pocket ID there whenever that domain is one of the interface's addresses; otherwise StartOS picks an address as usual.

---

## Installation and First-Run Flow

Install generates `ENCRYPTION_KEY` and then holds the service on a critical task until a primary URL is chosen. That task offers only HTTPS domains, so the user must add a public or private domain to the Web UI interface first. Choosing the URL raises a second task for creating the first admin, which happens in Pocket ID's own `/setup` page because the admin's passkey has to be registered from a browser. Everything after that is configured in Pocket ID's admin UI.

---

## Actions

Two actions, both tied to the primary URL.

**Set Primary URL** — run at first setup, and again only if the chosen domain has been removed from the interface. It writes `APP_URL` to `store.json` and takes effect on the next start. Re-running it with the same URL is harmless; choosing a different URL invalidates every registered passkey and every client service's issuer configuration, so all users re-enroll and every client's discovery URL must be updated. No output.

**Create First Admin User** — hidden; not user-facing except through its task. Read-only: it returns `<APP_URL>/setup` as a copyable link and QR code, and is safe to repeat.

---

## Tasks

The service can be held on one critical task and prompts one important task.

| Task                        | Severity  | Raised when                                                                                                                                           | Cleared by                                                         |
| --------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Set Primary URL**         | critical  | `APP_URL` is empty (fresh install), or is no longer one of the interface's HTTPS domain URLs — re-evaluated whenever the interface's addresses change | Running the action. Returns if the chosen domain is removed later. |
| **Create First Admin User** | important | The first time a primary URL is set                                                                                                                   | Running the action. Does not return.                               |

A restore onto a server that lacks the backed-up primary domain raises **Set Primary URL**; re-adding the same domain, rather than choosing another, keeps existing passkeys valid.

---

## Health Checks

Two checks: whether the server is up, and whether its primary URL still exists.

| Check         | Probes                                                      | Grace period |
| ------------- | ----------------------------------------------------------- | ------------ |
| Web Interface | Port 1411 listening                                         | 30s          |
| Primary URL   | `APP_URL` is still one of the interface's HTTPS domain URLs | None         |

**Web Interface** failing past the grace period means the server did not come up; check the service logs.

**Primary URL** succeeds with a message saying whether the domain is public or private, and for a private domain that clients must be on the LAN or a VPN and trust the Root CA. It fails when the domain has been removed from the interface; re-add it, or run **Set Primary URL** knowing a new URL invalidates passkeys. It checks configuration only, not whether the URL is reachable.

---

## Backups and Restore

The `main` volume is copied wholesale, so a backup contains the SQLite database, Pocket ID's key material and `store.json`, including `ENCRYPTION_KEY`. Nothing is excluded and nothing rebuilds on restore. A restored instance is usable once its primary domain exists on the interface; see [Tasks](#tasks).

---

## Limitations and Differences

1. **SQLite only.** Upstream also supports PostgreSQL; this package runs the embedded SQLite database.
2. **No GeoIP.** `MAXMIND_LICENSE_KEY` is not exposed, so audit-log location lookups are off.
3. **The primary URL must be an HTTPS domain.** `.local`, IP and Tor addresses cannot be chosen.
4. **The primary URL is effectively permanent.** Passkeys and client issuer configuration are bound to it.

---

## Quick Reference for AI Consumers

```yaml
package_id: pocket-id
image: ghcr.io/pocket-id/pocket-id
architectures: [x86_64, aarch64]
subcontainers: [pocket-id-sub]
volumes:
  main: /app/data
file_models:
  - store.json
startos_managed_env_vars:
  - APP_URL
  - ENCRYPTION_KEY
  - TRUST_PROXY
dependencies: none
interfaces:
  http: { type: ui, port: 1411 }
actions:
  - set-primary-url
  - create-initial-admin
tasks:
  - { action: set-primary-url, severity: critical }
  - { action: create-initial-admin, severity: important }
health_checks:
  - primary
  - primary-url
```
