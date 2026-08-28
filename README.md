# Hi Roller

> Say hi to the roller.

Hi Roller is a portrait-first, skill-based reel strategy game: build a nine-tower strip, rotate slot-machine cabinets, defend the tracks between their windows, and specialize a 100-tower collection through talent trees.

[Play the web preview](https://artistso.github.io/Hi-roller/) · [Release guide](docs/RELEASE.md) · [Roadmap](docs/ROADMAP.md) · [Privacy](docs/PRIVACY.md)

## Current preview

Playable now:

- three-minute Practice and five-minute Solo League matches against local CPU opponents;
- 100 tower definitions across 10 families, a nine-tower reel strip, and generated 10-node talent trees;
- local progression, cosmetics, achievements, weekly solo bracket preview, synthesized audio, haptics, and offline caching;
- one shared browser client packaged both as a PWA and an Android WebView app;
- an authoritative Colyseus room and Supabase schema that compile as integration foundations.

Not live yet: accounts, real matchmaking, live leaderboards, server reconciliation, payments, analytics, and Play Games Services. The in-game roadmap labels these boundaries directly.

## Repository

```text
app/                  Android shell; packages game/ into the APK at build time
game/                 playable HTML5/PWA client and GitHub Pages source
server/               Colyseus authoritative-room server
supabase/             RLS schema and edge-function scaffold
prototype/            preserved native Kotlin Canvas prototype
tests/                deterministic game-math checks
scripts/              web validation and release helpers
.github/workflows/    Android, Pages, and quality automation
```

The original upload contained the intended files in one flat directory, plus an exported `.git` directory. Version 0.2 restores the documented project structure and removes those accidental repository-internal files.

## Run the game

```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory game
```

Open `http://127.0.0.1:8080/`.

## Validate

```bash
find game/js -name '*.js' -print0 | xargs -0 -n1 node --check
node scripts/validate-web.mjs
node tests/game-math.mjs

cd server
npm ci
npm run build
```

The math suite locks important invariants: exactly 100 towers, monotonic XP thresholds, bounded upgrade multipliers, capped simulation delta, no chip loss on rejected inputs, temporary match upgrades, and trap lifetimes independent of entity count.

## Android

The Android build targets Android 16 / API 36, uses JDK 17, and bundles the current `game/` directory during `preBuild`.

With Gradle 8.13 installed:

```bash
gradle :app:assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`.

Every pull request publishes an installable debug APK as a GitHub Actions artifact. When the repository's Play upload-key secrets are present, the same workflow also produces a signed release APK and Android App Bundle. See [docs/RELEASE.md](docs/RELEASE.md).

## Product principles

- Skill and readable decisions over disguised randomness.
- No gameplay advantage sold for money.
- Cosmetic monetization only when a payment system is intentionally added.
- Offline Practice remains available.
- Preview simulations are labeled as previews; local data is not presented as a live service.
- The center and lower-middle playfield stay clear during live matches.

## Creator

Created by Steven Owens / [artistso](https://artistso.com). Source and preview assets are project materials in this repository; no third-party game characters or licensed casino brands are used.
