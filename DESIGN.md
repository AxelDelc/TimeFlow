---
name: TimeFlow
description: Outil de gestion du temps de travail pour PME — pointer, planifier, superviser.
colors:
  signal:           "oklch(55% 0.23 255)"
  signal-hover:     "oklch(47% 0.22 255)"
  signal-light:     "oklch(96% 0.018 258)"
  signal-mid:       "oklch(91% 0.04 257)"
  signal-on-dark:   "oklch(72% 0.17 255)"
  active:           "oklch(67% 0.19 145)"
  active-light:     "oklch(96% 0.04 145)"
  active-text:      "oklch(40% 0.14 145)"
  end:              "oklch(60% 0.22 24)"
  end-light:        "oklch(96.5% 0.035 22)"
  end-text:         "oklch(38% 0.17 24)"
  attention:        "oklch(68% 0.185 50)"
  attention-light:  "oklch(96% 0.045 65)"
  attention-text:   "oklch(44% 0.14 50)"
  break:            "oklch(80% 0.155 90)"
  break-light:      "oklch(97% 0.04 95)"
  break-text:       "oklch(37% 0.10 75)"
  sidebar:          "oklch(13% 0.018 260)"
  sidebar-active:   "oklch(22% 0.015 260)"
  text-primary:     "oklch(18% 0.014 262)"
  text-muted:       "oklch(44% 0.012 262)"
  text-subtle:      "oklch(48% 0.010 262)"
  surface-page:     "oklch(96.5% 0.006 262)"
  surface-card:     "oklch(99% 0.002 262)"
  border-hairline:  "oklch(90% 0.008 262)"
  on-dark-high:     "oklch(96% 0.004 262)"
  on-dark-mid:      "oklch(65% 0.009 262)"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-1px"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.3px"
rounded:
  sm: "5px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
  9: "40px"
components:
  button-primary:
    backgroundColor: "oklch(55% 0.23 255)"
    textColor: "oklch(99% 0.002 262)"
    rounded: "5px"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "oklch(47% 0.22 255)"
  button-danger:
    backgroundColor: "oklch(96.5% 0.035 22)"
    textColor: "oklch(38% 0.17 24)"
    rounded: "5px"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "oklch(94% 0.007 262)"
    textColor: "oklch(44% 0.012 262)"
    rounded: "5px"
    padding: "8px 16px"
  button-success:
    backgroundColor: "oklch(96% 0.04 145)"
    textColor: "oklch(40% 0.14 145)"
    rounded: "5px"
    padding: "8px 16px"
  card:
    backgroundColor: "oklch(99% 0.002 262)"
    rounded: "6px"
    border: "1px solid oklch(90% 0.008 262)"
  input:
    backgroundColor: "oklch(99% 0.002 262)"
    textColor: "oklch(18% 0.014 262)"
    borderColor: "oklch(90% 0.008 262)"
    rounded: "6px"
    padding: "9px 12px"
  input-focus:
    borderColor: "oklch(55% 0.23 255)"
    boxShadow: "0 0 0 3px oklch(55% 0.23 255 / 0.18)"
---

# Design System: TimeFlow

## 1. Overview

**Creative North Star: "The Precision Instrument"**

TimeFlow est un outil interne de gestion du temps, pas une vitrine. Son identité visuelle est celle d'un instrument de précision: chaque décision de design sert une fonction. Le système repose sur une palette OKLCH entièrement calculée, une typographie système native, et une densité d'information assumée.

