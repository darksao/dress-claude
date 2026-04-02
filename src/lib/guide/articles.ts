export interface Article {
  slug: string
  title: string
  emoji: string
  summary: string
  readingTime: number
  content: string
}

export const ARTICLES: Article[] = [
  {
    slug: 'quest-ce-que-la-colorimetrie',
    title: 'Qu\'est-ce que la colorimétrie ?',
    emoji: '🎨',
    summary: 'Comprendre comment les couleurs interagissent avec votre teint, vos yeux et vos cheveux.',
    readingTime: 4,
    content: `
## Qu'est-ce que la colorimétrie ?

La colorimétrie personnelle est l'art de déterminer quelles couleurs mettent le mieux en valeur votre apparence naturelle. Elle repose sur l'harmonie entre les couleurs de vos vêtements et vos caractéristiques physiques : teint, yeux et cheveux.

## Les trois axes clés

### 1. La température (Chaud / Froid)
Certaines personnes ont des sous-tons chauds (dorés, pêche, abricot) dans leur peau, leurs yeux ou leurs cheveux. D'autres ont des sous-tons froids (roses, bleutés, cendrés). Les couleurs chaudes valorisent les personnes à sous-tons chauds, et inversement.

### 2. La profondeur (Clair / Profond)
Votre coloration naturelle est-elle légère (teint porcelaine, yeux clairs) ou intense (teint foncé, yeux sombres) ? Les couleurs de même profondeur créent une harmonie naturelle.

### 3. La clarté (Vive / Douce)
Votre coloration est-elle très contrastée et lumineuse, ou plutôt douce et estompée ? Ce critère détermine si vous portez mieux les couleurs saturées ou les tons plus neutres.

## Pourquoi c'est important ?

Quand vous portez "vos" couleurs, votre peau paraît lumineuse, vos traits s'harmonisent et vous semblez en pleine forme. À l'inverse, une mauvaise couleur peut accentuer les cernes, rendre le teint terne ou les traits tirés.
    `.trim(),
  },
  {
    slug: 'les-4-familles-de-saisons',
    title: 'Les 4 familles de saisons',
    emoji: '🌸',
    summary: 'Printemps, Été, Automne, Hiver : découvrez les grandes familles de colorimétrie.',
    readingTime: 5,
    content: `
## Les 4 familles de saisons

Le système des saisons divise les colorations humaines en 4 grandes familles, chacune subdivisée en 3 sous-saisons pour un total de 12 profils.

## 🌸 Printemps — Chaud & Clair

Les Printemps ont une coloration chaude et lumineuse : teint doré ou pêche, yeux clairs (vert, noisette, bleu), cheveux dorés ou roux clairs. Leurs couleurs : corail, pêche, vert menthe, camel clair, crème.

**Sous-saisons :** Printemps Lumière, Printemps Chaud, Printemps Vif

## ☀️ Été — Froid & Doux

Les Étés ont une coloration froide et douce : teint rosé ou beige cendré, yeux bleus ou gris, cheveux cendrés ou châtains froids. Leurs couleurs : lavande, rose poudré, bleu gris, mauve, blanc cassé.

**Sous-saisons :** Été Lumière, Été Doux, Été Froid

## 🍂 Automne — Chaud & Profond

Les Automnes ont une coloration chaude et intense : teint cuivré ou doré foncé, yeux marron, noisette ou verts profonds, cheveux roux, châtain chaud ou brun doré. Leurs couleurs : terracotta, kaki, bordeaux, orange brûlé, brun.

**Sous-saisons :** Automne Doux, Automne Chaud, Automne Profond

## ❄️ Hiver — Froid & Profond

Les Hivers ont une coloration froide et intense : teint porcelaine ou foncé avec sous-tons roses/bleutés, yeux sombres ou très clairs contrastés, cheveux noirs, bruns froids ou très blonds cendrés. Leurs couleurs : noir, blanc pur, fuchsia, bleu électrique, rouge vif.

**Sous-saisons :** Hiver Doux, Hiver Froid, Hiver Vif
    `.trim(),
  },
  {
    slug: 'comment-habiller-sa-saison',
    title: 'Comment habiller sa saison ?',
    emoji: '👗',
    summary: 'Conseils pratiques pour intégrer votre palette dans votre garde-robe.',
    readingTime: 6,
    content: `
## Comment habiller sa saison ?

Connaître sa saison est un point de départ. L'appliquer au quotidien est une autre étape.

## La règle des 3 zones

La colorimétrie s'applique surtout aux zones proches du visage. Concentrez-vous sur :
1. **Le haut** (tops, vestes, écharpes) — impact maximal sur le teint
2. **Les accessoires** (sacs, bijoux) — amplificateurs subtils
3. **Le bas** (pantalons, jupes) — moins impactant, mais cohérence appréciée

## Construire une garde-robe capsule

Commencez par **3-4 neutres** de votre palette : ils forment la base de tous vos looks. Ajoutez ensuite **2-3 couleurs d'accent** plus vives ou originales.

**Exemple pour un Automne Chaud :**
- Neutres : camel, kaki, brun chocolat
- Accents : terracotta, orange brûlé, vert forêt

## Les pièges à éviter

- Acheter une couleur "tendance" qui n'est pas dans votre palette
- Confondre "couleur préférée" et "couleur qui vous va"
- Négliger les sous-tons (une couleur "proche" mais au mauvais sous-ton peut ne pas fonctionner)

## La règle du visage lumineux

Un test simple : placez le vêtement sous votre visage en lumière naturelle. Si votre teint paraît frais, vos yeux brillants et vos traits harmonieux — c'est votre couleur.
    `.trim(),
  },
  {
    slug: 'couleurs-a-eviter',
    title: 'Les couleurs à éviter et pourquoi',
    emoji: '🚫',
    summary: 'Comprendre pourquoi certaines couleurs ne vous flattent pas et comment les substituer.',
    readingTime: 4,
    content: `
## Les couleurs à éviter et pourquoi

Chaque saison a des couleurs qui ne lui correspondent pas. Comprendre pourquoi aide à faire de meilleurs choix.

## Le principe de contraste

Une couleur "déconseillée" crée généralement un contraste problématique avec votre coloration naturelle :
- **Trop froid** pour une saison chaude → teint terne, aspect maladif
- **Trop chaud** pour une saison froide → teint rougeâtre, look peu soigné
- **Trop vif** pour une saison douce → la couleur "mange" le visage
- **Trop terne** pour une saison vive → look éteint, traits creusés

## Les substitutions intelligentes

Ne renoncez pas à une couleur que vous aimez — trouvez sa version adaptée à votre saison.

| Vous aimez | Vous êtes Printemps | Vous êtes Hiver |
|-----------|---------------------|-----------------|
| Le rouge  | Rouge tomate chaud  | Rouge bleuté vif |
| Le bleu   | Bleu turquoise      | Bleu électrique |
| Le beige  | Beige pêche caramel | Gris clair nacré |

## Les couleurs "universelles"

Quelques couleurs fonctionnent pour presque toutes les saisons, avec des nuances différentes :
- **Le blanc** (pur pour Hiver, crème pour Printemps/Automne, blanc cassé pour Été)
- **Le bleu marine** (froid pour Été/Hiver, chaud pour Printemps/Automne)
- **Le beige/taupe** (doré pour Printemps/Automne, rosé pour Été/Hiver)
    `.trim(),
  },
  {
    slug: 'cheveux-et-colorimetrie',
    title: 'Cheveux et colorimétrie',
    emoji: '💇',
    summary: 'L\'impact de la couleur de vos cheveux sur votre palette et vos tenues.',
    readingTime: 5,
    content: `
## Cheveux et colorimétrie

La couleur de vos cheveux est l'un des trois piliers de votre saison, avec le teint et les yeux. Elle influence directement votre palette et peut la faire évoluer si vous changez de couleur.

## Cheveux naturels vs colorés

Votre colorimétrie de naissance est déterminée par votre coloration naturelle. Mais si vous colorez vos cheveux depuis longtemps, votre cerveau (et le regard des autres) s'est habitué à cette combinaison.

**Le conseil pratique :** si vous avez des cheveux colorés depuis plus d'un an, utilisez votre couleur actuelle pour déterminer votre palette opérationnelle.

## Changer de couleur de cheveux

Un changement capillaire peut modifier votre saison perçue. Par exemple :
- Passer de brun naturel à blond cendré peut faire glisser d'Automne vers Été
- Ajouter des reflets cuivrés peut renforcer une saison Printemps ou Automne
- Passer au noir peut accentuer les caractéristiques Hiver

## L'avatar Dress Claude

C'est pour cette raison que notre avatar vous permet de modifier la couleur de vos cheveux et recalcule automatiquement vos suggestions. Vous pouvez explorer comment différentes teintes capillaires changeraient votre palette vestimentaire.

## Les couleurs de cheveux par saison

- **Printemps** : blond doré, roux clair, châtain miel
- **Été** : blond cendré, châtain rosé, gris naturel
- **Automne** : roux foncé, châtain chaud, brun acajou
- **Hiver** : noir, brun froid, blond très clair platine
    `.trim(),
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}
