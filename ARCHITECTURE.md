# Architecture

## Client loop

`requestAnimationFrame` / Android `Choreographer` → `Match.update(dt)` → canvas draw.
Logical resolution 1080×2340, scaled with letterboxing. `dt` clamped to 50ms.

## Match state

Two sides × N carousel logs × M slots. Each slot has an active tower and a reserve clone.
Minions live in two vertical lanes. Projectiles home. Particles / floaters are ephemeral.

Win: timer, or zero living towers. Tie-break chips → remaining HP.

## Persistence

Web: `localStorage['highroller.v1']`.
Android: `PlayerStore` SharedPreferences (Room-ready).
Online: Supabase `players`, `inventory`, `match_history`, `achievements`.

## Networking

```
Client ──REST──► Supabase Edge /matchmake
              └──► Colyseus joinOrCreate('highroller_room')
Client ──WS──► HighRollerRoom (authoritative sim @ 20 Hz, patches @ 20 Hz)
```

Offline: rule-based AI (difficulty from opponent tier / tournament round).
