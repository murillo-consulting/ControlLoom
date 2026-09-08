# Architecture de ControlLoom

[Ouvrir le HTML autonome](architecture.html) · [Spécification Archify](architecture.archify.json)

Télécharger le HTML et l'ouvrir localement dans un navigateur : GitHub affiche son code et ne l'exécute pas. Aucun hébergement supplémentaire n'est nécessaire.

Vue compacte des composants du dépôt au commit `30949388cc71b8b963d2b35f89d9d2f082634153`. Les flèches représentent les opérations indiquées, pas une preuve de déploiement ni un graphe exhaustif des appels. Les composants secondaires sans flèche complètent l'inventaire ; leurs liens détaillés restent dans les sources ci-dessous.

Vue du workspace local. GitHistory lit le dépôt pour les routes API ; aucune base hébergée ni API de modèle nécessaire.

Le texte du diagramme est en français. Les commandes fixes du Viewer et l'attribut HTML `lang` restent en anglais, langue de repli d'Archify 2.17. Affichage statique initial, thèmes clair et sombre ; aucune animation activée.

![Aperçu de la carte](architecture-preview.png)

## Sources vérifiées

| Composant | Source au commit de référence |
| --- | --- |
| Interface SvelteKit | [src/routes/+page.svelte:6–14](https://github.com/murillo-consulting/ControlLoom/blob/30949388cc71b8b963d2b35f89d9d2f082634153/src/routes/+page.svelte#L6-L14) |
| API Express | [cli/server/server.ts:50–58](https://github.com/murillo-consulting/ControlLoom/blob/30949388cc71b8b963d2b35f89d9d2f082634153/cli/server/server.ts#L50-L58) |
| Stockage YAML | [cli/server/infrastructure/fileStore.ts:46–54](https://github.com/murillo-consulting/ControlLoom/blob/30949388cc71b8b963d2b35f89d9d2f082634153/cli/server/infrastructure/fileStore.ts#L46-L54) |
| Historique Git | [cli/server/infrastructure/gitHistory.ts:7–15](https://github.com/murillo-consulting/ControlLoom/blob/30949388cc71b8b963d2b35f89d9d2f082634153/cli/server/infrastructure/gitHistory.ts#L7-L15) |
| Import tableur | [cli/server/spreadsheetRoutes.ts:8–16](https://github.com/murillo-consulting/ControlLoom/blob/30949388cc71b8b963d2b35f89d9d2f082634153/cli/server/spreadsheetRoutes.ts#L8-L16) |
| WebSocket | [src/lib/websocket.ts:66–74](https://github.com/murillo-consulting/ControlLoom/blob/30949388cc71b8b963d2b35f89d9d2f082634153/src/lib/websocket.ts#L66-L74) |

## Reproduction

Prérequis : Node.js et le skill [Archify](https://github.com/tt-a1i/archify), version 2.17 (MIT). Depuis la racine du dépôt, remplacer `<ARCHIFY>` par le répertoire du skill installé :

```text
rtk node <ARCHIFY>/bin/archify.mjs validate architecture docs/architecture/architecture.archify.json --repo-root . --quality showcase --json
rtk node <ARCHIFY>/bin/archify.mjs deliver architecture docs/architecture/architecture.archify.json docs/architecture/architecture.html --repo-root . --quality showcase --json
rtk node <ARCHIFY>/bin/archify.mjs visual-check docs/architecture/architecture.html --json
```

La révision source doit être présente dans le clone pour vérifier les références. Après une modification du JSON, relancer les trois commandes puis inspecter les captures des deux thèmes. Ne pas éditer le HTML généré.

## Vérifications et limites

Validation et livraison : **9/9 contrôles showcase**, zéro erreur et zéro avertissement. Le reçu portable `acceptance.json` lie les octets exacts aux contrôles et distingue la preuve navigateur de la revue des images.

Les tests applicatifs ne sont pas relancés : seuls le JSON, le HTML, les preuves documentaires et le lien du README changent. Cette documentation n'établit pas la santé d'un service, la sécurité d'une installation ni une conformité réglementaire.

Retour arrière : retirer le lien du README et les cinq fichiers de cette documentation, ou révoquer son commit. Aucun changement applicatif ou déploiement n'est associé.
