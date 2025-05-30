# Format de données modulaire

#### You:
Je vais te donner un texte qui explique les spécifications d'une fonctionnalité (ou d'un format de donnée que je veux créer pour un fonctionnalités). J'aimerais que tu analyse le texte, me demande si il y a des choses qui pourraient être manquante, des zones d'ombre ou pas clair. 
Lorsque tu auras toutes les informations claires et détaillées que tu voudra il faudra que tu reforumle/re rédige correctement les spécifications dans un français clair et construit. Egalement si tu as des propositions d'amélioration, de modification ou autres sur le format de donnée ou n'importe quel élément de la spécification fait le moi savoir stp.
"The issue with this new format is that it is not as modular as I want. You cannot have parameters of sub parameters etc and the keys are not standardized like I don't want "subtypes" or thing like that just parameters and sub parameters. This are my requirements:
"Je fait une application où les élèves peuvent entrer leurs notes. sur le dashboard j'ai des data cards qui permettent d'afficher des informations. Je veux permettre aux utilisateurs de créer leurs propres datacards avec un grand nombre de paramètres. Le but de mon json était de donner une liste exhaustive des différents cas possibles, en effet lors de la création de cards dans le flux de création il faudra afficher certains paramètres seulement si d'autres ont été sélectionnés avant etc. Le problème de stocker cela dans un format normalisé standard et global est très compliqué. Chaque paramètre que l'utilisateur choisi ouvre la route à de nouveau paramètres spécialisées pour cette combinaison. Le but de mon json était de montrer quels paramètres seront affichés dans quel ordre et suivant quels paramètres précédents etc. En sachant que comme tu as pu le voir mais parfois il y a énormément de sous-sous paramètres hésitants de sous paramètres et ainsi de suite. Si tu arrives à me faire un format qui permet en même temps d'être compact mais également extrêmement modulaire et qui encode en lui des relations de hiérarchie entre les différents paramètres pour pouvoir faire un formulaire qui se construit dynamiquement. Peut être faut il regrouper des types génériques de paramètres qui sont souvent présents mais pas au même endroit. En sachant que mon json actuel n'est qu'une version primitive avec peu de paramètres et possibilités (c'est pour cela que j'avais besoin de conseils), il ne contient que le "calculateur" principal avec ses paramètres mais il faudra également dans le futur qu'il supporte le changement de titre, description, icônes, paramètre d'affichage et tout cela avec également des conditions et des personnalisations très poussées qui peuvent dépendre ou non des paramètres précédents. Il faudrait peut être donner un type à chaque paramètre ou je ne sais pas. Il serait pratique également que je puisse stocker cela dans une base de données relationnelle car par exemple si je supprime un matière qui était affiché dans une datacard il faudra également que je supprime cette datacard. Le JSON que tu as pour l'instant n'est que le "premier niveau" ensuite il faudra permetre une customisation approfindie des descriptions avec également des statistiques personnalisables, choisir parmi des templates, du texte conditionnel. De même pour les titres, l'icône en haut à droite de la datacard (affichage conditionnel etc.) et d'autres paramètres d'affihcage (pourcentages/absolu, couleurs de la datacard conditionel, affichage de mini graphique liés à la data etc etc etc)
Ce format de données JSON doit permettre la création dynamique d'un formulaire pour la création de datacard où les champs apparaissent dynamiquement en fonction des paramètres sélectionnés. Mais il doit ensuite créer à partir de ce qui est paramétré un autre format de données pour stocker ces paramètres dans la base de données avec les relations etc.
Voici les solutions explorées:"### Comment passer d’une “liste‐roulette” exhaustive à une **définition normalisée ET conditionnelle**

_(ou : comment décrire toutes les combinaisons possibles **sans** les écrire une par une)_

---

## 1. Séparer “ce qui est choisi” de “comment se présentent les choix”

| Concept        | Rôle                      | Exemple                                                           |
| -------------- | ------------------------- | ----------------------------------------------------------------- |
| **Metric**     | La statistique à calculer | `mean`, `median`, `note_max`, `streak`, `impact`…                 |
| **Scope**      | Le périmètre              | `global`, `subject`, `custom_subject`, `single_note`              |
| **Window**     | La fenêtre temporelle     | `all_time`, `period`, `last_n_days`, `last_n_notes`               |
| **Qualifier**  | Variante / filtre         | `min`, `max`, `positive`, `negative`, `cumulative`, `consecutive` |
| **ExtraParam** | Paramètre libre           | `X` pour “count > X”, `goal` pour “note_needed”                   |

---

## 2. Un **catalogue** qui décrit les possibilités, pas les combinaisons

