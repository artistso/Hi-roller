# Architecture

## Shipping client

`game/` is the canonical client. GitHub Pages serves it directly, and the Android `syncWebGame` Gradle task copies the same files into generated APK assets. This eliminates feature drift between the web preview and Android build.

```text
Input / DOM HUD ──► Match commands ──► deterministic-step simulation
                         │                         │
                         └──────── Canvas draw ◄──┘

game/ ──► GitHub Pages
   └────► Android generated assets ──► WebView APK
```

The client runs a logical 1080×2340 portrait simulation. Rendering letterboxes into the physical viewport, caps device-pixel ratio according to the graphics setting, and clamps each simulation step to 50 ms.

## State boundaries

| State | Lifetime | Storage |
|---|---|---|
| Match chips, temporary tower levels, cooldowns, entities | one match | memory |
| Profile, unlocks, workshop starting levels, talents, cosmetics | device | `localStorage['hiroller.v2']` |
| Accounts, inventory, match records | future online service | Supabase schema |
| Authoritative 1v1 simulation | future online service | Colyseus room memory |

Temporary upgrades begin at the player's persistent Workshop level, cost match chips, and never mutate the saved starting level. This prevents a match-currency exploit in which a temporary purchase permanently advanced progression.

## Game loop

`requestAnimationFrame` calls `Match.update(dt)` and then `Match.draw(...)`.

- `dt` is capped at 0.05 seconds.
- cabinet expansion occurs at 33% and 66% elapsed time;
- traps age once per simulation frame, not once per minion;
- rejected actions do not consume chips;
- upgrade tables express the absolute bonus at a level, not a sum of earlier table entries.

The math invariants are executable in `tests/game-math.mjs`.

## Android

The Android module is a deliberately thin shell:

- API 26 minimum, API 36 compile/target;
- portrait immersive WebView;
- JavaScript, DOM storage, synthesized audio, local file access, and hardware acceleration;
- external HTTP(S) links leave the app and open in the user's browser;
- a narrow JavaScript bridge exposes only platform detection and app closing to bundled local content;
- browser debugging is enabled only in debug builds.

The earlier native Kotlin Canvas experiment is preserved under `prototype/native-android/` and is not compiled into the shipping application.

## Online path

```text
Authenticated client ──► Supabase Edge matchmaking
          │                         │
          │                         └──► room endpoint + token
          └──────── WebSocket ─────────► Colyseus HighRollerRoom
```

The checked-in Colyseus room compiles and owns countdown, chips, minions, combat, inputs, and match termination. It is not yet connected to the shipping client. Before online beta it still needs token validation, deterministic reconciliation, reconnect policy, abuse limits, persistence writes, integration tests, and deployment configuration.
