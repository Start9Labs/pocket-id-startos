import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.19.2:0',
  releaseNotes: {
    en_US:
      'Updated Pocket ID to 2.19.2, a dependency-maintenance patch that updates vulnerable dependencies. Full release notes: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.2',
    es_ES:
      'Pocket ID actualizado a 2.19.2, un parche de mantenimiento que actualiza dependencias vulnerables. Notas completas: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.2',
    de_DE:
      'Pocket ID auf 2.19.2 aktualisiert, ein Wartungsupdate für Abhängigkeiten, das verwundbare Abhängigkeiten aktualisiert. Vollständige Versionshinweise: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.2',
    pl_PL:
      'Zaktualizowano Pocket ID do 2.19.2. To wydanie konserwacyjne aktualizuje zależności zawierające luki bezpieczeństwa. Pełne informacje o wydaniu: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.2',
    fr_FR:
      'Pocket ID mis à jour vers la version 2.19.2, un correctif de maintenance qui met à jour des dépendances vulnérables. Notes de version complètes : https://github.com/pocket-id/pocket-id/releases/tag/v2.19.2',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