```jsonc
{
  "metrics": {
    "mean": {
      "label": "Moyenne",
      "allowedScopes": ["global", "subject", "custom_subject"],
      "allowedWindows": ["all_time", "period", "last_n_days", "last_n_notes"],
      "qualifiers": ["min", "max"], // optionnel
      "extraParams": [] // optionnel
    },
    "note_last": {
      "label": "Dernière note",
      "allowedScopes": ["global", "subject", "custom_subject"],
      "allowedWindows": ["none"], // fenêtre fixe
      "qualifiers": [],
      "extraParams": []
    },
    "count_gt": {
      "label": "Nombre de notes > X",
      "allowedScopes": ["global", "subject", "custom_subject"],
      "allowedWindows": ["all_time", "period", "last_n_days"],
      "qualifiers": ["cumulative", "consecutive"],
      "extraParams": [{ "key": "X", "type": "number", "label": "Seuil X" }]
    },
    "impact": {
      "label": "Impact",
      "allowedScopes": ["subject", "custom_subject", "single_note"],
      "allowedWindows": ["all_time", "period", "last_n_days"],
      "qualifiers": ["positive", "negative", "min", "max"],
      "extraParams": []
    }
    /* … */
  },

  "windows": {
    "all_time": { "label": "Toutes périodes", "fields": [] },
    "period": {
      "label": "Période",
      "fields": [
        { "key": "start", "type": "date" },
        { "key": "end", "type": "date" }
      ]
    },
    "last_n_days": {
      "label": "N derniers jours",
      "fields": [{ "key": "n", "type": "integer", "min": 1 }]
    },
    "last_n_notes": {
      "label": "N dernières notes",
      "fields": [{ "key": "n", "type": "integer", "min": 1 }]
    }
  },

  "scopes": {
    "global": { "label": "Toutes matières", "fields": [] },
    "subject": {
      "label": "Matière",
      "fields": [{ "key": "subject_id", "type": "lookup:Subject" }]
    },
    "custom_subject": {
      "label": "Groupe de matières",
      "fields": [{ "key": "subject_ids", "type": "multiLookup:Subject" }]
    },
    "single_note": {
      "label": "Note précise",
      "fields": [{ "key": "note_id", "type": "lookup:Note" }]
    }
  }
}
```

### ➜ Ce fichier _décrit les règles_ que ton générateur de formulaire peut lire.

En UI :

1. L’utilisateur choisit un **Metric** ⇒ tu charges sa fiche et affiches les _scopes_ autorisés.
2. Quand il choisit un **Scope**, tu ajoutes dynamiquement les champs définis (`subject_id` etc.).
3. Même logique pour la **Window** et pour chaque **Qualifier** ou **ExtraParam**.

Résultat : tu n’as plus **une entrée par combinaison**, mais **une définition par dimension**.

---

## 3. Représenter la carte créée par l’utilisateur

```jsonc
{
  "id": "uuid",
  "metric": "mean",
  "scope": { "type": "subject", "subject_id": 12 },
  "window": { "type": "last_n_notes", "n": 5 },
  "qualifier": null,
  "extraParams": {},
  "ui": {
    "title": "Moyenne Maths (5 dernières notes)",
    "description": "Ta moyenne est de {{value}}/20.",
    "icon": "mdi:calculator",
    "variant": "info"
  }
}
```

> ✔️ **Compact** (une seule ligne) mais **auto-validée** grâce au catalogue.

---

## 4. Construire l’interface à partir du catalogue

1. **Form engine** (React Hook Form, Formik, eller `react-jsonschema-form`)

2. **Étapes dynamiques** :

   - **Step 1** : Metric
   - **Step 2** : Scope (chargé via `allowedScopes`)
   - **Step 3** : Window
   - **Step 4** : Qualifiers + ExtraParams (si définis)
   - **Step 5** : Personnalisation visuelle (titre, icône…)

3. **Validation** :
   - Au fur et à mesure ou via _AJV_ (JSON Schema) en back-end.
   - Exemple de règle : `metric = streak` ⇒ `window.type ≠ last_n_notes` (pas pertinent).

---

## 5. Comment migrer ton JSON exhaustif ?

1. Écrire un **script** qui parcourt récursivement tes nœuds, repère :
   - le _metric_ (racine)
   - le _scope_ (globale / matière / …)
   - la _window_ (période / N jours / …)
   - le _qualifier_ (`Meilleure`, `Pire`, `Positive`)
2. Chaque feuille devient une **carte** au nouveau format.
3. Les valeurs `0` que tu stockais sont remplacées par les champs _parameter_ ou supprimées.

---

## 6. Bénéfices concrets

| Avant                                              | Après                               |
| -------------------------------------------------- | ----------------------------------- |
| JSON de plusieurs milliers de lignes               | < 200 lignes dans le catalogue      |
| Maintenance manuelle fastidieuse                   | Ajout d’une metric = **1 ligne**    |
| UI rigide (si tu oublies un cas, il faut re-coder) | UI générique, règles 100 % données  |
| Risque d’incohérence (doublons, fautes de frappe)  | Validé par le moteur (enum, lookup) |

---

### TL;DR

_Garde ton idée d’“exhaustivité”, mais déplace-la au **niveau des règles**, pas des combinaisons._\
Un **catalogue** (metric ↔ scopes ↔ windows ↔ qualifiers) + un générateur de formulaire dynamiques =

- code plus simple,
- stockage compact,
- et une création de _cards_ qui s’adapte à tout nouveau besoin sans explosion du JSON."
et :"## Contrainte : **“arbre de choix” extrêmement riche**

Tu veux :

1. **Un format compact** (pas une liste plate de milliers de feuilles).
2. **Une hiérarchie arbitraire** : chaque nœud peut ouvrir de nouveaux nœuds.
3. **Types, validations, valeurs par défaut, règles d’affichage** à chaque niveau.
4. **Persistance relationnelle** (et intégrité : si une matière disparaît, la card tombe).

La bonne nouvelle : ces quatre contraintes sont compatibles si on **représente le formulaire comme un graphe de métadonnées** (plutôt qu’une simple arborescence câblée).\
Je te propose :

