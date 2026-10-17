# CrazyGames build — technical candidate

This build targets a **Basic Launch in solo mode**. It is not submission-ready:
the current game is French, whereas CrazyGames requires English localization.
The dialogue, missions, item descriptions and dynamic UI still need a complete
English catalog, with SDK locale selection and English fallback. Do not advertise
this archive as fully compliant or approved.

## Build and validation

Run `python -X utf8 build.py --portal` to create `dist/crazygames.zip`.
Upload the ZIP contents with `index.html` at its root. Do not upload the Vercel
build as a CrazyGames build. Run `node --test tests/crazygames-boot.cjs` for the
SDK initialization/storage failure cases.

The portal build includes Three.js, fonts, models and cities. Only the official
CrazyGames SDK is loaded externally. It does not use PeerJS, the custom save-code
service, multiplayer chat or the Vercel market/leaderboard endpoints. The normal
Vercel build retains its network functionality.

The SDK initializes before any progress is read. Its Data module is the sole
storage authority for progression and preferences. On an initialization failure,
the game offers retry without loading or overwriting a separate local save.
No reload-based save merge or global Storage prototype patch is used.
Loading, gameplay start/stop, menu/photo/death breaks and platform audio mute are
integrated. Backgrounding suspends sound; interaction can resume interrupted
iOS audio. Tutorial flight controls precede story dialogue and remain skippable.
Ctrl/Cmd browser shortcuts do not trigger the main gameplay input handler.

## Submission settings and remaining review

- After full English localization, choose HTML5 and solo; no login is required.
- Progress Save: **Yes, using the Data Module from the CrazyGames SDK**.
- This candidate makes no ad requests (Basic Launch).
- Test the actual uploaded game in CrazyGames Preview: guest/registered saves,
  account transitions, platform mute, small iframe sizes, touch and orientations.
- Test Chrome and Edge, plus Safari/iOS before claiming those are supported;
  verify low-memory Chromebook performance on real hardware.
- Check rights to all models, textures, music, cover images and the game name.
  Existing assets were preserved; this work does not establish ownership rights.
- Add the required covers/videos in the developer portal; they are separate from
  the playable ZIP. CrazyGames makes the final publication decision.

References: [quality](https://docs.crazygames.com/requirements/quality/),
[gameplay](https://docs.crazygames.com/requirements/gameplay/),
[technical](https://docs.crazygames.com/requirements/technical/),
[Data SDK](https://docs.crazygames.com/sdk/data/),
[Game SDK](https://docs.crazygames.com/sdk/game/).
