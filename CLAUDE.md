# Starfarer 3D

Jeu spatial 3D monde ouvert (Three.js r128) de William, en français. En ligne : https://starvody.netlify.app

## Déploiement
- Netlify (projet `starvody`) est relié à ce dépôt : **chaque push sur `main` met le site en ligne** (~30 s).
- `index.html` et `public/index.html` sont GÉNÉRÉS (identiques) : ne pas les éditer à la main. Modifier `src/`, puis `python3 build.py`, puis commit + push.
- `netlify.toml` : Netlify publie le dossier `public/` (pas la racine, pour ne pas publier `node_modules`) et construit les fonctions de `netlify/functions/`.
- Fonctions Netlify (`netlify/functions/`, stockage Netlify Blobs, `@netlify/blobs` dans `package.json`) : `save.mjs` (`/api/save?code=SF-XXXXXXXX`, sauvegarde cloud), `war.mjs` (`/api/war`, influence des territoires partagée, décroît de moitié en 48 h), `board.mjs` (`/api/board`, classements par semaine ISO), `market.mjs` (`/api/market`, hôtel des ventes). Écritures conditionnelles (`onlyIfMatch`/`onlyIfNew`) avec nouvelles tentatives.
- Côté jeu, ces fonctions ne sont appelées que sur le site publié (`API_OK` dans svc.js) ; en local, ajouter `?api` à l'URL et servir les fonctions (banc d'essai : serveur Node + faux `@netlify/blobs` en mémoire).

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

## Mise à jour « 10 nouveautés » (modules après options.js)
- Ordre : `svc, codex, law, wing, tools, anomaly, war, fmiss, race, derelict, board` (voir `build.py`).
- `svc.js` : onglet **Services** des stations (`svcAdd({o,ic,t,show,html})`, actions `SVC.act[k]` appelées par `data-sv="k:arg"`), bandeau d'annonce `banner()`, crochets par image `TICK` (toujours) et `STICK` (simulation spatiale), données des nouveaux modules dans `G.x` (sauvegardé tel quel, `GX(clé,défaut)`), `api()`/`API_OK`, objets uniques (`uniq`) cachés de la boutique tant qu'on ne les possède pas. `stFac(st)` = faction de la station (remplacée par war.js).
- `codex.js` : Journal de bord (touche J, bouton `#cxb`, panneau `#cxpanel`) : succès `ACH` (récompenses, titres `G.x.title`), codex `G.x.cx` (`cxAdd(cat,id)`, `cxLog(texte)`), statistiques `G.x.st` (`STS`).
- `law.js` : contrebande `ILLG` (window.ILLG, hors `GOODS`), marché noir (`bmAt`), douane des stations de l'Alliance (scan à 1 100 m, saisie + amende), prime `G.x.law.b` (étoiles, police `kind:'police'`, chasseurs de primes `kind:'hunter'`), bureau des primes, pièce « Double fond ».
- `wing.js` : alliés `FR` (`frSpawn({kind:'wing'|'ally'|'freighter'|'platform'})`, tirs `FB`, les pirates leur tirent dessus, `e.tgF` = cible alliée imposée), ailiers recrutés au bar (`G.x.wing.list`, rôles chasseur/garde/mineur, salaire toutes les 10 min de jeu, capsule de survie dès le niveau 3).
- `tools.js` : outils dans les armes (`drill`, `tractor`, `scanner`, `probe` + munitions `G.ammo.probe`), astéroïdes riches (`RICH`, seul le laser de minage fait des dégâts pleins : `DRILLING`), conteneurs dérivants (`CONT`, révélés par le scanner), vaisseaux `prospecteur`, `explorateur`, uniques `sentinelle`, `mastodonte` (visuel : `shipDeco` sur une coque de base).
- `anomaly.js` : trous noirs (lentille gravitationnelle en shader qui dévie la nébuleuse, matière exotique `exo` dans `window.RAREG`), trous de ver (`wormJump`), tempêtes ioniques (radar brouillé, boucliers coupés, cristaux). Anomalies fixes `ANFIX` + anomalies des secteurs (`anCell`), connues dans `G.x.anom`.
- `war.js` : secteurs de 12 km (`secOf`), influence `influ(sid)` = base + `G.x.warD` (serveur) + `WAR.pend` (à envoyer), `warAdd(n,pos)`, contrôle `ctlOf` (alliance / pirates / front), batailles de frontière, territoires sur la carte.
- `fmiss.js` : chaînes de missions `FMC` (alliance, guilde, carto ; 5 missions, étapes `goto/kill/escort/scan/collect/deliver/disc/beacons/item/rich/defend/bridge/worm/choice`), état `G.x.fm`, choix dans `#chc`, `fmEvent()` pour les événements externes.
- `race.js` : un circuit par station (`circuit(st)`), fantôme dans `localStorage` (`sf-gh-…`), médailles, défis multijoueur via la présence (`rc`).
- `derelict.js` : épaves géantes (`DERFIX` + `derCell`), entrée par le sas → **mode `'int'`** (scène `DER.scene`, `derUpdate/derCam/derOverlay/derInfo/derRadar/derPrompt/derAction` appelés par hud.js et game.js), plan généré (salles + couloirs, portes `doorsM`, piratage `DER.hack`), drones/tourelles, salle en apesanteur, coffre du capitaine. Butin pris : `G.x.der[id]`.
- `board.js` : classements (`SEA` = saison ISO de la semaine, récompenses du top 10 la semaine suivante, titre + peinture `paint:laurier`), hôtel des ventes (`#mkpanel`).

