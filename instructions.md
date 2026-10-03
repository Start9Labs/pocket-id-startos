# Pocket ID

## Documentation

- [Pocket ID documentation](https://pocket-id.org/docs/introduction) — administering users, groups and OIDC clients.
- [Client examples](https://pocket-id.org/docs/client-examples) — connecting individual services to Pocket ID.

## What you get on StartOS

- A **Web UI** interface serving the Pocket ID admin and user pages and its OIDC endpoints.
- Data, including the SQLite database, stored on the service's volume and included in StartOS backups.

## Choosing a domain

Pocket ID needs a domain on its Web UI interface before it can start. Its primary URL is where users register passkeys and where every connected service signs them in, so `.local`, IP and Tor addresses aren't offered.

- **Public domain with Let's Encrypt** — works from anywhere and with every service that supports OIDC. Recommended.
- **Private domain** — works only on your LAN or over a VPN such as StartTunnel. Your devices must trust your server's Root CA, and so must each connected service; check that service's instructions before relying on it.

Passkeys are bound to the domain you choose. Changing it later means every user re-registers their passkeys.

## Getting set up

1. Add a public or private domain to the Web UI interface.
2. Run the **Set Primary URL** task and choose that domain.
3. Start the service.
4. Run the **Create First Admin User** task. It shows a `/setup` link; open it in a browser on a device that supports passkeys, then enter your details and register a passkey.

The **Primary URL** health check shows whether Pocket ID is on a public or private domain. If you remove that domain, StartOS asks you to choose a new one before Pocket ID can start again.

## Connecting a service

For each service that should sign in through Pocket ID:

1. In Pocket ID's admin UI, open **OIDC Clients** and add a client. Enter the service's callback URL, found in its own documentation or in the client examples above. Optionally restrict the client to a user group.
2. Copy the client ID and client secret that Pocket ID shows.
3. In the service's own settings, enter the client ID, the client secret, and the discovery URL: your primary URL followed by `/.well-known/openid-configuration`.
