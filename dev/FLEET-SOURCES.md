# Fleet 2.9 provenance

Original artwork: Quaternius, Ultimate Spaceships Pack, CC0 1.0.
https://quaternius.com/packs/ultimatespaceships.html

The original download is on Google Drive. Its browser download did not complete in this environment, so the Blender geometry and matching Blue albedo PNGs were obtained from Malcolm Nixon’s CC0 Godot conversion mirror:
https://github.com/Malcolmnixon/Quaternius-Ultimate-Spaceships-Pack

The creator page and the mirror’s pack License.txt both identify CC0. The full dedication and source credits ship in THIRD_PARTY_NOTICES.txt. Source SHA256 hashes are recorded in FLEET-SOURCES.json. No downloaded code was executed. The existing local blend2obj.py reader extracted mesh data and UVs. Textures were reduced to 512px JPEG; geometry was centred, oriented toward -Z and quantised for storage (16-bit position / 8-bit normal / 16-bit UV), then decoded to native Three.js buffers.

Civilian craft: Kenney, Space Kit, CC0.
https://kenney.nl/assets/space-kit
Downloaded directly from the creator’s page; the archive’s License.txt was checked and retained in THIRD_PARTY_NOTICES.txt. Eight craft_* GLBs were selected. Geometry and original face colours were retained, merged into one vertex-coloured mesh per craft.

Role assemblies, weapons, mining equipment, antennae, cargo modules and organic Xil models are Starfarer adaptations. Two craft based on one imported hull have different geometry assemblies, proportions/equipment and roles; they are not claimed as wholly original third-party hulls.

src/fleet-data-v29.js is the distributable packed source library and includes per-asset author, source URL, license and hashes. src/fleet-v29.js assembles all 41 named models. dev/export-fleet-v29.cjs regenerates portable GLBs directly from that library without network or Blender. dev/build-fleet-gallery.cjs regenerates public/ships.html.

Optional source reimport: dev/import-fleet-v29.cjs expects the 11 OBJ/JPEG pairs and eight Kenney craft GLBs under ignored dev/fleet-sources29/. Acquisition files are kept in the task’s work/assets-sources29/ directory, outside the repository. Build does not require those originals.
