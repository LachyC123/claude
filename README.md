# THE HOLLOW CROWN — Prologue: The Grave Wakes

A playable vertical slice of *The Hollow Crown*, the dark-fantasy pixel action RPG from the full
game plan document. You wake as the **Gravebound** in a mass grave, bound to the lantern spirit
**Vela**, and fight your way through the Candlefall Graveyard — past the risen dead and
**The Gravekeeper** — to light the first flame of Candlefall Chapel.

**Zero dependencies, zero assets.** Every sprite, tile, sound, and piece of music is generated in
code. Just open `index.html` in a browser (double-click works — no server needed).

## Controls

| Input | Action |
| --- | --- |
| `WASD` / arrows | Move |
| `J` / `X` | Attack (chains into a 3-hit combo — third hit is a heavy lunge) |
| `Space` / `K` | Dodge roll (invincibility frames) |
| `L` / `Shift` | **Ash Guard** — the Ash Knight class ability, 75% damage reduction for a moment |
| `F` | Drink an ember flask (heals; 3 charges, refill at the brazier or from drops) |
| `E` / `Enter` | Interact / advance dialogue |
| `Esc` / `P` | Pause |

Add `?debug` to the URL for dev keys: `1`/`2` teleport, `3` jump to chapel, `G` heal + souls.

## What's in the slice

This implements **Milestones 0–7** of the plan's build roadmap (§16), scoped to the Prologue quest
(§9, "The Grave Wakes"):

- **Combat prototype** — stamina-based melee with combos, dodge i-frames, guard, knockback,
  hit-stop, screen shake, damage numbers (Milestone 0)
- **Pixel visual direction** — deep navy / charcoal palette, warm lantern light against cold blue
  fog, rain, dynamic 2D lighting with flicker, readable chunky silhouettes (Milestone 1, §3)
- **Candlefall Chapel hub, Stage 0 → Stage 1** — ruined chapel, one dying NPC (Brother Cole),
  brazier rest point; lighting the flame visibly transforms the hub: windows glow, darkness lifts,
  music warms (Milestones 2 & 7, §7)
- **RPG systems** — Remembrance souls from kills, the Shrine spends it on Health / Stamina /
  Strength; ember flasks; checkpoints (Milestone 3, §12)
- **Tutorial graveyard** — mass grave opening, weapon pickup, scripted rising dead, gated combat
  zones, exploration pickups (Milestone 4)
- **First boss** — The Gravekeeper: shovel swings, corpse summons, and a bell-shockwave second
  phase, exactly as speced in §11; 3 phases, boss bar, arena gates (Milestone 6)
- **Quest & dialogue system** — objective tracker, portrait dialogue with Vela / Cole /
  the Gravekeeper, triggers, multi-map flow, prologue end screen

## Architecture (how the full game grows from here)

Plain ES5, no build step. Load order in `index.html`:

```
src/core.js      input · camera/shake · particles · floaters · 5x7 bitmap font · WebAudio synth + music modes
src/sprites.js   ASCII-pixel-map characters + procedural props/tiles (all art is data)
src/world.js     map definitions · tile grid · collision · gates · triggers · lighting/fog/rain passes
src/entities.js  player · Vela · ENEMY_DEFS registry + shared AI · Gravekeeper · projectiles · pickups
src/dialogue.js  script data · dialogue box UI · quest tracker
src/game.js      state machine (title/play/dialogue/upgrade/dead/end/pause) · events · HUD · main loop
```

Everything expansion-shaped is **data, not code**:

- **New enemy family** → add a row to `HC.ENEMY_DEFS` and a sprite (§11's enemy table maps 1:1)
- **New region** (Briarwood, Ironmere…) → add a map def to `HC.maps`: rows built with the
  alignment-safe `HC.row('26:,','4:p','14:,')` builder, plus coordinate lists for props, spawns,
  gates, and triggers (Milestone 10)
- **New quest beat** → a trigger rect + a script entry in `HC.script` + an event case
- **New boss** → follow `makeGravekeeper`'s state-machine pattern (Sir Alric next, per §17)
- **Hub growth stages** → `world.setChapelLit()` shows the pattern: swap sprites, add lights,
  lower darkness, change music

## Next milestones (from the plan doc)

1. **Quest 1: Light the Chapel** — burned village mini-zone, the Bram-or-Lysa choice (Milestone 8)
2. **The Bell Tower** — Bell-Ringer Twins mini-boss
3. **Chapel Catacombs** — first real dungeon: shortcuts, traps, elite enemy (Milestone 5)
4. **Sir Alric the Kneeling Knight** — first shard of the Mourning Blade
5. Companion system (Mara Vey), save/load, menus polish (Milestone 9)

*Build in small, finished passes. Do not build every region at once.* — the plan's final rule,
and this codebase's too.
