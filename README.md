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

This implements **Milestones 0–10** of the plan's build roadmap (§16), covering the Prologue
(§9, "The Grave Wakes"), **Quest 1** ("Light the Chapel") with its signature moral choice, and
**Quest 2** ("The Bell Tower") with a two-body mini-boss:

- **Combat prototype** — stamina-based melee with combos, dodge i-frames, guard, knockback,
  hit-stop, screen shake, damage numbers (Milestone 0)
- **Pixel visual direction** — deep navy / charcoal palette, warm lantern light against cold blue
  fog, rain with landing splashes, drifting ash motes caught in the light, dynamic 2D lighting
  with flicker (warm / cold / cursed-violet channels), soft grounding shadows, readable chunky
  silhouettes, and a lived-in world: lantern posts, barrels, crates, flowers, bone piles, puddles,
  glowing mushrooms, plus ambient critters — crows that startle and take flight, scurrying rats,
  moths that circle the lamps (Milestone 1, §3)
- **Candlefall Chapel hub, Stage 0 → 1 → 2** — ruined chapel, dying NPC (Brother Cole), brazier
  rest point; lighting the flame, then feeding it holy oil, visibly brightens the hub in stages;
  rescued villagers appear as camp NPCs with their own tents/tables (Milestones 2 & 7, §7)
- **RPG systems** — Remembrance souls from kills, the Shrine spends it on Health / Stamina /
  Strength; ember flasks; checkpoints; **localStorage save + Continue** (Milestones 3 & 9, §12)
- **Tutorial graveyard** — mass grave opening, weapon pickup, scripted rising dead, gated combat
  zones, exploration pickups (Milestone 4)
- **First boss** — The Gravekeeper: shovel swings, corpse summons, and a bell-shockwave second
  phase, exactly as speced in §11; 3 phases, boss bar, arena gates (Milestone 6)
- **Quest 1: Light the Chapel** — the Burned Village zone (ash fields, charred houses with
  smoldering interiors), the new **Bell Cultist** enemy firing homing soul-bolts, holy-oil
  objective, and the **save-Bram-or-Lysa choice** (§13): whoever you answer first lives and
  joins the hub, the other is lost. Each survivor grants a distinct permanent perk — Bram
  reinforces the Ash Guard, Lysa deepens and adds an ember flask (Milestone 8)
- **Quest 2: The Bell Tower** — a vertical **climb** up the ruined belfry (stair shafts, combat
  chambers, hanging bells) under fire from cultists, to the **Bell-Ringer Twins** mini-boss:
  two linked ringers with bell-hammer swings and overlapping sound-shockwave rings. Alone each is
  manageable; together their rings sync into "resonance" waves. Kill one and the survivor
  **enrages with grief**, tolling faster. Silencing the great cursed bell **raises the Map Table**
  in the hub — a war board of all five regions of Veyr (§8), with the Briarwood teased next
- **Quest & dialogue system** — flag-driven objective tracker, portrait dialogue with Vela / Cole /
  the Gravekeeper / Bram / Lysa / the Twins, triggers, multi-map flow, per-chapter end screens,
  title menu, and a region-select war table

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

- **New enemy family** → add a row to `HC.ENEMY_DEFS` and a sprite (§11's enemy table maps 1:1);
  the Bell Cultist's homing `bolt` flag shows how to vary the ranged attack
- **New region** (Briarwood, Ironmere…) → add a map def to `HC.maps`: rows built with the
  alignment-safe `HC.row('26:,','4:p','14:,')` builder, plus coordinate lists for props, spawns,
  gates, and triggers. The Bell Tower shows a **vertical climb** map; the Map Table's `REGIONS`
  list is already wired to point at the next ones (Milestone 10)
- **New quest beat** → a trigger rect + a script entry in `HC.script` + an event case; objective
  text lives in one flag-driven `refreshQuest()` so state survives save/reload
- **New boss** → `makeGravekeeper` shows a single-body state machine; `makeBellTwins` shows a
  **multi-body controller** (shared health bar, coordinated attacks, enrage-on-death). Sir Alric next, per §17
- **Hub growth stages** → `world.setChapelLit()` and the Bell Tower's Map-Table reward show the
  pattern: swap sprites, add lights, lower darkness, change music, gate new content on a flag

## Next milestones (from the plan doc)

1. **Chapel Catacombs** — first proper dungeon: shortcuts, traps, elite enemy (Milestone 5)
2. **Sir Alric the Kneeling Knight** — first shard of the Mourning Blade (§9 Quest 3)
3. Full companion system with bond conversations (Mara Vey), character creation, menu polish
4. **The Briarwood** — second full region off the Map Table, proving the world scales (Milestone 10)
5. Ironmere, the Drowned Coast, Solmire — the remaining Map-Table roads

*Build in small, finished passes. Do not build every region at once.* — the plan's final rule,
and this codebase's too.
