# Starfarer 3D

Jeu spatial 3D monde ouvert (Three.js r128) de William, en français. En ligne : https://starvody.netlify.app

## Déploiement
- Netlify (projet `starvody`) est relié à ce dépôt : **chaque push sur `main` met le site en ligne** (~30 s).
- `index.html` est GÉNÉRÉ : ne pas l'éditer à la main. Modifier `src/`, puis `python3 build.py`, puis commit + push.
- `netlify.toml` : publication de la racine, pas de commande de build côté Netlify.

## Structure
- `src/shell.html` : HTML/CSS/HUD, avec les marqueurs `%%FONTS%%`, `%%THREE%%` et `%%GAME%%`. Style « instruments de bord » : panneaux à coins coupés (clip-path), jauges segmentées (mask), jetons CSS dans `:root` (`--ice`, `--amber`, `--hf`…).
- `src/fonts/` : police Chakra Petch (OFL) réduite au latin, intégrée en base64 par `build.py` (pas de chargement externe).
- `src/*.js` : modules concaténés dans cet ordre (voir `build.py`) : core, audio, gfx, models, world, game, surface, fx, ultra, detail, content, lasers, parts, cockpit, speed, sounds, visuals, chars, ground, story, explore, planet2, daynight, gfxplus, weather2, netroom, mp, hud, ui. Tout est au niveau global (pas de modules ES).
- `core.js` : `PARTS` (pièces de l'Atelier) et `PM(clé)` = multiplicateurs des pièces installées (coque, vitesse, cadence, bouclier…).
- `parts.js` : visuels des pièces (enveloppe `buildShip(P, aLeLaser)`), onglet 🔧 Atelier, aperçu, achat. `lasers.js` : tirs lumineux, rayon laser (shader), éclairs/impacts, son du laser. `cockpit.js` : vue cockpit (touche V / bouton 👁), tableau de bord 3D posé devant la caméra, écrans dessinés sur canvas, viseur tête haute `ckHUD`, mouvements de tête. `speed.js` : poussière en traînées (sensation de vitesse), souffle et voile du boost. `sounds.js` : sons des armes par type de canon, rugissement du boost (`nzf` = bruit filtré ; ne pas nommer `nz`, déjà pris par la musique dans story.js). `visuals.js` : couronne solaire. `ground.js` : planètes — avant-poste (piste = station au sol), PNJ et marchand, filons de minerai, mode à pied (`FOOT`), caméra et commandes à pied.
- `src/three-examples/` : post-process Three.js r128 (bloom…) incorporés tels quels.
- Multijoueur : `mp.js` utilise la capacité `room` des artefacts Claude si présente, sinon `netroom.js` (PeerJS, WebRTC en étoile, salon via `#code` dans l'URL, `public` par défaut).
- `dev/mockpeer.js`, `dev/mockroom.js` : faux réseau (BroadcastChannel) pour tester le multijoueur en local.

## Réglages
- `ARGENT_ILLIMITE` (core.js) : crédits infinis pour tous (affichés ∞). Les sauvegardes gardent alors 999 999 999 ¢ : si on le désactive, prévoir de ramener ces sauvegardes à un montant normal au chargement.

## Mécaniques
- Minerais (`fer`, `titane`, `cristal`, `or`) : dans `GOODS` (min:1), stockés dans `G.cargo`, butin typé via `spawnDrops(p,n,min)`. Astéroïdes : `astHit` (story.js), fragments. Filons : `GR.deps` (ground.js).
- `chars.js` : personnages articulés `buildHuman(o)` (rôles merchant/mechanic/miner/guard/scientist/alien, casque, visière, outil) et `animHuman` (marche, course, respiration, gestes, regard). Utilisés pour le joueur à pied, les PNJ et l'astronaute des autres joueurs.
- `explore.js` : points d'intérêt des planètes (épaves récupérables, caisses, bunker + terminal, monolithe, campement avec donneur de quêtes, plantes rares, faune scannable, oiseaux), quêtes `G.pq`, brouillard d'exploration `G.pexp` (64×64, base64) et carte de planète (`drawMap`/`openMap` surchargés en mode surface). Butin déjà pris : `G.loot[planète]` (ids `k#` caisses, `w#` épaves, `sp#` espèces).
- `planet2.js` : rochers bosselés (`ROCKG`), végétation propre à chaque type de planète (`addFlora`, modèles fusionnés `floraGeo`/`mergeG`), eau (écume du rivage, profondeur) et lave (croûte + fissures) en shaders (`liquidMat`, carte des hauteurs `hmapTex`), petits détails autour du joueur (`initNear`/`updNear`). Attention : `half` est un mot réservé en GLSL.
- `daynight.js` : jour/nuit sur les planètes (`DN`, journée de 12 min réglée sur l'horloge réelle, `DN.force` pour forcer l'heure en test), ciel en shader avec étoiles, lune, phare/lampe frontale (SpotLight toujours présent pour éviter les recompilations), reflets d'environnement propres à la planète (`planetEnv`).
- `gfxplus.js` : entrée atmosphérique (traînée, son, refroidissement à l'arrivée), vaisseaux (relief des panneaux `HULLN`, reflets sur mobile, fumée/étincelles/feu selon les dégâts), distorsion de chaleur (passe GRADE, PC), explosions (`bigBoom` : onde de choc, débris, lumières en réserve `poolLight` — ne jamais créer de PointLight à la volée), espace (nébuleuses, ceintures d'astéroïdes décoratives, trafic autour des stations), libération de la géométrie en quittant une planète.
- `weather2.js` : tempêtes cycliques (`wxStorm`), éclairs et tonnerre, éclaboussures, voiles de sable/neige, tourbillons de poussière, brume des vallées, traces de pas, poussière du jetpack et du vaisseau en rase-mottes.
- `ui.js` (dernier module) : icônes SVG maison (`ICONS`, sprite injecté dans la page), `ICO(nom)` pour les insérer dans du HTML, `actLabel()` (emoji + MAJUSCULES → icône + phrase), `btnSet(id,icône,libellé)` pour les boutons tactiles. Les toasts restent en texte (emojis).
- Station au sol : objet `GR.st` avec `ground:true` (et `foot:true` quand on parle au marchand à pied → seuls Marché/Armes).

## Pièges connus
- `netroom.js` : ne jamais passer l'objet `mine` directement à `up()` (il est gelé par `Object.freeze`, la présence ne se mettrait plus à jour).
- En test headless (SwiftShader) les images sont lentes : appeler `placeShip()/updCam()` à la main avant une capture.

## Vérifier avant de pousser
`python3 build.py --check /tmp/g.js && node --check /tmp/g.js`
