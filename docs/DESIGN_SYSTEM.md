# FacturX Design System

## Typographie & Spacing (Règles d'or)

### 1. Titres de sections principales (H2)
- **Taille unique & cohérente :** `text-foreground text-3xl sm:text-4xl font-bold tracking-tight text-balance`
- Appliqué uniformément sur toutes les sections (Comment ça marche, Fonctionnalités, En chiffres, Témoignages, Tarifs).
- **Interdiction :** Ne jamais dépasser `sm:text-4xl` (bannir `md:text-5xl` qui déséquilibre les blocs).

### 2. Sous-titres & paragraphes d'introduction de section
- **Taille :** `text-muted-foreground text-base sm:text-lg`
- **Longueur & Découpage :** Strictement **2 lignes maximum** sur écran standard (utiliser `max-w-4xl` avec `sm:block` par phrase). Chaque proposition clé (ex: *Générez vos factures électroniques Factur-X en conformité totale avec la réforme 2026.*) doit impérativement tenir sur une seule ligne continue sans retour à la ligne prématuré.

### 3. Cartes d'étapes & fonctionnalités (Feature Cards)
- **Alignement du texte :** Toujours aligné à gauche (`text-left`), jamais centré.
- **Titres des étapes / blocs :** `text-foreground text-base font-bold` (ex. *1. Déposez votre facture PDF*, *Tous vos types de factures supportés*).
- **Descriptions des cartes :** `text-muted-foreground text-base leading-relaxed` (aligné sur la taille du texte d'introduction de section).

### 4. Menus & Navigation (Footer)
- **Taille unifiée :** Titres de colonnes et liens partagent exactement la même taille (`text-sm`).
- **Poids & Casse :** Titres en `font-bold text-foreground` avec casse naturelle (aucun `uppercase` ni `tracking-wider`). Liens en `text-muted-foreground` avec transition au survol.

### 5. Cartes Dashboard & KPIs
- **Titres de cartes (Cards internes) :** `text-sm font-medium` avec `text-muted-foreground` ou `text-foreground`.
- **Chiffres clés (KPIs) :** `text-2xl font-bold` (seule exception pour la lisibilité des métriques clés).
- **Spacing :** Paddings modérés (`p-4` à `p-8` selon le contexte) et gaps serrés pour préserver compacité et élégance.
- **Couleurs :** Contrastes doux, fonds clairs/sauge (`bg-cream-light`, `bg-card`), bordures fines (`border-border/60`), ombres subtiles (`shadow-sm`).
