# Starfarer 3D

Jeu spatial en monde ouvert, en 3D, jouable dans le navigateur (PC et mobile), avec multijoueur.

**Jouer : https://star-vody.vercel.app**

- `index.html` : le jeu complet (un seul fichier)
- Multijoueur : salon public par défaut, salon privé avec `#nom-du-salon` à la fin de l'adresse
- Chaque push sur `main` est mis en ligne automatiquement par Vercel


## Interface 2.3

Les améliorations de confort, les boutons modernes, les comparaisons de pièces, le plan de vol et les notifications prioritaires sont dans `src/polish-v2.js`, `src/ui-modern.js` et `src/journey-v23.js`, avec leurs feuilles de style. `build.py` les intègre dans les versions web et portails.

Pour publier une modification : modifier `src/`, lancer `python3 build.py --check game-check.js` (ou `python -X utf8 build.py` sous Windows), vérifier le jeu, puis publier les sources et les deux fichiers HTML générés sur `main`. Ne pas ajouter le fichier temporaire `game-check.js`. Vercel déploie ensuite `public/` sur https://star-vody.vercel.app.


## Mobile 2.4

Joystick visible à gauche, gaz sur une glissière horizontale, actions à droite et raccourcis dans le bouton Menu. Les commandes sont suspendues derrière les menus. Le mode mobile est détecté automatiquement sur les appareils tactiles ; `?mobile` permet de vérifier son agencement avec un navigateur de bureau, et `?pc` force les commandes souris. Les styles et commandes sont dans `src/mobile-v24.css` et `src/mobile-v24.js`, intégrés par `build.py`.

## Fluidité 2.5

`world.js` répartit les créations de secteurs sur plusieurs passages, charge les objets proches en priorité et abandonne les tâches qui ne correspondent plus au secteur actuel. `WORLD_STREAM` conserve les ensembles attendus et la file restante ; chaque passage crée au plus trois groupes d’objets, avec un budget de temps indicatif. Un objet individuel peut dépasser ce budget.

`perf3.js` prépare les matériaux un par un et amorce le chargement autour du joueur pendant l’écran d’accueil. Les objets de compilation partagent les ressources du jeu sans déplacer les objets originaux ni sérialiser leurs données de gameplay. Les sauvegardes et les fonctions serveur gardent leur format.