## Équilibrage (référence)
- Contenu total à acheter ≈ 430 000 ¢ (améliorations 58 k, vaisseaux 158 k, armes/outils 37 k, pièces 133 k, fabrication 46 k). Succès ≈ 69 k au total (récompenses divisées par 2 dans codex.js).
- Courses : médailles Or/Argent/Bronze = L/235+3, L/195+3, L/160+3 s (un robot pilote fait ≈ 37 s avec l'Éclaireur de base sur 7,8 km, ≈ 28 s avec un Intercepteur amélioré). Gain plein seulement pour une nouvelle médaille sur le circuit, 20 % ensuite, inscription 100 ¢.
- Contrebande : le prix baisse de 5 % par unité vendue au même endroit (remonte d'une unité toutes les 30 s) ; patrouilles douanières (passives tant qu'on ne fuit pas : `e.passive`) en territoire Alliance/frontière, pirates rivaux en territoire pirate.
- Batailles de frontière : 400 + 100 ¢ par frégate survivante, seulement si le joueur a abattu au moins un pirate. Drones d'épave : 30 min avant de réapparaître (`G.x.der[id].dd`), ceux de l'alarme ne rapportent rien.
- Options → « Signaler un problème » : rapport à copier (version, appareil, lieu, missions, 8 dernières erreurs/avertissements de la console).
- Mise à jour auto : `UPD` (svc.js) compare la balise `sf-build` de la page en ligne ; recharge au retour dans l'appli ou au prochain amarrage. Garde-fou : crédits ≥ 100 M → 2 500 ¢.

## Pièges connus
- `netroom.js` : ne jamais passer l'objet `mine` directement à `up()` (il est gelé par `Object.freeze`, la présence ne se mettrait plus à jour).
- En test headless (SwiftShader) les images sont lentes : appeler `placeShip()/updCam()` à la main avant une capture.
- Noms globaux : tout est dans le même script, un `const` en double casse tout (`node --check` le signale) et une `function` en double remplace l'autre sans prévenir. Préfixer les noms des nouveaux modules (ex. `DRMAT`, `DTS` dans derelict.js).
- Mode `'int'` (intérieur d'épave) : tout code qui suppose « pas espace = planète » doit tester `mode=='surf'`.

## Vérifier avant de pousser
`python3 build.py --check /tmp/g.js && node --check /tmp/g.js`