Références de ton: **Linear** (tokens systématiques, sidebar sombre considérée), **Vercel** (précision, zéro décoration), **Raycast** (qualité d'outil, détail soigné).

La migration vers OKLCH garantit que toutes les couleurs sont perceptuellement uniformes: les palettes de statut ont des contrastes stables, et les neutres sont légèrement teintés vers le hue de la marque (262, indigo doux) pour créer une cohérence subconsciente sans que la teinte soit perceptible.

**Key Characteristics:**
- Couleurs OKLCH intégralement — aucune valeur hex dans le système de tokens
- Neutrals tintés indigo (hue 262) à chroma 0.004–0.018
- Signal blue décalé vers l'indigo profond `oklch(55% 0.23 255)` vs Tailwind `#3b82f6`
- Rayons resserrés: 5/6/10px — plus précis, moins SaaS-générique
- Sidebar sombre / contenu clair — séparation nette sans border ni ombre
- Flat par défaut — ombres uniquement sur élévation contextuelle
- Architecture primitive → sémantique: les composants n'utilisent que les tokens sémantiques

## 2. Colors: OKLCH Signal Palette

Système à deux couches: **primitifs** (`--prim-*`) pour les valeurs brutes et **sémantiques** (`--color-*`) pour les rôles. Les composants n'utilisent jamais les primitifs directement.

### Signal (action, actif, identité)
- **Signal** `oklch(55% 0.23 255)`: Confiance et action. Boutons primaires, états actifs, focus. Décalé vers l'indigo vs le Tailwind blue pour un caractère plus distinctif.
- **Signal Hover** `oklch(47% 0.22 255)`: Plus profond au hover.
- **Signal Light** `oklch(96% 0.018 258)`: Tint léger pour fonds de badges, header "aujourd'hui" du calendrier.
- **Signal On-Dark** `oklch(72% 0.17 255)`: Version claire pour sidebar sombre. Contraste sur sidebar: 5.7:1 ✓

### Status (sémantiques, jamais décoratifs)
- **Active / Active Text** `oklch(67% 0.19 145)` / `oklch(40% 0.14 145)`: Sessions en cours, punch-in. Contraste texte/fond: 5.9:1 ✓
- **End / End Text** `oklch(60% 0.22 24)` / `oklch(38% 0.17 24)`: Fin de session, erreurs, destructif. Contraste: 6.4:1 ✓
- **Attention / Attention Text** `oklch(68% 0.185 50)` / `oklch(44% 0.14 50)`: Heures supp, à surveiller. Contraste: 5.1:1 ✓
- **Break / Break Text** `oklch(80% 0.155 90)` / `oklch(37% 0.10 75)`: Créneaux pause uniquement.

### Neutrals (teinte indigo, hue 262)
- **Sidebar** `oklch(13% 0.018 260)`: Le plus sombre. Séparation navigation/contenu.
- **Sidebar Active** `oklch(22% 0.015 260)`: Item nav actif, surface légèrement levée.
- **Text Primary** `oklch(18% 0.014 262)`: Corps de texte. Contraste sur card: ~17:1 ✓
- **Text Muted** `oklch(44% 0.012 262)`: Labels secondaires. Contraste sur card: 5.5:1 ✓
- **Text Subtle** `oklch(48% 0.010 262)`: Placeholders. Contraste sur card: 4.7:1 ✓
- **Surface Page** `oklch(96.5% 0.006 262)`: Fond application.
- **Surface Card** `oklch(99% 0.002 262)`: Cards, modales, inputs.
- **Border Hairline** `oklch(90% 0.008 262)`: Séparateurs, contours inputs.

### On-Dark (textes sur sidebar)
- **On-Dark High** `oklch(96% 0.004 262)`: Texte actif, titre marque. Contraste sur sidebar: ~12:1 ✓
- **On-Dark Mid** `oklch(65% 0.009 262)`: Nav items repos. Contraste sur sidebar: 5.9:1 ✓

### Named Rules
**The One Signal Rule.** Signal blue est la seule couleur non-sémantique. Toutes les autres (vert, rouge, orange, jaune) ont une signification fixe et ne peuvent pas être réutilisées dans d'autres contextes.

**The No-Decoration Rule.** Aucune couleur du système n'apparaît uniquement pour animer l'interface. Si un élément est orange, il signifie une heure supplémentaire ou une attention requise.

**The WCAG Rule.** Tous les tokens texte sont calculés pour atteindre ≥4.5:1 sur la surface card. Les punch buttons utilisent du texte sombre sur fond coloré saturé pour garantir le contraste (vert saturé rend le texte blanc inaccessible).

## 3. Typography

**System font stack — aucune font custom.**

### Hierarchy
- **Display** (800, 48px, lh 1.1, ls -1px): Hero home uniquement.
- **Headline** (700, 26px, lh 1.2): Valeurs de stats dans le dashboard.
- **Title** (600, 18px, lh 1.3): Titres de pages, en-têtes de sections.
- **Body** (500, 14px, lh 1.5): Contenu principal — tableaux, formulaires. Plancher fonctionnel.
- **Label** (600, 12px, lh 1.4, ls 0.3px): Badges, en-têtes de colonnes, légendes contextuelles.

## 4. Elevation

Plat par défaut. La profondeur vient du contraste de fond (page `96.5%` L vs card `99%` L), jamais d'ombres permanentes.

- **Modal / Overlay**: `0 24px 64px oklch(5% 0.02 260 / 0.22), 0 4px 16px oklch(5% 0.02 260 / 0.10)`
- **Card Hover**: `0 4px 12px oklch(5% 0.02 260 / 0.08)`
- **Focus Ring**: `0 0 0 3px oklch(55% 0.23 255 / 0.18)`

## 5. Components

### Buttons
- **Primary**: Signal `oklch(55% 0.23 255)`, texte card-white. Radius 5px.
- **Danger**: End-light / end-text. Destructif sans agressivité.
- **Success**: Active-light / active-text.
- **Ghost**: Row-bg / text-muted. Actions secondaires.
- **Focus**: `outline: 2px solid oklch(55% 0.23 255)` sur tous les boutons, sans exception.

### Stat Strip
Barre horizontale à 4 cellules divisées par des hairlines de 1px. Chaque cellule: icône sémantique inline (sans box de fond), valeur 28px/700, label 12px/muted. Remplace le pattern icon-box + big-number + label.

### Features Grid (home)
Grille 2 colonnes de feature-rows horizontaux (icône 34px + title/desc). Pas de card borders, pas de card backgrounds. L'espacement crée le grouping.

### Navigation Sidebar
- **Repos**: texte on-dark-mid `oklch(65% 0.009 262)`. Radius 6px.
- **Hover**: surface `oklch(22% 0.015 260)`, texte on-dark-high.
- **Actif**: surface sidebar-active `oklch(22% 0.015 260)`, texte on-dark-high (600), icône signal-on-dark.

### Calendrier
Créneaux travail: signal blue fond, card-white texte. Créneaux pause: break-light fond, break-text texte.

### Badges (sémantiques stricts)
- badge-green: active-light / active-text
- badge-red: end-light / end-text
- badge-orange: attention-light / attention-text
- badge-blue: signal-mid / signal-600
- badge-yellow: break-light / break-text
- badge-gray: row-bg / text-muted

### Punch Buttons
Texte `--color-text` (sombre) sur fond coloré saturé. Nécessaire car le vert saturé (`oklch(67% 0.19 145)`) a une luminance WCAG de ~0.37 — incompatible avec le texte blanc (contraste 2.5:1).

## 6. Do's and Don'ts

### Do:
- Utiliser les tokens sémantiques (`--color-signal`, `--color-active-text`) dans les composants.
- Vérifier les contrastes WCAG avec les vraies valeurs OKLCH converties en sRGB.
- Maintenir le focus visible sur tous les éléments interactifs.
- Garder les couleurs de statut strictement sémantiques.

### Don't:
- Mettre du texte blanc sur active/vert saturé ou break/jaune — contraste insuffisant.
- Ajouter des ombres permanentes aux cards au repos.
- Créer des grilles de cards identiques (icon + heading + text × N).
- Utiliser des couleurs de statut dans un contexte purement décoratif.
- Descendre en dessous de 14px pour du texte fonctionnel.
- Utiliser `outline: none` sans alternative visible.