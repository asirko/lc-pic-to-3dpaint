# CLAUDE.md

Ce fichier guide Claude Code (claude.ai/code) pour travailler dans ce dépôt.

## Projet

Application Angular 20 qui convertit des images 2D en modèles 3D imprimables (STL/OBJ). Chaque couleur extraite devient une couche physique plate empilée verticalement (style lithophanie multicouleur). L'UI est en français.

Workflow en 5 étapes : charger image → paramètres d'impression → extraction couleurs → aperçu couches → export 3D (Three.js, pas encore implémenté).

## Commandes

```bash
npm start          # Serveur dev sur localhost:4200
npm run build      # Build production
npm run deploy     # Déploiement GitHub Pages (/lc-pic-to-3dpaint/)
ng test            # Tests Karma + Jasmine
```

## Git — Gitflow simplifié

- Branche principale de développement : `develop`
- Branches de feature : `feat/<nom>` (partent de `develop`)
- Mise à jour des branches par **rebase** sur `develop` (pas de merge)
- Merge dans `develop` : **squash + fast-forward** (1 commit par feature)
- Mise en production : merge `develop` → `main` avec montée de version dans `package.json`
- Messages de commit : [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `refactor:`, `perf:`, `docs:`, etc.

## Conventions de code

- **Composants légers** : la logique métier va dans les stores/services, pas dans les composants
- **`#`** pour les propriétés privées (ES private fields, pas `private`)
- **`inject()`** pour l'injection de dépendances (pas d'injection par constructeur)
- **Signals** systématiquement (pas RxJS sauf nécessité absolue)
- **ReactiveForms** en priorité
- **Standalone components** uniquement (pas de NgModules)
- **Zoneless change detection** + OnPush

## CSS — Architecture SMACSS

Les styles globaux sont dans `src/styles/` avec des partiels modulaires (`_palette.scss`, `_buttons.scss`, `_form.scss`, `modules/_stepper.scss`, `modules/_animations.scss`). Le CSS des composants Angular est **minimal** : uniquement du code ultra-spécifique au composant. Le gros du style reste dans les fichiers globaux.

## Architecture

### État centralisé

`DataStore` (`src/app/stores/data.store.ts`) — service injectable root contenant tous les signals partagés : dimensions d'impression, diamètre buse, couleurs, données image, etc.

### Composants step

Chaque étape dans `src/app/components/` hérite de `StepAbstract` (`step.abstract.ts`). Navigation gérée par le stepper dans `app.component.ts`.

1. **ImageLoader** — Drag-drop / input fichier, rendu canvas, extraction `ImageData`
2. **PrintParams** — Presets buse (0.2/0.4/0.6mm), calcul dimensions avec ratio
3. **ColorsPicker** — Saisie manuelle + 2 algos d'extraction auto, réordonnancement CDK drag-drop
4. **LayeredImage** — Multi-canvas, un par couleur, assignation pixel → couleur la plus proche
5. *(À implémenter)* — Export 3D via Three.js

### Pipeline couleurs

Algorithmes dans `src/app/logic/extract-main-colors/` :
- **K-means** (`kmeans.logic.ts`) — Clustering en espace CIELAB, 20 itérations max
- **Guesstimate** (`custom-guesstimate.logic.ts`) — Réduction histogramme (quantification 16 niveaux)

Utilitaires dans `src/app/utils/` :
- `colors.utils.ts` — Conversions RGB↔CIELAB↔Hex, distance Delta E CIE94
- `lab.utils.ts` — Calculs espace CIELAB
- `geometry.utils.ts` — Calcul dimensions rectangle depuis diagonale + ratio
