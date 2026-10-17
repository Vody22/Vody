# Starfarer 3D

Jeu spatial en monde ouvert, en 3D, jouable dans le navigateur (PC et mobile), avec multijoueur.

**Jouer : https://star-vody.vercel.app**

- `index.html` : le jeu complet (un seul fichier)
- Multijoueur : salon public par défaut, salon privé avec `#nom-du-salon` à la fin de l'adresse
- Chaque push sur `main` est mis en ligne automatiquement par Vercel


## Interface 2.3

Les améliorations de confort, les boutons modernes, les comparaisons de pièces, le plan de vol et les notifications prioritaires sont dans `src/polish-v2.js`, `src/ui-modern.js` et `src/journey-v23.js`, avec leurs feuilles de style. `build.py` les intègre dans les versions web et portails.

Pour publier une modification : modifier `src/`, lancer `python3 build.py --check game-check.js` (ou `python -X utf8 build.py` sous Windows), vérifier le jeu, puis publier les sources et les deux fichiers HTML générés sur `main`. Ne pas ajouter le fichier temporaire `game-check.js`. Vercel déploie ensuite `public/` sur https://star-vody.vercel.app.
