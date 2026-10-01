# Pending verification

- Complete first-admin creation and passkey login in a browser over a trusted HTTPS hostname. The VM smoke test covers the setup page, action link, OIDC discovery, health, restart, and primary-URL removal/recovery, not browser enrollment.
- Recheck `npm audit` when updating the SDK. SDK 2.0.9 bundles vulnerable `brace-expansion` and `js-yaml` versions under its ESLint tooling; `npm audit fix` cannot replace bundled dependencies. Resolve through an SDK release rather than editing `node_modules`.
