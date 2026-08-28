# HI ROLLER

Say hi to the roller.

Skill-based RPG / MOBA tower defense. Cabinets are **slot machines**. Minions walk the **tracks between windows**. One hundred towers, each with its own **talent tree** and **in-match upgrades**. Painterly, late-90s-to-mid-2000s cartoon look — Breath of the Wild lighting, original characters.

Playable client lives in `game/`. Native Android, Colyseus, and Supabase ship beside it.

**GitHub:** [artistso/Hi-roller](https://github.com/artistso/Hi-roller)

---

## Play

```bash
cd game
python3 -m http.server 8080 --bind 0.0.0.0
```

Or GitHub Pages (Actions workflow deploys `game/` on every push to `main`):

`https://artistso.github.io/Hi-roller/`

Enable **Settings → Pages → GitHub Actions** once on the repo.

### How it plays (skill, not pay)

| | |
|---|---|
| **Loadout** | Nine towers on your reel strip. Order is the strip the cabinet pulls from. |
| **Spin** | Swipe a cabinet or hit SPIN (50 chips). Windows reel like a slot machine and land a fresh tower from the strip. Auto-spins under 20% HP. HP 0 before the spin **crumbles** the window. |
| **Tracks** | Dirt paths run *between* the windows, not around the edge. Minions pick a gutter and march. Towers shoot adjacent tracks. |
| **Talents** | Every tower has a 10-node tree (two branches + capstone). Talent points from leveling. Specialize — you cannot max all 100. |
| **In-match** | Spend match chips to raise a type to 4. Separate from the tree. Trees are the long game; chips are the hand. |
| **100 towers** | Ten families of ten: Reelworks, Wheelhouse, Cardcourt, Diceden, Chipforge, Greenfelt, Emberpit, Mistveil, Ironwager, Starante. Signature tower: **Hi**. |

Practice 3:00 · Ranked 5:00 · Weekly 64-player Friday tournament.

---

## Repo

```
game/          playable HTML5 client (this is also GitHub Pages)
app/           Kotlin + Canvas GameView, API 33, arm64-v8a, applicationId com.hiroller
server/        Colyseus highroller_room + Dockerfile
supabase/      RLS schema + edge functions
.github/       release APK + Pages
scripts/make-keystore.sh
```

---

## Signed release APK (not debug)

1. `STOREPASS=... ./scripts/make-keystore.sh`
2. GitHub repo secrets:
   - `KEYSTORE_BASE64` — `base64 -w0 keystore/hiroller.jks`
   - `KEYSTORE_PASSWORD` · `KEY_ALIAS` (`hiroller`) · `KEY_PASSWORD`
3. Push to `main`. Actions job **Release APK** runs `assembleRelease` and uploads `hiroller-release`.
4. Never commit `.jks` or `keystore.properties`.

Locally, with `keystore.properties` present:

```bash
./gradlew :app:assembleRelease
# app/build/outputs/apk/release/app-release.apk
```

Epic Games Store (Android) and GitHub Releases take that APK.

---

## Art & audio

- Characters restyled from the original portraits into cartoon, cel-shaded select busts (original designs, no licensed IP).
- Loopable action music is synthesized in-engine (132 BPM battle loop, 92 BPM campfire loop) — 8 bars, seams on the tonic. Settings toggle music / SFX / haptics / graphics.

---

## Android Studio

Open this folder, JDK 17, run **app** portrait on an S24 FE / arm64 emulator. `GameView` is the native battlefield. Web client is the content-complete build.
