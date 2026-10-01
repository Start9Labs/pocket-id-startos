# Pocket ID

## Documentation

- [Pocket ID documentation](https://pocket-id.org/docs/introduction) — administering users, groups and OIDC clients.
- [Client examples](https://pocket-id.org/docs/client-examples) — connecting individual services to Pocket ID.

## What you get on StartOS

- A **Web UI** interface serving the Pocket ID admin and user pages and its OIDC endpoints.
- Data, including the SQLite database, stored on the service's volume and included in StartOS backups.

## Getting set up

1. Decide which URL Pocket ID will live at. Passkeys are bound to its hostname, and changing it later means every user re-registers their passkeys. To use Pocket ID from outside your LAN, add a public domain to the Web UI interface first.
2. Run the **Set Primary URL** task and choose that URL.
3. Start the service.
4. Run the **Create First Admin User** task. It shows a `/setup` link; open it in a browser on a device that supports passkeys, then enter your details and register a passkey.
5. In the admin UI, add an OIDC client for each service that will sign in through Pocket ID.

Passkeys need a secure (HTTPS) connection, so open Pocket ID through an HTTPS address rather than a plain-HTTP IP address.

If you remove the address chosen as the primary URL, StartOS asks you to choose a new one before Pocket ID can start again.
