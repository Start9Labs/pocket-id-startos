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

The package runs the upstream image unmodified, with temporary subcontainers for startup setup and login-link creation.

| Property      | Value                                                                                                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image         | `ghcr.io/pocket-id/pocket-id` (upstream, unmodified)                                                                                                                                         |
| Architectures | x86_64, aarch64                                                                                                                                                                              |
| Entrypoint    | Upstream entrypoint, which handles PUID/PGID and chowns `/app/data`                                                                                                                          |
| Subcontainers | `pocket-id-sub` — the Pocket ID server; `pocket-id-bootstrap` — temporary, loopback-only initial-admin setup; `create-login-link` — temporary, runs the upstream `one-time-access-token` CLI |

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

`TRUST_PROXY=true` (StartOS terminates TLS in front of the service) and `ANALYTICS_DISABLED=true` are also set on every launch, not stored.

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

Install generates `ENCRYPTION_KEY`, raises the **Create Login Link** task, and holds the service on a critical task until a primary URL is chosen. That task offers only HTTPS domains, so the user must add a public or private domain to the Web UI interface first.

On every start, a temporary server listens only on `127.0.0.1:1412`, which is not bound to an interface. The package checks its initial-setup endpoint (`GET /api/signup/setup`) and, while no user exists, creates the admin itself: username `admin`, email `admin@<primary URL hostname>`. Only a 404 is treated as setup already completed; other unexpected responses fail startup. The temporary server shuts down before the main server listens on the exposed port, keeping upstream's setup API inaccessible until the admin exists. The admin has no passkey yet, so **Create Login Link** hands the user a one-time link that signs them in, where Pocket ID prompts them to register one. The placeholder email should be changed in the admin's profile. Everything after that is configured in Pocket ID's admin UI.

---

## Actions

Two actions: one picks the primary URL, the other is the package's sign-in and recovery path.

**Set Primary URL** — run at first setup, and again only if the chosen domain has been removed from the interface. It offers only the Web UI interface's HTTPS domains, writes `APP_URL` to `store.json`, and restarts the service if it is running. Re-running it with the same URL is harmless; choosing a different URL invalidates every registered passkey and every client service's issuer configuration, so all users re-enroll and every client's discovery URL must be updated. No output.

**Create Login Link** — run once after the first start to sign in as `admin`, and again whenever a user has lost every passkey. Takes a username or email (default `admin`), runs upstream's `pocket-id one-time-access-token` in a temporary subcontainer against the live database, and returns the `<APP_URL>/lc/<token>` link, masked, with a QR code. The link signs that user in once and expires after an hour; each run mints a new one and earlier unused links stay valid until they expire. Fails with `user not found` for an unknown account. Available only while the service is running.

---

## Tasks

The service can be held on one critical task and prompts one important task.

| Task                  | Severity  | Raised when                                                                                                                                           | Cleared by                                                                                           |
| --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Set Primary URL**   | critical  | `APP_URL` is empty (fresh install), or is no longer one of the interface's HTTPS domain URLs — re-evaluated whenever the interface's addresses change | Running the action, or re-adding the stored domain to the interface. Returns if it is removed again. |
| **Create Login Link** | important | Install                                                                                                                                               | Running the action. Does not return.                                                                 |

A restore onto a server that lacks the backed-up primary domain raises **Set Primary URL**; re-adding the same domain clears it without running the action and keeps existing passkeys valid.

---

## Health Checks

Two checks: whether the server is up, and what kind of domain its primary URL is.

| Check         | Probes                                          | Grace period |
| ------------- | ----------------------------------------------- | ------------ |
| Web Interface | Port 1411 listening                             | 30s          |
| Primary URL   | Whether `APP_URL` is a public or private domain | None         |

**Web Interface** failing past the grace period means the server did not come up; check the service logs. A start that fails before it, logging `Creating the admin account failed`, means Pocket ID rejected the package's initial-admin request; the log line carries Pocket ID's own error.

**Primary URL** always succeeds while the service runs, with a message saying whether the domain is public or private — and for a private domain, that clients must be on the LAN or a VPN and trust the Root CA. It checks configuration only, not whether the URL is reachable. A primary domain removed from the interface stops the service and raises **Set Primary URL** instead.

---

## Backups and Restore

The `main` volume is copied wholesale, so a backup contains the SQLite database, Pocket ID's key material and `store.json`, including `ENCRYPTION_KEY`. Nothing is excluded and nothing rebuilds on restore. A restored instance is usable once its primary domain exists on the interface; see [Tasks](#tasks).

---

## Limitations and Differences

1. **SQLite only.** Upstream also supports PostgreSQL; this package runs the embedded SQLite database.
2. **No GeoIP.** `MAXMIND_LICENSE_KEY` is not exposed, so audit-log location lookups are off.
3. **The primary URL must be an HTTPS domain.** `.local`, IP and Tor addresses cannot be chosen.
4. **The primary URL is effectively permanent.** Passkeys and client issuer configuration are bound to it.
5. **No `/setup` wizard.** The package creates the first admin (`admin`, with a placeholder email) on first start; sign in with **Create Login Link**.
6. **Anonymous analytics are off.** `ANALYTICS_DISABLED=true` stops the instance heartbeat upstream sends by default.

---

## Quick Reference for AI Consumers

```yaml
package_id: pocket-id
image: ghcr.io/pocket-id/pocket-id
architectures: [x86_64, aarch64]
subcontainers: [pocket-id-sub, pocket-id-bootstrap, create-login-link]
volumes:
  main: /app/data
file_models:
  - store.json
startos_managed_env_vars:
  - APP_URL
  - ENCRYPTION_KEY
  - TRUST_PROXY
  - ANALYTICS_DISABLED
dependencies: none
interfaces:
  http: { type: ui, port: 1411 }
actions:
  - set-primary-url
  - create-login-link
tasks:
  - { action: set-primary-url, severity: critical }
  - { action: create-login-link, severity: important }
oneshots:
  - create-admin
health_checks:
  - primary
  - primary-url
```
