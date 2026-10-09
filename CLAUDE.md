# Starfarer 3D

Jeu spatial 3D monde ouvert (Three.js r128) de William, en français. En ligne : https://starvody.netlify.app

## Déploiement
- Netlify (projet `starvody`) est relié à ce dépôt : **chaque push sur `main` met le site en ligne** (~30 s).
- `index.html` et `public/index.html` sont GÉNÉRÉS (identiques) : ne pas les éditer à la main. Modifier `src/`, puis `python3 build.py`, puis commit + push.
- `netlify.toml` : Netlify publie le dossier `public/` (pas la racine, pour ne pas publier `node_modules`) et construit les fonctions de `netlify/functions/`.
- Sauvegarde cloud : `netlify/functions/save.mjs` (route `/api/save?code=SF-XXXXXXXX`, GET/POST), stockage Netlify Blobs (`@netlify/blobs` dans `package.json`, installé par Netlify).

## Structure
- `src/shell.html` : HTML/CSS/HUD, avec les marqueurs `%%FONTS%%`, `%%THREE%%` et `%%GAME%%`. Style « instruments de bord » : panneaux à coins coupés (clip-path), jauges segmentées (mask), jetons CSS dans `:root` (`--ice`, `--amber`, `--hf`…).
- `src/fonts/` : police Chakra Petch (OFL) réduite au latin, intégrée en base64 par `build.py` (pas de chargement externe).
- `src/*.js` : modules concaténés dans cet ordre (voir `build.py`) : core, audio, gfx, models, world, game, surface, fx, ultra, detail, content, lasers, parts, cockpit, speed, sounds, visuals, chars, ground, story, explore, planet2, daynight, gfxplus, weather2, prog, … base, netroom, mp, mpplus, hud, ui, options (ordre exact dans `build.py`). Tout est au niveau global (pas de modules ES).
- `core.js` : `PARTS` (pièces de l'Atelier) et `PM(clé)` = multiplicateurs des pièces installées (coque, vitesse, cadence, bouclier…).
- `parts.js` : visuels des pièces (enveloppe `buildShip(P, aLeLaser)`), onglet 🔧 Atelier, aperçu, achat. `lasers.js` : tirs lumineux, rayon laser (shader), éclairs/impacts, son du laser. `cockpit.js` : vue cockpit (touche V / bouton 👁), tableau de bord 3D posé devant la caméra, écrans dessinés sur canvas, viseur tête haute `ckHUD`, mouvements de tête. `speed.js` : poussière en traînées (sensation de vitesse), souffle et voile du boost. `sounds.js` : sons des armes par type de canon, rugissement du boost (`nzf` = bruit filtré ; ne pas nommer `nz`, déjà pris par la musique dans story.js). `visuals.js` : couronne solaire. `ground.js` : planètes — avant-poste (piste = station au sol), PNJ et marchand, filons de minerai, mode à pied (`FOOT`), caméra et commandes à pied.
- `src/three-examples/` : post-process Three.js r128 (bloom…) incorporés tels quels.
- Multijoueur : `mp.js` utilise la capacité `room` des artefacts Claude si présente, sinon `netroom.js` (PeerJS, WebRTC en étoile, salon via `#code` dans l'URL, `public` par défaut).
- `dev/mockpeer.js`, `dev/mockroom.js` : faux réseau (BroadcastChannel) pour tester le multijoueur en local.

## Réglages
- `ARGENT_ILLIMITE` (core.js) : désactivé (économie réelle). Les anciennes sauvegardes sans `eco` qui avaient 999 999 999 ¢ sont ramenées à 2 500 ¢ au chargement. Nouvelle partie : 1 500 ¢.
- Prix de base : `HULLS`/`WPN`/`AMMO` (core/content), `PPRICE` et `CRAFT` (prog.js). `applyPerks()` recalcule les prix avec la réduction de l'Alliance (garde les prix d'origine dans `p0`).

## Mécaniques
- Minerais (`fer`, `titane`, `cristal`, `or`) : dans `GOODS` (min:1), stockés dans `G.cargo`, butin typé via `spawnDrops(p,n,min)`. Astéroïdes : `astHit` (story.js), fragments. Filons : `GR.deps` (ground.js).
- `chars.js` : personnages articulés `buildHuman(o)` (rôles merchant/mechanic/miner/guard/scientist/alien, casque, visière, outil) et `animHuman` (marche, course, respiration, gestes, regard). Utilisés pour le joueur à pied, les PNJ et l'astronaute des autres joueurs.
- `explore.js` : points d'intérêt des planètes (épaves récupérables, caisses, bunker + terminal, monolithe, campement avec donneur de quêtes, plantes rares, faune scannable, oiseaux), quêtes `G.pq`, brouillard d'exploration `G.pexp` (64×64, base64) et carte de planète (`drawMap`/`openMap` surchargés en mode surface). Butin déjà pris : `G.loot[planète]` (ids `k#` caisses, `w#` épaves, `sp#` espèces).
- `planet2.js` : rochers bosselés (`ROCKG`), végétation propre à chaque type de planète (`addFlora`, modèles fusionnés `floraGeo`/`mergeG`), eau (écume du rivage, profondeur) et lave (croûte + fissures) en shaders (`liquidMat`, carte des hauteurs `hmapTex`), petits détails autour du joueur (`initNear`/`updNear`). Attention : `half` est un mot réservé en GLSL.
- `daynight.js` : jour/nuit sur les planètes (`DN`, journée de 12 min réglée sur l'horloge réelle, `DN.force` pour forcer l'heure en test), ciel en shader avec étoiles, lune, phare/lampe frontale (SpotLight toujours présent pour éviter les recompilations), reflets d'environnement propres à la planète (`planetEnv`).
- `gfxplus.js` : entrée atmosphérique (traînée, son, refroidissement à l'arrivée), vaisseaux (relief des panneaux `HULLN`, reflets sur mobile, fumée/étincelles/feu selon les dégâts), distorsion de chaleur (passe GRADE, PC), explosions (`bigBoom` : onde de choc, débris, lumières en réserve `poolLight` — ne jamais créer de PointLight à la volée), espace (nébuleuses, ceintures d'astéroïdes décoratives, trafic autour des stations), libération de la géométrie en quittant une planète.
- `weather2.js` : tempêtes cycliques (`wxStorm`), éclairs et tonnerre, éclaboussures, voiles de sable/neige, tourbillons de poussière, brume des vallées, traces de pas, poussière du jetpack et du vaisseau en rase-mottes.
- `ui.js` (dernier module) : icônes SVG maison (`ICONS`, sprite injecté dans la page), `ICO(nom)` pour les insérer dans du HTML, `actLabel()` (emoji + MAJUSCULES → icône + phrase), `btnSet(id,icône,libellé)` pour les boutons tactiles. Les toasts restent en texte (emojis).
- `prog.js` : niveau de pilote (`G.xp`, `lvInfo`, `gainXP`), réputation (`G.rep`, `FAC`, `rankOf`, `addRep`, avantages via `SELLK`/`TRAVK`), plans (`G.bp`, `giveBlueprint` remplace `giveRarePart`), fabrication (`CRAFT`, onglet Fabrication), entrepôt personnel (`G.stash`, 300 places), panneau Profil (touche P). Les gains d'XP sont branchés en enveloppant `hitEnemy`, `complete`, `trade`, `minToast`, `questTalk`, etc.
- `base.js` : bases planétaires (`G.bases[planète]`, 3 max, niveau 3) : modules `BMOD` (foreuse, serre, silo, tourelle, hangar, mât), production calculée sur l'heure réelle (`baseTick`), terminal → panneau `#bpanel`, piste privée du hangar (`groundDock` avec `base:true`), raids de drones (`BS.drones`, ajoutés à `SURF.extra`).
- `mpplus.js` : dreadnought mondial (`WB`, toutes les 20 min pendant 8 min selon `Date.now()`, PV partagés via la présence `wb`), chasses de groupe (`G.gm`, présence `gm`), échanges entre joueurs (`TRX`, présence `tr`). Les champs de présence passent par `mpExtraOut()`.
- `options.js` (dernier module) : panneau Options (touche O) : qualité (PC : `cycleQuality` ; mobile : `GQL` 0-2), volumes musique/effets (bus `MVOL`), sensibilité (`OPT.sens`), manette (Gamepad API, `updGamepad`), sauvegarde cloud (`CLOUD`, code `SF-XXXXXXXX` dans `sf-cloud`).
- Station au sol : objet `GR.st` avec `ground:true` (et `foot:true` quand on parle au marchand à pied → seuls Marché/Armes).

## Pièges connus
- `netroom.js` : ne jamais passer l'objet `mine` directement à `up()` (il est gelé par `Object.freeze`, la présence ne se mettrait plus à jour).
- En test headless (SwiftShader) les images sont lentes : appeler `placeShip()/updCam()` à la main avant une capture.

## Vérifier avant de pousser
`python3 build.py --check /tmp/g.js && node --check /tmp/g.js`
