import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.19.3:0',
  releaseNotes: {
    en_US:
      'Updated Pocket ID to 2.19.3. Approving a device authorization now requires a proper request body, and vulnerable dependencies are updated. Full release notes: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.3',
    es_ES:
      'Pocket ID actualizado a 2.19.3. Aprobar una autorización de dispositivo ahora requiere un cuerpo de solicitud válido, y se actualizan dependencias vulnerables. Notas completas: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.3',
    de_DE:
      'Pocket ID auf 2.19.3 aktualisiert. Das Bestätigen einer Geräteautorisierung erfordert jetzt einen gültigen Anfragetext, und verwundbare Abhängigkeiten wurden aktualisiert. Vollständige Versionshinweise: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.3',
    pl_PL:
      'Zaktualizowano Pocket ID do 2.19.3. Zatwierdzenie autoryzacji urządzenia wymaga teraz poprawnej treści żądania, a zależności zawierające luki bezpieczeństwa zostały zaktualizowane. Pełne informacje o wydaniu: https://github.com/pocket-id/pocket-id/releases/tag/v2.19.3',
    fr_FR:
      "Pocket ID mis à jour vers la version 2.19.3. L'approbation d'une autorisation d'appareil exige désormais un corps de requête valide, et des dépendances vulnérables sont mises à jour. Notes de version complètes : https://github.com/pocket-id/pocket-id/releases/tag/v2.19.3",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