```
┌────────────────────┐      ┌───────────────────────┐
│  ParamType (enum)  │←──┐  │   ValidationRule      │
└────────────────────┘   │  └───────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────┐
│  ParamNode  (la “brique Lego” réutilisable)           │
│  id (PK)                                              │
│  key, label, type_id  ───────► ParamType              │
│  parent_id (FK ParamNode)  ───┐                       │
│  condition_json (JSONLogic)   │  « visible si… »      │
│  validation_id (FK)           │                       │
│  order_in_parent              │  pour tri             │
│  … (helpText, defaultValue…)  │                       │
└────────────────────────────────┘                       │
           ▲                                             │
           │ “contient”                                  │
┌──────────┴──────────┐             ┌────────────────────┴─────────────────┐
│ CardTemplate        │             │ ParamNodeUI (titre, icône, couleur…) │
│ id, name            │             └──────────────────────────────────────┘
│ root_param_id  (FK) │
│ metric_id, …        │
└─────────────────────┘
```

**Idée clé :** _ParamNode_ est générique ; ta profondeur est gérée par le champ `parent_id` (self-join).\
La visibilité dynamique est assurée par `condition_json` : un objet JSON-Logic¹ qui s’exprime sur **les valeurs déjà renseignées** dans l’édition courante.

> ¹ _JSON-Logic_ (<https://jsonlogic.com>) : petit DSL JSON pour « if / and / > / in » facilement évalué en JS.

---

### 1. Les **types de paramètres** (table `ParamType`)

| id  | code       | stockage | widget par défaut             |
| --- | ---------- | -------- | ----------------------------- |
| 1   | integer    | INT      | input number                  |
| 2   | float      | FLOAT    | slider / input                |
| 3   | string     | VARCHAR  | text input                    |
| 4   | enum       | VARCHAR  | select / radio                |
| 5   | date       | DATE     | datepicker                    |
| 6   | reference  | FK       | autocomplete (matière, note…) |
| 7   | boolean    | TINYINT  | switch                        |
| 8   | expression | TEXT     | code editor (if allowed)      |

> On peut en ajouter autant qu’on veut (couleur, icône, etc.).

---

### 2. Exemple **concret** : “Nombre de notes > X, consécutif”

```yaml
# CardTemplate “count_gt”
id: 11
metric: count_gt
root_param_id: 200

# ParamNodes (simplifié)
- id: 200
  key: scope
  label: "Périmètre"
  type: enum
  enumValues: ["global","subject","custom_subject"]
- id: 210
  key: subject_id
  label: "Matière"
  type: reference            # vers table Subject
  parent_id: 200
  condition_json: { "===": [ { "var":"scope" }, "subject" ] }

- id: 220
  key: window_type
  label: "Fenêtre temporelle"
  type: enum
  enumValues: ["all_time","period","last_n_days"]
  parent_id: 200             # même niveau que subject
- id: 221
  key: start
  label: "Début"
  type: date
  parent_id: 220
  condition_json: { "===":[ { "var":"window_type" },"period" ]}

- id: 230
  key: seuil
  label: "Seuil X"
  type: float
  parent_id: 200

- id: 240
  key: mode
  label: "Mode de comptage"
  type: enum
  enumValues: ["cumulative","consecutive"]
  parent_id: 200
```

> L’éditeur de formulaire évalue **en temps réel** `condition_json`; il ne rend `start` que si `window_type == period`, etc.\
> Pour “matière custom” tu changeras la condition et le type → multi-select.

---

### 3. \*\*Personnalisation visuelle \*\* (table `ParamNodeUI`)

Chaque ParamNode peut posséder un nœud UI (ou juste la racine).\
Tu y stockes : `titleTemplate`, `descriptionTemplate`, `icon`, `color`.\
Le moteur Mustache/Handlebars remplace `{{value}}`, `{{scopeLabel}}`, etc.

> _Besoin avancé_ : si le titre dépend d’un champ (“Moyenne {{subjectLabel}}”), tu mets `"titleTemplate":"Moyenne {{subjectLabel}}"` dans `ParamNodeUI` du Template.

---

### 4. **Créer une card = instancier** le Template

Table `CardInstance` :

| id  | template_id | user_id | name | created_at | …   |
| --- | ----------- | ------- | ---- | ---------- | --- |

Table `CardParamValue` :

| card_id | param_node_id | value\_\*        | (PK = card_id+param_node_id) |
| ------- | ------------- | ---------------- | ---------------------------- |
| 42      | 200           | "subject" (ENUM) |                              |
| 42      | 210           | 17 (FK Subject)  |                              |
| 42      | 220           | "last_n_days"    |                              |
| 42      | 230           | 12 (FLOAT)       |                              |
| 42      | 240           | "consecutive"    |                              |

> **Pourquoi relationnel ?**
>
> - FK subject_id → `Subject(id)` → `ON DELETE CASCADE` ⇒ si tu effaces la matière 17, la ligne est supprimée, tu détectes la card orpheline.
> - Index `(card_id)` pour requêter toutes les valeurs d’une card.

---

### 5. **Génération / validation** côté back-end

1. Tu charges la **définition de Template** (ParamNodes arborescents + règles).
2. Tu reçois le `CardParamValue[]` du front.
3. Tu **évalues :**
   - _Exhaustivité_ : un param visible (selon JSON-Logic) doit avoir une valeur.
   - _Type_ : match avec `ParamType`.
   - _ValidationRule_ optionnelle (min, max, regexp…).
4. Tu stockes si tout est OK.

👉 Ça remplace “un JSON géant de cas”, mais l’expérience utilisateur est identique : **chaque sélection dévoile la suite**.

---

### 6. **Évolutivité / ajout de feature**

_Besoin nouveau_ : “projection fin de semestre”.

- Ajoute `metric = projection` dans `CardTemplate`.
- Crée/recycle ParamNodes existants : scope & window pareil, + 1 param `model` (linéaire, exponentiel…).\
  Aucun code UI à changer : l’éditeur lit le graph et l’affiche.

---

### 7. Outils conseillés

| Besoin                  | Lib JS/TS recommandée                     |
| ----------------------- | ----------------------------------------- |
| Form engine dynamique   | **react-jsonschema-form** ou **Uniforms** |
| Évaluation JSON-Logic   | `json-logic-js`                           |
| Gestion état formulaire | React Hook Form (wrapper)                 |
| Auth / per-user         | tRPC / GraphQL                            |
| DB                      | PostgreSQL (FK, JSONB si besoin)          |
| ORM                     | Prisma ou TypeORM (support des self-join) |

---

## TL;DR

1. **ParamNode** (id, type, parent, condition) = brique universelle.
2. Les dépendances sont déclarées via **JSON-Logic** dans `condition_json`.
3. **CardTemplate** est juste un pointeur vers la racine de l’arbre ; on en crée autant qu’on veut.
4. **CardInstance** stocke _les valeurs_, pas la structure → base relationnelle propre, cascades faciles.
5. Tu gagnes **modularité + profondeur illimitée** sans explosion du JSON.

Avec ce design, tu peux ajouter n’importe quel niveau de personnalisation, changer le look-and-feel, même insérer des “étapes cachées” — le tout sans doubler la taille de ton schéma ni réécrire le code du constructeur de formulaires."

#### ChatGPT:
\[Unsupported Content]


#### ChatGPT:
\[Unsupported Content]


#### ChatGPT:
Voilà les points sur lesquels j’ai besoin de précisions avant de pouvoir rédiger une spécification finale ; dis-moi si tu as déjà les réponses ou si tu préfères que je propose des choix — on affinera ensuite.

---

### 1. Périmètre fonctionnel

1. **Types de cartes à moyen terme**
   - Pour l’instant on parle uniquement de statistiques sur les notes ; prévois-tu d’autres familles de cartes (fréquentation, devoirs, planning, etc.) qui utiliseraient le même moteur ?
2. **Utilisateurs et partage**
   - Une carte est-elle strictement privée (par élève) ou pourra-t-elle être partagée (classe, groupe, prof) ?
   - Souhaites-tu gérer des permissions niveau carte (lecture/édition) ?

---

### 2. Modèle de données

3. **Réutilisation des ParamNodes**
   - Un même nœud (par ex. `subject_id`) peut-il être partagé entre plusieurs templates ?
   - Ou bien chaque template possède sa propre copie, même si la structure est identique ?
4. **Typage et validations avancées**
   - La liste de types actuelle (integer, float, enum, reference, etc.) te suffit-elle ?
   - Faut-il ajouter des méta-types (couleur, icône, fichier, expression mathématique…) ?
5. **Versionnage & migration**
   - Veux-tu garder l’historique des templates (v1, v2…) ou accepter qu’un changement casse les anciennes cartes ?

---

### 3. Logique conditionnelle

6. **Complexité des règles**
   - Est-ce que JSON-Logic (opérateurs booléens, comparateurs, arithmétique simple) suffit, ou penses-tu avoir besoin de règles plus riches (regex, accès à des données externes, appel d’API) ?
7. **Multiplicité des qualifiers**
   - Une carte peut-elle cumuler plusieurs qualifiers à la fois (ex. `positive` **et** `max`) ou est-ce toujours unitaire ?

---

### 4. Personnalisation visuelle

8. **Localisation (i18n)**
   - Faut-il stocker `titleTemplate`, `descriptionTemplate`, `label` en plusieurs langues ?
9. **Placeholders disponibles**
   - Outre `{{value}}`, envisages-tu d’autres jetons (ex. `{{subjectLabel}}`, `{{periodLabel}}`, `{{goal}}`) qu’il faut prévoir dans la spec ?
10. **Thème & accessibilité**
    - As-tu des contraintes de thèmes (clair/sombre) ou d’accessibilité (contrastes, police) à formaliser ?

---

### 5. Base de données & intégrité

11. **Comportement à la suppression**
    - Quand une matière disparaît, supprime-t-on la carte, la masque-t-on, ou la signale-t-on comme « orpheline » à l’utilisateur ?
12. **Performance / volumétrie**
    - Une même carte sera-t-elle recalculée à chaque affichage ou mises en cache ?
    - As-tu une estimation du nombre moyen de cartes par élève et du volume de ParamValues ?

---

### 6. Front / Back

13. **Technos imposées**
    - Tu as cité React ; confirmes-tu que le front est en TypeScript ?
    - Côté back, comptes-tu utiliser Node.js, Python, ou autre ? (utile pour proposer des libs JSON-Logic, ORM, etc.)
14. **Form engine**
    - Privilégies-tu une lib précise (react-jsonschema-form, Uniforms, Formik custom…) ou puis-je choisir librement ?

---

### 7. Écosystème futur

15. **Exports / API**
    - Faut-il prévoir un export des cartes en JSON, PDF, ou via une API externe ?
16. **Tests & validation continue**
    - Souhaites-tu que la spec décrive aussi des stratégies de tests (unitaires, intégration, golden tests de rendu) ?

---

Réponds simplement point par point (ou signale les questions inutilement précises). Dès que j’ai ces éclaircissements, je rédige la spécification complète, reformulée en français, et j’inclus mes propositions d’amélioration.


#### You:
Ces "data cards" sont juste un composant sur le dashboard de mon site de gestion de notes avec des statistiques (data visualisation) sur les notes de l'utilisateur. Ces cartes restent privées nous n'avons pas besoin de système de permission. Cependant je vais implémenter un système d'objectif (objectif de note mais également TODO et planning) donc il y aura surement des cartes liées à cela. De toute facon le but est d'avoir un système ultra modulaire pour l'utilisateur mais également pour moi le développeur. Il serait très facile d'ajouter des paramètres ou des possiblitées sur ces data cards mais pour cela il me faut un format de données modulaire et la possiblité de stocker facilement ces paramètres de datacard et également de générer un formulaire dynamiquement. Il faudra peut être créer un outil admin avec une sorte de création de graph avec nodes et connection et avec des paramètres sur chaqun qui me permetterai de construire le json du forumlaire dynmaique facilement.
En soit un même noeud pourrait être partagé mais le problème c'est de savoir ensuite quels paramètre afficher (si pour accéder à ce noeud j'ai des paramètres bien différents à chaque fois, le paramètre d'après n'est pas forcément le même dans chaque situation donc je ne pense pas. Cependant des types de noeuds peuvent être standardisés et réutiliser mais pas forcément le même noeud sauf dans les cas où ça s'y prête bien. Concernant le typage avancé je pense qu'il faudra en ajouter vu la modularité de personnalisation que je veux atteindre. Je ne connais pas les limitations de JSON logic donc je ne sais pas à quel point il limiterai la modularitée voulue. La multiplicité des qualifiers peut être possible mais seulement si cela à un sens. Pour les titres et descriptions je pense offrir à l'utilisateur plusieurs choix, sois il peut choisir parmis une longue liste de templates avec chaqu'un des parmamètres et des paramètres de paramètre si besoin et qui sont liés à la data choisie, alors dans ce cas le texte en lui même n'est pas customisable seul les données à l'interieur le sont donc le texte doit être localisé (pareil pour le titre) d'ailleurs pour le titre et la descriptions on peut montrer du texte différent conditionnelement en fonction de valeurs etc. Si l'utilisateur veut créer un texte complètement custom avec des variables dedans alors le texte n'est pas localisé. Si une matière disparait et que le card est dirrectement affectée et n'a plus de sens d'exister on la supprime. Une carte est calculée sur le client grace aux données fournises par l'api. Un utilisateur peut afficher au maximum 10 cartes différentes simultanément sur le dashboard. Ma tech stack est react, typescript, nextjs, shadcnui, tailwind, zod, bun, Hono, Turso, Drizzle ORM. Pour les forms utilise ce que tu trouve le mieux. Nous devrons offrir à l'utilisatur des cards par défaut et une liste de cards préfaite qu'il aura la possiblité de modifier. IL pourra dupliquer, supprimer, modifier et créer n'importe quelle carte, mettre en favori et chercher. Pour le backend j'utilise aussi du typescript avec bun. Les cards peuvent être exportées si l'uitilisateur demande de récupérer ses donnés. D'autres questions ?

#### ChatGPT:
\[Unsupported Content]


#### ChatGPT:
\[Unsupported Content]


#### ChatGPT:
Super, j’ai déjà un tableau de bord assez clair.\
Il reste juste quelques points à éclaircir pour que la spec finale couvre tout sans zones d’ombre — et j’en profite pour glisser quelques idées d’amélioration :

| **Sujet**                           | **Ce que j’ai compris**                                                      | **Questions / Options**                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Versionnage & migrations**     | Pour l’instant pas évoqué.                                                   | *Faut-il* garder plusieurs versions d’un même *CardTemplate* (ex. v1 → v2) et migrer les instances existantes ? Ou peut-on casser l’ancien format quand tu publies une mise à jour ?<br>→ **Option A** : champ `version` dans CardTemplate + script de migration.<br>→ **Option B** : pas de version, on duplique un template si on veut l’évoluer. |
| **2. Règles conditionnelles**       | JSON-Logic « peut-être suffisant », mais tu n’es pas sûr.                    | As-tu des cas concrets qui demanderaient :<br>• des regex<br>• des calculs math avancés (log, pow…)<br>• l’accès à un service externe (ex. calendrier scolaire) ?<br>Si oui, on peut :<br>→ intégrer un mini-langage type **JEXL** ou **expr-eval** (toujours dans un champ texte).                                                                 |
| **3. Types de paramètres**          | OK pour étendre.                                                             | Je prévois :<br>• `color` (HEX)<br>• `icon` (string : “mdi:star”)<br>• `markdown` (texte long)<br>• `array` (liste ordonnée de valeurs simples)<br>• `object` (clé/valeur libre)<br>Ça te paraît suffisant ?                                                                                                                                        |
| **4. Placeholders dans les textes** | Tu veux pouvoir insérer des variables (et masquer du texte selon la valeur). | Peux-tu lister les *tokens* que tu envisages dès le départ ? (ex. `{{value}}`, `{{subjectLabel}}`, `{{goal}}`, `{{periodStart}}` …).                                                                                                                                                                                                                |
| **5. Localisation**                 | Templates localisés, textes libres non.                                      | Quelles langues cibles devons-nous prévoir en dur (fr, en, autre) ?                                                                                                                                                                                                                                                                                 |
| **6. Accessibilité / thèmes**       | Non mentionné.                                                               | Souhaites-tu intégrer dans les paramètres :<br>• un “variant sombre/clair auto”<br>• un mode haute visibilité (contraste) ?                                                                                                                                                                                                                         |
| **7. Admin “Graph Builder”**        | Idée : éditeur visuel pour l’admin.                                          | Pour cadrer :<br>• Souhaites-tu un simple CRUD “nested list” façon Notion, ou un canvas drag-and-drop façon Draw\.io ?<br>• Faut-il pouvoir tester le rendu du formulaire directement depuis cet outil ?                                                                                                                                            |
| **8. Tests & CI**                   | Non précisées.                                                               | Dois-je inclure dans la spec :<br>• tests unitaires (Zod + Vitest) pour les règles<br>• snapshots visuels (Playwright)<br>• golden tests pour les exports ?                                                                                                                                                                                         |
| **9. Export des cartes**            | L’utilisateur peut « récupérer ses données ».                                | Format préféré :<br>• JSON brut<br>• CSV (une ligne par CardParamValue) <br>• Archive ZIP (json + mini-images des graphes) ?                                                                                                                                                                                                                        |
| **10. Limite de profondeur**        | Illimitée par conception.                                                    | Souhaites-tu imposer une limite (ex. 6 niveaux) pour éviter des formulaires labyrinthiques et garder l’UX ?                                                                                                                                                                                                                                         |

---

### Propositions d’amélioration déjà identifiées

1. **Catalogue scindé “data” / “UI”**
   - Table `ParamNodeUI` uniquement pour le front ; ainsi le back reste 100 % “données”, les thèmes évoluent sans migration.

2. **Bundle Zod + JSON-Schema**
   - Définir chaque *ParamType* avec Zod (TS) puis en déduire le JSON-Schema → une seule vérité, validation côté client et serveur.

3. **“Preview live” dans l’admin**
   - Quand tu relies les nœuds, un panneau de droite montre l’aperçu du formulaire et le JSON d’instance généré, pour tester instantanément.

4. **Cache côté client**
   - Vu que tu limites à 10 cartes : mémoriser le résultat d’une carte X secondes pour éviter de recalculer la même moyenne pendant la session.

5. **Sujet supprimé → Hook de nettoyage**
   - Un trigger Turso (`ON DELETE Subject`) qui appelle une lambda Hono : cherche les CardInstance orphelines, supprime ou notifie l’utilisateur.

---

Dis-moi ce qui te convient et tes choix sur les dix points ci-dessus (une courte réponse suffit).\
Dès que c’est validé, je reformule la spécification complète :

- format de stockage (tables, JSON, exemples)
- règles de validation
- workflow front/back + lib suggérées
- guide d’extension + admin builder.


#### You:
Pour le versionnage je n'y pense pas pour l'instant, mais puisque je ferai une app mobile ensuite je devrai de toute façon versionner mon api. Par contre pour les cartes elle devront être converties vers le nouveau format si besoins. Pour les types il faudra peut être ajouter des ranges, des dates etc. Je ne peux pas lister les token car je n'ai pas fait la liste complète des valeurs et paramètres que je voudrais proposer à l'utilisateur (par example il pourrait créer une data card qui montre sa moyenne générale de 3 matières qu'il a sélectionnée mais seuelement avec les notes des 10 derniers jours avec un titre qui dit "moyenne des écrits" avec une description qui montre l'évolution de cette moyenne avec un time window en pourcentage et l'icône est une flèche vers le haut si elle progress et vers le bas si elle baisse. La progrssion peut être en pourcentage ou en nombre de points gagnés et la card peut devenir rouge si ça baisse ou si la moyenne est sous un certain seuil. Voici un example de card parmis tant d'autre. Je peux ensuite proposer à l'utilisateur différentes données ex "Moyenne; médiane, note, impact, ecart type, coef de cariation, viariance, streak, tendance etc etc et tout cela avec des paramètres. Ex; notes: afficher la dernière note de telle matière par example. A toi de choisir pour json logic je ne sais pas. Je vise français anglais pour l'instant. Le thème clair sombre est client side et n'a rien à voir avec la card qui pourras seuelement avoir une légère teinte en fonction de certains paramètres si besoins. Pour le graph builder je souhaite pouvoir construire le flux du formulaire visuellement avec des nodes où je peux entrer les paramètres souhaités et les connections avec des conditions sur la valeur du node (node qui représente un praramètrs). Je pense que c'est possible avec react flow ou qqc comme cela. Je pourrais importer et exporter les json ainsi créés. En ce qui concerne le format de données de stockage dans la base de données relationelle je ne sais pas. Je ne veux pas de test pour l'instant. L'export est en json brut. Pas de limit de profonceur

#### ChatGPT:
\[Unsupported Content]


#### ChatGPT:
\[Unsupported Content]


#### ChatGPT:
## Spécification fonctionnelle & technique des **Data Cards**

*(version 1 · 30 mai 2025)*

---

### 1. Objectif

Permettre :

- à l’**utilisateur** de créer, dupliquer, modifier et organiser jusqu’à 10 data cards privées qui affichent des statistiques sur ses notes, ses objectifs, ses TODOs et, demain, tout autre jeu de données.
- au **développeur** d’ajouter de nouvelles métriques ou paramètres **sans refactorer le front** : seule la définition des métadonnées change.

---

### 2. Concepts clés

| Terme            | Rôle                                                                  | Exemple                                        |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| **Metric**       | Fonction de calcul                                                    | `mean`, `median`, `streak`, `impact`…          |
| **Scope**        | Périmètre des données                                                 | `global`, `subject`, `custom_subject`…         |
| **Window**       | Fenêtre temporelle                                                    | `all_time`, `period`, `last_n_days`…           |
| **Qualifier**    | Variante logique / filtre facultatif                                  | `positive`, `consecutive`, `max`…              |
| **ExtraParam**   | Paramètre numérique ou textuel libre                                  | `threshold` pour “moyenne > seuil”             |
| **ParamNode**    | Brique réutilisable décrivant **un champ** + sa condition d’affichage | champ `subject_id` visible si `scope=subject`  |
| **CardTemplate** | Graphe de ParamNodes qui définit **un type** de carte                 | “Moyenne glissante”, “Progression d’objectif”… |
| **CardInstance** | Valeurs réellement choisies par l’utilisateur pour un template donné  | “Moyenne des maths (10 derniers jours)”        |

---

### 3. Catalogue (métadonnées ⚙️) — *fichier JSON déployé*

```jsonc
{
  "metrics": {
    "mean": {
      "labels": { "fr": "Moyenne", "en": "Mean" },
      "allowedScopes": ["global", "subject", "custom_subject"],
      "allowedWindows": ["all_time", "period", "last_n_days", "last_n_notes"],
      "qualifiers": ["min", "max", "positive"],
      "extraParams": []
    },

    "count_gt": {
      "labels": { "fr": "Nb de notes > seuil", "en": "Count > threshold" },
      "allowedScopes": ["global","subject","custom_subject"],
      "allowedWindows": ["all_time","period","last_n_days"],
      "qualifiers": ["cumulative","consecutive"],
      "extraParams": [
        { "key": "threshold", "type": "float", "label": { "fr": "Seuil", "en": "Threshold" } }
      ]
    }

    /* … */
  },

  "windows": {
    "period": {
      "labels": { "fr": "Période", "en": "Period" },
      "fields": [
        { "key": "start", "type": "date" },
        { "key": "end",   "type": "date" }
      ]
    },
    "last_n_days": {
      "labels": { "fr": "N derniers jours", "en": "Last N days" },
      "fields": [ { "key": "n", "type": "integer", "min": 1 } ]
    }
    /* … */
  },

  "scopes": {
    "subject": {
      "labels": { "fr": "Matière", "en": "Subject" },
      "fields": [ { "key": "subject_id", "type": "reference:Subject" } ]
    }
    /* … */
  }
}
```

> **Pourquoi ?**\
> *1 fichier* décrit **tous les choix possibles**. Le front lit ce catalogue pour afficher dynamiquement le formulaire.\
> Ajouter une métrique = ajouter ≤ 20 lignes dans ce JSON, pas de code.

---

### 4. Schéma relationnel (Turso / SQLite + Drizzle ORM)

#### 4.1 Table `param_type`

| id | code      | storage | widget par défaut |
| -- | --------- | ------- | ----------------- |
| 1  | integer   | INT     | number            |
| 2  | float     | REAL    | number/slider     |
| 3  | string    | TEXT    | text              |
| 4  | enum      | TEXT    | select/radio      |
| 5  | date      | DATE    | date-picker       |
| 6  | boolean   | INT(1)  | switch            |
| 7  | reference | INT FK  | autocomplete      |
| 8  | range     | JSON    | double slider     |
| 9  | color     | TEXT    | color-picker      |
| 10 | icon      | TEXT    | icon-picker       |

*(extensible à l’infini)*

#### 4.2 Table `param_node`

| Champ        | Type                 | Commentaire                             |
| ------------ | -------------------- | --------------------------------------- |
| `id` (PK)    | INT                  |                                         |
| `key`        | TEXT                 | identifiant stable (`subject_id`, `n`…) |
| `label_json` | JSON                 | `{ fr:"Matière", en:"Subject" }`        |
| `type_id`    | FK → `param_type.id` |                                         |
| `parent_id`  | FK nullable self     | null = racine                           |
| `condition`  | TEXT (JSON-Logic)    | `{"===":[{"var":"scope"},"subject"]}`   |
| `order`      | INT                  | tri au sein du même parent              |
| `help_json`  | JSON opt             | info-bulle localisée                    |
| `meta_json`  | JSON opt             | min, max, step, enumValues…             |

#### 4.3 Table `card_template`

| Champ     | Type                 | Commentaire         |
| --------- | -------------------- | ------------------- |
| `id` (PK) | INT                  |                     |
| `code`    | TEXT UNIQUE          | ex. `mean_basic`    |
| `root_id` | FK → `param_node.id` | nœud racine         |
| `metric`  | TEXT                 | miroir du catalogue |
| `version` | INT                  | par défaut : 1      |

> **Migration** : si tu modifies la structure d’un template, crée un *nouveau* root + `version = 2`, puis script de migration qui convertit les anciennes `card_instance`.

#### 4.4 Table `card_instance`

| Champ         | Type     |             |
| ------------- | -------- | ----------- |
| `id` (PK)     | INT      |             |
| `template_id` | FK       |             |
| `user_id`     | FK       |             |
| `name`        | TEXT     | nom visible |
| `created_at`  | DATETIME |             |
| `favorite`    | BOOLEAN  |             |

#### 4.5 Table `card_param_value`

| card\_id | param\_node\_id | value           | PK = `(card_id, param_node_id)` |
| -------- | --------------- | --------------- | ------------------------------- |
| 42       | 200             | `"subject"`     | ENUM                            |
| 42       | 210             | `17`            | FK → `Subject`                  |
| 42       | 220             | `"last_n_days"` |                                 |
| 42       | 221             | `10`            | INT                             |

Cascade :\
`ON DELETE Subject` → suppression des rows correspondantes → déclencheur Hono + Bun → efface la `card_instance` si elle n’a plus **aucun** param = carte orpheline.

---

### 5. Logique conditionnelle

- **Évaluateur** : [`json-logic-js`](https://jsonlogic.com) (léger, TS), suffisant pour : comparateurs, booléen, arithmétique, `in`, etc.
- **Extension possible** : injecter une fonction `regexMatch` si besoin, ou basculer vers **JEXL** plus tard ; le champ `condition` reste du texte, donc migrable.

---

### 6. Localisation

- Tous les libellés, aides et templates textuels sont stockés en JSON `{ fr: "...", en: "..." }`.
- Si l’utilisateur écrit un **texte libre** (description personnalisée) → pas localisé.
- Placeholders standard disponibles dans les templates :

| Token              | Usage                            |
| ------------------ | -------------------------------- |
| `{{value}}`        | résultat brut                    |
| `{{value_pct}}`    | valeur en % (si applicable)      |
| `{{subjectLabel}}` | label de la matière              |
| `{{windowLabel}}`  | description fenêtre (“10 jours”) |
| `{{delta}}`        | progression (+2 pts, −3 %)       |

Le moteur **Handlebars** côté client fait le rendu.

---

### 7. Workflow front-end (React + Next.js)

1. **Form Engine** : `react-jsonschema-form` + `@hookform/resolvers/zod` (validation Zod partagée client/serveur).
2. **Étapes dynamiques** déterminées par le graphe : Metric → Scope → Window → Qualifiers → ExtraParams → Personnalisation.
3. **Calcul** des cartes : pur JS dans le navigateur ; un cache mémoire TTL = 60 s évite les recalculs pendant la session.
4. **Thème** clair/sombre : Tailwind `data-theme`. La carte reçoit une `variant` (info, success, warning, danger) et éventuellement un `tint` HSL ajusté.

---

### 8. Admin “Graph Builder”

| Feature         | Détail                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| Technologies    | **React-Flow**, shadcn/ui, Tailwind                                        |
| Nœud “Param”    | affiche key + type + labels + meta                                         |
| Connexion       | flèche + badge condition (`scope=="subject"`)                              |
| Panneau latéral | - Édition du node<br>- Preview live du formulaire résultant                |
| Import/Export   | JSON de `param_node[]` + racine, compatible avec la DB                     |
| Déploiement     | Commit dans Turso → hot-reload du catalogue sur le front (SWR / freshness) |

---

### 9. Export utilisateur

- **Format** : JSON brut contigu contenant :
  - `card_instance`
  - `card_param_value[]`
  - dump minimal (`metric`, `computedValue`) pour rejouer hors-ligne le rendu.
- End-point GET `/v1/export/cards` → fichier `cards_<userId>.json`.

---

### 10. Extension à venir

| Besoin futur                                | Action                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| Nouveau type de donnée (objectif, planning) | Créer de nouvelles **Metric** + éventuels ParamNodes ; le moteur reste inchangé. |
| Typage supplémentaire                       | Ajouter ligne dans `param_type`, widget React associé.                           |
| Ajout d’une langue                          | Ajouter clé ISO‐639 dans tous les `label_json`.                                  |
| App mobile                                  | Le catalogue JSON reste identique ; seule l’UI change.                           |

---

### 11. Migration / versioning

- **À court terme** : pas de version de l’API spécifique aux cards ; chaque template porte un champ `version` *(défaut 1)*.
- **Changement incompatible** :
  1. cloner le template (code +1, version +1) ;
  2. script Bun qui lit les `card_param_value`, applique une **map** (ex. `window.last_n_days.n` → `window.range.n`) et réécrit la nouvelle instance ;
  3. supprime l’ancienne après succès.

---

### 12. Résumé TL;DR

- **Graphe de ParamNodes** stocké en base (self-join) = profondeur illimitée.
- Front lit le **catalogue JSON** ; React-Flow sert d’éditeur visuel pour toi.
- Validation, calcul et rendu = 100 % données → aucun refactor quand tu ajoutes une métrique.
- Tout est localisable (fr, en).
- Export simple en JSON brut.
- Pas de tests CI imposés pour l’instant (tu pourras ajouter Vitest + Playwright plus tard).

---

### 13. Prochaines étapes

1. **Valider** ce schéma (types manquants, tokens supplémentaires ?)
2. Mettre en place :
   - tables `param_type`, `param_node`, etc. via **Drizzle ORM** migrations ;
   - seed initial du catalogue (2-3 metrics pour commencer).
3. Prototyper le **Graph Builder** avec React-Flow pour créer le premier template “Mean basic”.
4. Intégrer le form engine sur le dashboard et afficher la première carte !

Si quelque chose manque ou semble flou, dis-le moi ; sinon, tu peux passer directement à l’implémentation.
