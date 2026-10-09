# Starfarer 3D

Jeu spatial 3D monde ouvert (Three.js r128) de William, en français. En ligne : https://starvody.netlify.app

## Déploiement
- Netlify (projet `starvody`) est relié à ce dépôt : **chaque push sur `main` met le site en ligne** (~30 s).
- `index.html` est GÉNÉRÉ : ne pas l'éditer à la main. Modifier `src/`, puis `python3 build.py`, puis commit + push.
- `netlify.toml` : publication de la racine, pas de commande de build côté Netlify.

## Structure
- `src/shell.html` : HTML/CSS/HUD, avec les marqueurs `%%THREE%%` et `%%GAME%%`.
- `src/*.js` : modules concaténés dans cet ordre (voir `build.py`) : core, audio, gfx, models, world, game, surface, fx, ultra, detail, content, lasers, parts, cockpit, speed, story, netroom, mp, hud. Tout est au niveau global (pas de modules ES).
- `core.js` : `PARTS` (pièces de l'Atelier) et `PM(clé)` = multiplicateurs des pièces installées (coque, vitesse, cadence, bouclier…).
- `parts.js` : visuels des pièces (enveloppe `buildShip(P, aLeLaser)`), onglet 🔧 Atelier, aperçu, achat. `lasers.js` : tirs lumineux, rayon laser (shader), éclairs/impacts, son du laser. `cockpit.js` : vue cockpit (touche V / bouton 👁), tableau de bord 3D posé devant la caméra, écrans dessinés sur canvas, viseur tête haute `ckHUD`, mouvements de tête. `speed.js` : poussière en traînées (sensation de vitesse), souffle et voile du boost.
- `src/three-examples/` : post-process Three.js r128 (bloom…) incorporés tels quels.
- Multijoueur : `mp.js` utilise la capacité `room` des artefacts Claude si présente, sinon `netroom.js` (PeerJS, WebRTC en étoile, salon via `#code` dans l'URL, `public` par défaut).
- `dev/mockpeer.js`, `dev/mockroom.js` : faux réseau (BroadcastChannel) pour tester le multijoueur en local.

## Réglages
- `ARGENT_ILLIMITE` (core.js) : crédits infinis pour tous (affichés ∞). Les sauvegardes gardent alors 999 999 999 ¢ : si on le désactive, prévoir de ramener ces sauvegardes à un montant normal au chargement.

## Pièges connus
- `netroom.js` : ne jamais passer l'objet `mine` directement à `up()` (il est gelé par `Object.freeze`, la présence ne se mettrait plus à jour).
- En test headless (SwiftShader) les images sont lentes : appeler `placeShip()/updCam()` à la main avant une capture.

## Vérifier avant de pousser
`python3 build.py --check /tmp/g.js && node --check /tmp/g.js`
