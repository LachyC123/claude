// The Hollow Crown — world: map data, tiles, props, gates, collision, lighting, weather
'use strict';

// row builder: 'N:c' repeats char c N times, keeping map rows aligned by construction
HC.row = function () {
  var s = '';
  for (var i = 0; i < arguments.length; i++) {
    var part = arguments[i];
    var m = /^(\d+):(.)$/.exec(part);
    if (m) { s += new Array(parseInt(m[1], 10) + 1).join(m[2]); }
    else s += part;
  }
  return s;
};

HC.maps = (function () {
  var R = HC.row;

  // ---------- graveyard: 44 x 72 ----------
  var g = [];
  g.push(R('26:,', '4:p', '14:,'));                                  // 0 exit to chapel
  g.push(R('26:,', '4:p', '14:,'));                                  // 1
  g.push(R('26:,', '4:p', '14:,'));                                  // 2
  g.push(R('2:,', '4:.', '20:F', '4:D', '8:F', '4:.', '2:,'));       // 3 arena north fence + exit gate
  for (var r4 = 4; r4 <= 19; r4++)
    g.push(R('2:,', '4:.', '1:F', '30:.', '1:F', '6:,'));            // 4-19 boss arena
  g.push(R('2:,', '4:.', '13:F', '4:B', '15:F', '6:,'));             // 20 arena south fence + boss gate
  for (var r21 = 21; r21 <= 30; r21++)
    g.push(R('2:,', '17:.', '4:p', '19:.', '2:,'));                  // 21-30 path north segment
  g.push(R('2:,', '14:.', '7:p', '19:.', '2:,'));                    // 31 bend
  g.push(R('2:,', '11:.', '7:p', '22:.', '2:,'));                    // 32
  g.push(R('2:,', '10:.', '5:p', '25:.', '2:,'));                    // 33
  for (var r34 = 34; r34 <= 44; r34++)
    g.push(R('2:,', '10:.', '4:p', '26:.', '2:,'));                  // 34-44 path west segment
  g.push(R('2:,', '4:.', '6:F', '4:A', '22:F', '6:,'));              // 45 zone gate
  for (var r46 = 46; r46 <= 49; r46++)
    g.push(R('2:,', '10:.', '4:p', '26:.', '2:,'));                  // 46-49
  g.push(R('2:,', '10:.', '8:p', '22:.', '2:,'));                    // 50 bend east
  g.push(R('2:,', '13:.', '8:p', '19:.', '2:,'));                    // 51
  g.push(R('2:,', '16:.', '6:p', '18:.', '2:,'));                    // 52
  for (var r53 = 53; r53 <= 59; r53++)
    g.push(R('2:,', '18:.', '4:p', '18:.', '2:,'));                  // 53-59
  for (var r60 = 60; r60 <= 69; r60++)
    g.push(R('2:,', '10:.', '21:m', '9:.', '2:,'));                  // 60-69 mass grave pit
  g.push(R('44:,'));                                                 // 70
  g.push(R('44:,'));                                                 // 71

  var graveyard = {
    id: 'graveyard',
    name: 'THE CANDLEFALL GRAVEYARD',
    grid: g,
    darkness: 0.82,
    music: 'ambient',
    rain: true,
    entries: {
      start: { x: 22.5, y: 67.5, face: 'up' },
      fromChapel: { x: 28, y: 2.5, face: 'down' },
      gateA: { x: 13.5, y: 47.5, face: 'up' },
      arena: { x: 21.5, y: 18, face: 'up' }
    },
    props: [
      { type: 'mausoleum', x: 16, y: 4 },
      { type: 'tree', at: [[3, 2], [40, 3], [4, 10], [39, 12], [3, 22], [40, 26], [38, 34], [3, 36], [5, 47], [39, 49], [37, 55], [3, 58], [8, 62], [36, 64], [5, 68], [38, 69], [10, 1], [33, 1], [41, 41], [4, 31]] },
      { type: 'tomb', at: [[17, 23], [25, 24], [16, 27], [26, 28], [24, 32], [10, 33], [17, 36], [9, 38], [17, 40], [10, 42], [18, 44], [10, 47], [17, 48], [10, 52], [16, 53], [26, 54], [18, 57], [26, 57], [30, 25], [31, 39], [28, 46], [8, 26]] },
      { type: 'candles', at: [[9, 5], [34, 5], [9, 18], [34, 18], [19, 8], [12, 60], [31, 62], [18, 46], [23, 22], [11, 45]] },
      { type: 'skulls', at: [[13, 61], [30, 66], [24, 60], [15, 69], [27, 61]] },
      { type: 'coffin', at: [[14, 62], [28, 64], [17, 66], [26, 68]] },
      { type: 'bones', at: [[16, 58], [29, 62], [12, 66], [25, 66], [8, 30], [37, 51]] },
      { type: 'flowers', at: [[10, 24], [33, 27], [25, 43], [15, 37], [30, 33], [11, 52], [20, 63]] },
      { type: 'puddle', at: [[19, 35], [24, 49], [14, 43], [28, 24]] },
      { type: 'lanternpost', at: [[6, 34], [37, 43]] },
      { type: 'rubble', at: [[9, 27], [31, 30], [13, 55]] }
    ],
    spawns: [
      { type: 'hollow', x: 13, y: 48, zone: 'z0' },
      { type: 'hollow', x: 17, y: 51, zone: 'z0' },
      { type: 'hollow', x: 22, y: 54, zone: 'z0' },
      { type: 'hollow', x: 20, y: 24, zone: 'z1' },
      { type: 'hollow', x: 13, y: 42, zone: 'z1' },
      { type: 'hollow', x: 27, y: 35, zone: 'z1' },
      { type: 'archer', x: 26, y: 28, zone: 'z1' },
      { type: 'archer', x: 10, y: 34, zone: 'z1' },
      { type: 'dog', x: 24, y: 31, zone: 'z1' },
      { type: 'dog', x: 15, y: 40, zone: 'z1' },
      { type: 'gravekeeper', x: 21, y: 12, zone: 'boss' },
      { type: 'hollow', x: 20, y: 61, zone: 'grave', delayed: 'swordTaken' },
      { type: 'hollow', x: 25, y: 64, zone: 'grave', delayed: 'swordTaken' },
      { type: 'sword', x: 22, y: 63 },
      { type: 'wisp', x: 4, y: 29 }, { type: 'wisp', x: 39, y: 36 },
      { type: 'wisp', x: 33, y: 17 }, { type: 'wisp', x: 35, y: 62 },
      { type: 'ember', x: 36, y: 44 }, { type: 'ember', x: 24, y: 47 },
      { type: 'crow', x: 18, y: 7 }, { type: 'crow', x: 30, y: 6 }, { type: 'crow', x: 6, y: 40 },
      { type: 'rat', x: 22, y: 62 }, { type: 'rat', x: 12, y: 50 },
      { type: 'moth', x: 9, y: 18 }, { type: 'moth', x: 34, y: 18 }
    ],
    gates: { A: { open: false }, B: { open: true }, D: { open: false } },
    triggers: [
      { x0: 16, y0: 63, x1: 30, y1: 70, event: 'intro', once: true },
      { x0: 17, y0: 21, x1: 25, y1: 23, event: 'preBoss', once: true },
      { x0: 16, y0: 13, x1: 26, y1: 17, event: 'bossStart', once: true },
      { x0: 25, y0: 0, x1: 30, y1: 1, event: 'toChapel' }
    ]
  };

  // ---------- Candlefall Chapel: 34 x 30 ----------
  var c = [];
  c.push(R('34:,'));                                                  // 0
  c.push(R('34:,'));                                                  // 1
  for (var c2 = 2; c2 <= 6; c2++)
    c.push(R('2:,', '4:.', '1:F', '20:,', '1:F', '4:.', '2:,'));      // 2-6 behind chapel
  for (var c7 = 7; c7 <= 16; c7++)
    c.push(R('2:,', '4:.', '1:F', '20:f', '1:F', '4:.', '2:,'));      // 7-16 courtyard
  c.push(R('2:,', '4:.', '1:F', '8:F', '4:f', '8:F', '1:F', '4:.', '2:,')); // 17 courtyard fence + opening
  for (var c18 = 18; c18 <= 29; c18++) {
    if (c18 === 20 || c18 === 21) c.push(R('19:p', '13:.', '2:,'));   // 20-21 west road to the burned village
    else c.push(R('2:,', '13:.', '4:p', '13:.', '2:,'));              // approach road
  }

  var chapel = {
    id: 'chapel',
    name: 'CANDLEFALL CHAPEL',
    grid: c,
    darkness: 0.8,
    music: 'ambient',
    rain: true,
    entries: {
      fromGraveyard: { x: 16.5, y: 27, face: 'up' },
      fromVillage: { x: 1.5, y: 21, face: 'right' },
      fromTower: { x: 16.5, y: 8, face: 'down' },
      start: { x: 16.5, y: 27, face: 'up' }
    },
    props: [
      { type: 'chapel', x: 13, y: 1 },
      { type: 'gatepost', at: [[14, 16], [19, 16]] },
      { type: 'candles', at: [[9, 8], [25, 13], [12, 14], [20, 8], [24, 8], [8, 12]] },
      { type: 'tree', at: [[3, 4], [30, 6], [4, 26], [29, 22], [2, 12], [31, 11], [7, 24], [29, 27]] },
      { type: 'tomb', at: [[9, 24], [24, 21], [27, 25]] },
      { type: 'skulls', at: [[8, 15]] },
      { type: 'sign', at: [[13, 19]] },
      { type: 'barrel', at: [[26, 11], [27, 12]] },
      { type: 'crate', at: [[25, 12], [7, 10]] },
      { type: 'sack', at: [[8, 11]] },
      { type: 'flowers', at: [[11, 13], [21, 13], [10, 18], [22, 17], [9, 22]] },
      { type: 'lanternpost', at: [[11, 16], [22, 16]] },
      { type: 'hanglantern', at: [[13, 6], [19, 6]] },
      { type: 'puddle', at: [[16, 20], [12, 24]] }
    ],
    spawns: [
      { type: 'brazier', x: 16, y: 11 },
      { type: 'shrine', x: 23, y: 9 },
      { type: 'survivor', x: 13, y: 8 },
      { type: 'towerdoor', x: 16, y: 7 },
      { type: 'crow', x: 28, y: 5 }, { type: 'crow', x: 5, y: 6 },
      { type: 'rat', x: 26, y: 24 },
      { type: 'moth', x: 11, y: 16 }, { type: 'moth', x: 22, y: 16 }, { type: 'moth', x: 16, y: 11 }
    ],
    gates: {},
    triggers: [
      { x0: 13, y0: 21, x1: 20, y1: 26, event: 'chapelIntro', once: true },
      { x0: 14, y0: 29, x1: 19, y1: 29, event: 'toGraveyard' },
      { x0: 0, y0: 19, x1: 0, y1: 22, event: 'toVillage' }
    ]
  };

  // ---------- The Burned Village: 46 x 34 ----------
  var v = [];
  v.push(R('46:,'));                                                  // 0
  v.push(R('46:,'));                                                  // 1
  for (var v2 = 2; v2 <= 11; v2++)
    v.push(R('2:,', '42:a', '2:,'));                                  // 2-11 north ash field
  for (var v12 = 12; v12 <= 15; v12++)
    v.push(R('2:,', '16:a', '12:x', '14:a', '2:,'));                  // 12-15 plaza north
  v.push(R('18:p', '12:x', '16:p'));                                  // 16 road
  v.push(R('18:p', '12:x', '16:p'));                                  // 17 road
  for (var v18 = 18; v18 <= 22; v18++)
    v.push(R('2:,', '16:a', '12:x', '14:a', '2:,'));                  // 18-22 plaza south
  for (var v23 = 23; v23 <= 31; v23++)
    v.push(R('2:,', '42:a', '2:,'));                                  // 23-31 south ash field
  v.push(R('46:,'));                                                  // 32
  v.push(R('46:,'));                                                  // 33

  var village = {
    id: 'village',
    name: 'THE BURNED VILLAGE',
    grid: v,
    darkness: 0.78,
    music: 'ambient',
    rain: true,
    entries: {
      fromChapel: { x: 44, y: 16.5, face: 'left' },
      start: { x: 44, y: 16.5, face: 'left' }
    },
    props: [
      { type: 'bhouse64', at: [[19, 2], [3, 12]] },
      { type: 'bhouse48', at: [[31, 22], [10, 25], [38, 3], [8, 5]] },
      { type: 'well', at: [[23, 16]] },
      { type: 'cart', at: [[14, 18], [35, 14]] },
      { type: 'smolder', at: [[16, 13], [30, 20], [8, 18], [36, 26], [21, 10], [25, 4], [12, 28], [40, 17], [28, 12]] },
      { type: 'cellar', at: [[33, 26]] },
      { type: 'sign', at: [[42, 15]] },
      { type: 'tree', at: [[2, 6], [43, 8], [2, 29], [43, 29], [28, 31], [17, 31]] },
      { type: 'candles', at: [[5, 14], [32, 27]] },
      { type: 'skulls', at: [[26, 18]] },
      { type: 'rubble', at: [[18, 5], [12, 22], [29, 8], [36, 24], [9, 27], [24, 14]] },
      { type: 'barrel', at: [[15, 19], [34, 15]] },
      { type: 'crate', at: [[13, 17], [36, 13]] },
      { type: 'sack', at: [[22, 24], [7, 20]] },
      { type: 'bones', at: [[27, 6], [10, 12], [39, 26]] },
      { type: 'puddle', at: [[20, 17], [30, 22], [11, 9]] }
    ],
    spawns: [
      { type: 'hollow', x: 33, y: 11, zone: 'v' },
      { type: 'hollow', x: 28, y: 30, zone: 'v' },
      { type: 'hollow', x: 14, y: 10, zone: 'v' },
      { type: 'archer', x: 26, y: 6, zone: 'v' },
      { type: 'cultist', x: 22, y: 8, zone: 'v' },
      { type: 'dog', x: 40, y: 13, zone: 'v' },
      { type: 'oil', x: 21, y: 6 },
      { type: 'bramDoor', x: 6, y: 16 },
      { type: 'lysaDoor', x: 33, y: 27 },
      { type: 'wisp', x: 4, y: 8 }, { type: 'wisp', x: 41, y: 27 },
      { type: 'ember', x: 24, y: 19 },
      { type: 'crow', x: 19, y: 3 }, { type: 'crow', x: 31, y: 23 }, { type: 'crow', x: 8, y: 4 },
      { type: 'rat', x: 15, y: 19 }, { type: 'rat', x: 34, y: 15 }, { type: 'rat', x: 24, y: 27 }
    ],
    gates: {},
    triggers: [
      { x0: 45, y0: 15, x1: 45, y1: 18, event: 'toChapelEast' },
      { x0: 38, y0: 15, x1: 42, y1: 18, event: 'villageEnter', once: true },
      { x0: 19, y0: 13, x1: 28, y1: 21, event: 'villageChoice', once: true }
    ]
  };

  // ---------- The Bell Tower: 24 x 62, climbed from bottom (entrance) to top (belfry) ----------
  var b = [];
  b.push(R('24:#'));                                                  // 0 roof
  b.push(R('24:#'));                                                  // 1
  for (var b2 = 2; b2 <= 14; b2++)
    b.push(R('2:#', '20:t', '2:#'));                                  // 2-14 belfry (boss arena)
  b.push(R('2:#', '20:t', '2:#'));                                    // 15 belfry floor
  b.push(R('10:#', '4:B', '10:#'));                                   // 16 belfry gate (funnel)
  for (var b17 = 17; b17 <= 26; b17++)
    b.push(R('7:#', '10:S', '7:#'));                                  // 17-26 upper stair shaft
  b.push(R('7:#', '10:t', '7:#'));                                    // 27 landing
  for (var b28 = 28; b28 <= 37; b28++)
    b.push(R('3:#', '18:t', '3:#'));                                  // 28-37 mid chamber
  b.push(R('3:#', '18:t', '3:#'));                                    // 38 mid floor
  for (var b39 = 39; b39 <= 47; b39++)
    b.push(R('7:#', '10:S', '7:#'));                                  // 39-47 lower stair shaft
  b.push(R('7:#', '10:t', '7:#'));                                    // 48 landing
  for (var b49 = 49; b49 <= 58; b49++)
    b.push(R('3:#', '18:t', '3:#'));                                  // 49-58 entrance chamber
  b.push(R('3:#', '18:t', '3:#'));                                    // 59 entrance floor (exit trigger row)
  b.push(R('24:#'));                                                  // 60
  b.push(R('24:#'));                                                  // 61

  var belltower = {
    id: 'belltower',
    name: 'THE BELL TOWER',
    grid: b,
    darkness: 0.82,
    music: 'ambient',
    rain: false,
    entries: {
      fromChapel: { x: 12, y: 57, face: 'up' },
      start: { x: 12, y: 57, face: 'up' },
      belfry: { x: 12, y: 19, face: 'up' }
    },
    props: [
      { type: 'candles', at: [[3, 12], [20, 12], [4, 30], [19, 34], [8, 49], [16, 55], [3, 50], [20, 52]] },
      { type: 'hangbell', at: [[4, 6], [19, 8], [5, 31], [18, 30]] },
      { type: 'bellrope', at: [[7, 5], [16, 5], [9, 29], [14, 29]] },
      { type: 'skulls', at: [[10, 53], [14, 36]] },
      { type: 'tomb', at: [[4, 55], [19, 56]] },
      { type: 'rubble', at: [[4, 27], [19, 27], [5, 48], [18, 48], [10, 38]] },
      { type: 'bones', at: [[16, 51], [6, 54], [12, 34]] },
      { type: 'mushrooms', at: [[4, 33], [19, 31], [7, 50], [17, 53]] },
      { type: 'sack', at: [[5, 52], [18, 52]] }
    ],
    spawns: [
      { type: 'greatbell', x: 12, y: 6 },
      { type: 'belltwins', x: 12, y: 11 },
      { type: 'cultist', x: 7, y: 31, zone: 'mid' },
      { type: 'cultist', x: 16, y: 34, zone: 'mid' },
      { type: 'hollow', x: 11, y: 30, zone: 'mid' },
      { type: 'archer', x: 12, y: 36, zone: 'mid' },
      { type: 'cultist', x: 8, y: 52, zone: 'low' },
      { type: 'hollow', x: 15, y: 54, zone: 'low' },
      { type: 'hollow', x: 10, y: 50, zone: 'low' },
      { type: 'ember', x: 12, y: 27 },
      { type: 'ember', x: 12, y: 48 },
      { type: 'wisp', x: 4, y: 13 }, { type: 'wisp', x: 19, y: 13 },
      { type: 'rat', x: 12, y: 50 }, { type: 'rat', x: 8, y: 36 },
      { type: 'moth', x: 3, y: 12 }, { type: 'moth', x: 20, y: 12 }, { type: 'moth', x: 4, y: 33 }
    ],
    gates: { B: { open: true } },
    triggers: [
      { x0: 9, y0: 58, x1: 14, y1: 59, event: 'toChapelFromTower' },
      { x0: 5, y0: 28, x1: 18, y1: 31, event: 'towerMidReached', once: true },
      { x0: 4, y0: 12, x1: 19, y1: 14, event: 'twinsStart', once: true }
    ]
  };

  return { graveyard: graveyard, chapel: chapel, village: village, belltower: belltower };
})();

// ---------- world runtime ----------
HC.world = (function () {
  var T = HC.TILE;
  var W = {
    map: null, wt: 0, ht: 0, grid: null,
    props: [], statics: [], gates: {}, lights: [], triggers: [],
    time: 0, litStage: 0
  };

  var SOLID_TILES = { '#': 1, 'F': 1 };
  var GROUND = {
    '.': 'grass', ',': 'darkgrass', 'p': 'path', 'm': 'mud', 'f': 'stonefloor',
    'a': 'ash', 'x': 'charfloor', 't': 'towerfloor', 'S': 'stairs',
    '#': 'wall', 'F': 'grass', 'A': 'path', 'B': 'grass', 'D': 'path'
  };

  function hash2(x, y) { return Math.abs((x * 73856093) ^ (y * 19349663)) >>> 0; }

  W.load = function (mapDef, entryName) {
    W.map = mapDef;
    W.grid = mapDef.grid;
    W.ht = mapDef.grid.length;
    W.wt = 0;
    for (var i = 0; i < W.ht; i++) W.wt = Math.max(W.wt, mapDef.grid[i].length);
    W.props = [];
    W.lights = [];
    W.time = 0;
    W.litStage = 0;
    HC.camera.bounds = { w: W.wt * T, h: W.ht * T };

    // gates: collect tiles per gate char
    W.gates = {};
    for (var gy = 0; gy < W.ht; gy++) {
      for (var gx = 0; gx < W.wt; gx++) {
        var ch = W.charAt(gx, gy);
        if (ch === 'A' || ch === 'B' || ch === 'D') {
          if (!W.gates[ch]) W.gates[ch] = { tiles: [], open: mapDef.gates[ch] ? mapDef.gates[ch].open : false, anim: 0 };
          W.gates[ch].tiles.push([gx, gy]);
        }
      }
    }
    for (var gk in W.gates) {
      var gg = W.gates[gk];
      gg.anim = gg.open ? 1 : 0;
      gg.tiles.sort(function (p, q) { return p[0] - q[0]; });
    }

    // props from def
    var S = HC.sprites;
    function addProp(type, tx, ty) {
      var p = { type: type, tx: tx, ty: ty, x: tx * T, y: ty * T };
      if (type === 'tree') {
        p.img = S.deadTree(hash2(tx, ty));
        p.ox = -5; p.oy = -14;
        p.base = p.y + 16;
        p.solid = { x: p.x + 4, y: p.y + 8, w: 8, h: 8 };
      } else if (type === 'tomb') {
        p.img = S.tombstone(hash2(tx, ty));
        p.ox = 2; p.oy = 2;
        p.base = p.y + 16;
        p.solid = { x: p.x + 3, y: p.y + 5, w: 10, h: 10 };
      } else if (type === 'candles') {
        p.img = S.candles;
        p.ox = 3; p.oy = 8;
        p.base = p.y + 16;
        p.light = { x: p.x + 8, y: p.y + 11, r: 26, warm: 1, flicker: 1 };
      } else if (type === 'skulls') {
        p.img = S.skulls;
        p.ox = 2; p.oy = 8;
        p.base = 0;
      } else if (type === 'coffin') {
        p.img = S.coffin;
        p.ox = 0; p.oy = 4;
        p.base = p.y + 14;
        p.solid = { x: p.x + 1, y: p.y + 5, w: 14, h: 8 };
      } else if (type === 'mausoleum') {
        p.img = S.mausoleum;
        p.ox = 0; p.oy = 0;
        p.base = p.y + 52;
        p.solid = { x: p.x + 2, y: p.y + 12, w: 68, h: 39 };
        W.lights.push({ x: p.x + 25, y: p.y + 47, r: 24, warm: 1, flicker: 1 });
        W.lights.push({ x: p.x + 47, y: p.y + 48, r: 24, warm: 1, flicker: 1 });
        W.lights.push({ x: p.x + 36, y: p.y + 40, r: 30, warm: 0, flicker: 1 });
      } else if (type === 'chapel') {
        p.img = S.chapelDark;
        p.ox = 0; p.oy = 0;
        p.base = p.y + 88;
        p.solid = { x: p.x + 8, y: p.y + 34, w: 96, h: 50 };
        p.isChapel = true;
      } else if (type === 'gatepost') {
        p.img = S.gatePost;
        p.ox = 5; p.oy = -6;
        p.base = p.y + 18;
        p.solid = { x: p.x + 5, y: p.y + 6, w: 6, h: 10 };
        p.light = { x: p.x + 8, y: p.y + 2, r: 30, warm: 1, flicker: 1 };
      } else if (type === 'bhouse64' || type === 'bhouse48') {
        var bw = type === 'bhouse64' ? 64 : 48, bhh = type === 'bhouse64' ? 44 : 40;
        p.img = S.burnedHouse(hash2(tx, ty), bw, bhh);
        p.ox = 0; p.oy = 0;
        p.base = p.y + bhh;
        p.solid = { x: p.x + 1, y: p.y + 10, w: bw - 2, h: bhh - 12 };
        W.lights.push({ x: p.x + bw / 2, y: p.y + bhh - 8, r: 22, warm: 1, flicker: 1 });
      } else if (type === 'well') {
        p.img = S.well;
        p.ox = -1; p.oy = 0;
        p.base = p.y + 16;
        p.solid = { x: p.x + 1, y: p.y + 7, w: 14, h: 8 };
      } else if (type === 'cart') {
        p.img = S.cart;
        p.ox = -3; p.oy = 3;
        p.base = p.y + 16;
        p.solid = { x: p.x - 1, y: p.y + 5, w: 18, h: 8 };
      } else if (type === 'smolder') {
        p.img = S.smolder;
        p.ox = 1; p.oy = 7;
        p.base = 0;
        p.light = { x: p.x + 8, y: p.y + 12, r: 34, warm: 1, flicker: 1 };
      } else if (type === 'cellar') {
        p.img = S.cellarDoors;
        p.ox = 0; p.oy = 3;
        p.base = p.y + 15;
      } else if (type === 'sign') {
        p.img = S.signpost;
        p.ox = 2; p.oy = -2;
        p.base = p.y + 16;
        p.solid = { x: p.x + 6, y: p.y + 10, w: 4, h: 5 };
      } else if (type === 'tent') {
        p.img = S.tent;
        p.ox = -2; p.oy = 1;
        p.base = p.y + 16;
        p.solid = { x: p.x - 2, y: p.y + 6, w: 20, h: 9 };
      } else if (type === 'herbtable') {
        p.img = S.herbTable;
        p.ox = 0; p.oy = 4;
        p.base = p.y + 16;
        p.solid = { x: p.x + 1, y: p.y + 8, w: 14, h: 7 };
      } else if (type === 'hangbell') {
        p.img = S.hangBell;
        p.ox = 2; p.oy = -14;
        p.base = p.y + 4;
        p.light = { x: p.x + 8, y: p.y - 6, r: 16, warm: 1, flicker: 1 };
      } else if (type === 'bellrope') {
        p.img = S.bellRope;
        p.ox = 6; p.oy = -22;
        p.base = 0;
      } else if (type === 'barrel') {
        p.img = S.barrel; p.ox = 2; p.oy = 1; p.base = p.y + 16;
        p.solid = { x: p.x + 2, y: p.y + 6, w: 8, h: 9 };
      } else if (type === 'crate') {
        p.img = S.crate; p.ox = 1; p.oy = 4; p.base = p.y + 16;
        p.solid = { x: p.x + 2, y: p.y + 7, w: 9, h: 8 };
      } else if (type === 'sack') {
        p.img = S.sack; p.ox = 2; p.oy = 3; p.base = p.y + 16;
        p.solid = { x: p.x + 3, y: p.y + 8, w: 6, h: 7 };
      } else if (type === 'lanternpost') {
        p.img = S.lanternPost; p.ox = 3; p.oy = -10; p.base = p.y + 16;
        p.solid = { x: p.x + 4, y: p.y + 8, w: 3, h: 8 };
        p.light = { x: p.x + 8, y: p.y - 4, r: 44, warm: 1, flicker: 1 };
      } else if (type === 'hanglantern') {
        p.img = S.hangLantern; p.ox = 4; p.oy = -14; p.base = p.y + 2;
        p.light = { x: p.x + 8, y: p.y - 6, r: 34, warm: 1, flicker: 1 };
      } else if (type === 'flowers') {
        p.img = S.flowers(hash2(tx, ty)); p.ox = 2; p.oy = 8; p.base = 0;
      } else if (type === 'bones') {
        p.img = S.bonePile(hash2(tx, ty)); p.ox = 1; p.oy = 7; p.base = 0;
      } else if (type === 'puddle') {
        p.img = S.puddle(hash2(tx, ty)); p.ox = -1; p.oy = 8; p.base = 0;
      } else if (type === 'mushrooms') {
        p.img = S.mushrooms(hash2(tx, ty)); p.ox = 2; p.oy = 8; p.base = 0;
        p.light = { x: p.x + 8, y: p.y + 12, r: 16, warm: 0, flicker: 1 };
      } else if (type === 'rubble') {
        p.img = S.rubble(hash2(tx, ty)); p.ox = 1; p.oy = 8; p.base = 0;
      }
      if (p.light) W.lights.push(p.light);
      W.props.push(p);
    }
    for (var pi = 0; pi < mapDef.props.length; pi++) {
      var pd = mapDef.props[pi];
      if (pd.at) for (var ai = 0; ai < pd.at.length; ai++) addProp(pd.type, pd.at[ai][0], pd.at[ai][1]);
      else addProp(pd.type, pd.x, pd.y);
    }
    W.spawnProp = addProp;

    // fences as static y-sorted sprites
    for (var fy = 0; fy < W.ht; fy++)
      for (var fx = 0; fx < W.wt; fx++)
        if (W.charAt(fx, fy) === 'F')
          W.props.push({ type: 'fence', x: fx * T, y: fy * T, img: S.fence, ox: 0, oy: 2, base: fy * T + 14 });

    // triggers
    W.triggers = [];
    for (var ti = 0; ti < mapDef.triggers.length; ti++) {
      var td = mapDef.triggers[ti];
      W.triggers.push({ x0: td.x0 * T, y0: td.y0 * T, x1: (td.x1 + 1) * T, y1: (td.y1 + 1) * T, event: td.event, once: td.once, fired: false });
    }

    var e = mapDef.entries[entryName] || mapDef.entries.start;
    return { x: e.x * T, y: e.y * T, face: e.face };
  };

  W.charAt = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= W.wt || ty >= W.ht) return ',';
    var row = W.grid[ty];
    return tx < row.length ? row.charAt(tx) : ',';
  };

  W.setChapelLit = function () {
    W.litStage = 1;
    W.map.darkness = 0.62;
    for (var i = 0; i < W.props.length; i++) {
      var p = W.props[i];
      if (p.isChapel) {
        p.img = HC.sprites.chapelLit;
        W.lights.push({ x: p.x + 26, y: p.y + 56, r: 34, warm: 1, flicker: 1 });
        W.lights.push({ x: p.x + 86, y: p.y + 56, r: 34, warm: 1, flicker: 1 });
        W.lights.push({ x: p.x + 56, y: p.y + 74, r: 40, warm: 1, flicker: 1 });
      }
    }
  };

  W.gateSolidAt = function (tx, ty) {
    var ch = W.charAt(tx, ty);
    if (ch !== 'A' && ch !== 'B' && ch !== 'D') return false;
    var gg = W.gates[ch];
    return gg && !gg.open;
  };

  W.solidAt = function (px, py) {
    var tx = Math.floor(px / T), ty = Math.floor(py / T);
    if (tx < 0 || ty < 0 || tx >= W.wt || ty >= W.ht) return true;
    var ch = W.charAt(tx, ty);
    if (SOLID_TILES[ch]) return true;
    if (W.gateSolidAt(tx, ty)) return true;
    for (var i = 0; i < W.props.length; i++) {
      var s = W.props[i].solid;
      if (s && px >= s.x && px < s.x + s.w && py >= s.y && py < s.y + s.h) return true;
    }
    return false;
  };

  W.circleFree = function (cx, cy, r) {
    if (W.solidAt(cx, cy)) return false;
    for (var a = 0; a < 8; a++) {
      var ang = a * Math.PI / 4;
      if (W.solidAt(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r)) return false;
    }
    return true;
  };

  W.moveEnt = function (e, dx, dy) {
    var r = e.r || 5;
    if (dx !== 0) {
      var nx = e.x + dx;
      if (W.circleFree(nx, e.y, r)) e.x = nx;
      else { // slide in small steps
        var sx = Math.sign(dx);
        while (Math.abs(dx) > 0.2 && !W.circleFree(e.x + sx * 0.5, e.y, r)) dx *= 0.5;
        if (W.circleFree(e.x + dx, e.y, r)) e.x += dx;
      }
    }
    if (dy !== 0) {
      var ny = e.y + dy;
      if (W.circleFree(e.x, ny, r)) e.y = ny;
      else {
        var sy = Math.sign(dy);
        while (Math.abs(dy) > 0.2 && !W.circleFree(e.x, e.y + sy * 0.5, r)) dy *= 0.5;
        if (W.circleFree(e.x, e.y + dy, r)) e.y += dy;
      }
    }
    e.x = HC.clamp(e.x, r, W.wt * T - r);
    e.y = HC.clamp(e.y, r, W.ht * T - r);
  };

  W.setGate = function (ch, open) {
    var gg = W.gates[ch];
    if (gg && gg.open !== open) {
      gg.open = open;
      HC.audio.sfx.gate();
    }
  };

  W.update = function (dt) {
    W.time += dt;
    for (var gk in W.gates) {
      var gg = W.gates[gk];
      gg.anim = HC.clamp(gg.anim + (gg.open ? dt * 2 : -dt * 2), 0, 1);
    }
  };

  // ---------- rendering ----------
  var tileVariant = {};
  function drawGround(ctx, cx, cy) {
    var TS = HC.sprites.tiles;
    var x0 = Math.floor(cx / T), y0 = Math.floor(cy / T);
    var x1 = Math.ceil((cx + HC.VIEW_W) / T), y1 = Math.ceil((cy + HC.VIEW_H) / T);
    for (var ty = y0; ty <= y1; ty++) {
      for (var tx = x0; tx <= x1; tx++) {
        var ch = W.charAt(tx, ty);
        var kind = GROUND[ch] || 'grass';
        var img;
        if (kind === 'wall') img = TS.wall;
        else {
          var arr = TS[kind] || TS.grass;
          img = arr[hash2(tx, ty) % arr.length];
        }
        ctx.drawImage(img, tx * T - cx, ty * T - cy);
      }
    }
  }

  function drawGates(ctx, cx, cy, ysorted) {
    var S = HC.sprites;
    for (var gk in W.gates) {
      var gg = W.gates[gk];
      if (!gg.tiles.length) continue;
      var first = gg.tiles[0], last = gg.tiles[gg.tiles.length - 1];
      var x = first[0] * T, y = first[1] * T;
      var wpx = (last[0] - first[0] + 1) * T;
      (function (gg, x, y, wpx) {
        ysorted.push({
          base: y + 15,
          draw: function (ctx2) {
            var slide = Math.round(gg.anim * (wpx / 2 - 2));
            ctx2.save();
            ctx2.beginPath();
            ctx2.rect(x - cx - 2, y - cy - 12, wpx + 4, 30);
            ctx2.clip();
            ctx2.drawImage(S.gateHalf, x - cx - slide, y - cy - 6);
            ctx2.save();
            ctx2.translate(x + wpx - cx + slide, y - cy - 6);
            ctx2.scale(-1, 1);
            ctx2.drawImage(S.gateHalf, 0, 0);
            ctx2.restore();
            ctx2.restore();
            ctx2.drawImage(S.gatePost, x - cx - 5, y - cy - 12);
            ctx2.drawImage(S.gatePost, x + wpx - cx - 1, y - cy - 12);
          }
        });
      })(gg, x, y, wpx);
    }
  }

  W.collectDrawables = function (ctx, cx, cy, ysorted) {
    for (var i = 0; i < W.props.length; i++) {
      var p = W.props[i];
      if (!p.img) continue;
      if (p.x - cx < -120 || p.x - cx > HC.VIEW_W + 120 || p.y - cy < -120 || p.y - cy > HC.VIEW_H + 120) continue;
      (function (p) {
        if (p.base === 0) {
          // flat decor: draw immediately under everything
          ctx.drawImage(p.img, Math.round(p.x - cx + p.ox), Math.round(p.y - cy + p.oy));
        } else {
          // soft grounding shadow under solid props
          if (p.solid) {
            var sw = p.solid.w, sy = p.solid.y + p.solid.h - 2;
            ctx.save();
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = '#05060d';
            ctx.beginPath();
            ctx.ellipse(Math.round(p.solid.x + sw / 2 - cx), Math.round(sy - cy), sw * 0.52, Math.max(3, sw * 0.16), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ysorted.push({
            base: p.base,
            draw: function (ctx2) {
              ctx2.drawImage(p.img, Math.round(p.x - cx + p.ox), Math.round(p.y - cy + p.oy));
            }
          });
        }
      })(p);
    }
    drawGates(ctx, cx, cy, ysorted);
  };

  // lighting
  var lightCanvas = null, lightCtx = null;
  function cutLight(x, y, r) {
    var grd = lightCtx.createRadialGradient(x, y, 1, x, y, r);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(0.55, 'rgba(0,0,0,0.75)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    lightCtx.fillStyle = grd;
    lightCtx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  W.drawLighting = function (ctx, cx, cy, extraLights) {
    if (!lightCanvas) {
      lightCanvas = document.createElement('canvas');
      lightCanvas.width = HC.VIEW_W; lightCanvas.height = HC.VIEW_H;
      lightCtx = lightCanvas.getContext('2d');
    }
    var dark = W.map ? W.map.darkness : 0.85;
    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.clearRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    lightCtx.fillStyle = 'rgba(9,12,26,' + dark + ')';
    lightCtx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    lightCtx.globalCompositeOperation = 'destination-out';

    var all = W.lights.concat(extraLights || []);
    var warmGlows = [];
    for (var i = 0; i < all.length; i++) {
      var L = all[i];
      var lx = L.x - cx, ly = L.y - cy;
      var r = L.r;
      if (L.flicker) r *= 0.9 + 0.1 * Math.sin(W.time * 11 + (L.x * 0.13 + L.y * 0.7)) + Math.random() * 0.04;
      if (lx < -r || lx > HC.VIEW_W + r || ly < -r || ly > HC.VIEW_H + r) continue;
      cutLight(lx, ly, r);
      warmGlows.push([lx, ly, r, L.violet ? 2 : (L.warm ? 1 : 0)]);
    }
    ctx.drawImage(lightCanvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var GLOW = [
      'rgba(120,200,255,',  // 0 cold
      'rgba(255,170,70,',   // 1 warm
      'rgba(179,84,160,'    // 2 cursed violet
    ];
    for (var j = 0; j < warmGlows.length; j++) {
      var wg = warmGlows[j];
      var grd = ctx.createRadialGradient(wg[0], wg[1], 1, wg[0], wg[1], wg[2] * 0.8);
      var a = wg[3] === 1 ? 0.10 : wg[3] === 2 ? 0.12 : 0.06;
      grd.addColorStop(0, GLOW[wg[3]] + a + ')');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(wg[0] - wg[2], wg[1] - wg[2], wg[2] * 2, wg[2] * 2);
    }
    ctx.restore();
  };

  // ambient motes: slow-drifting dust/ash caught in the lantern light, lit naturally
  // because this layer draws before the darkness pass
  var motes = [];
  for (var mi = 0; mi < 40; mi++)
    motes.push({
      x: Math.random() * HC.VIEW_W, y: Math.random() * HC.VIEW_H,
      vx: HC.rand(-6, 6), vy: HC.rand(-3, 5),
      ph: Math.random() * 7, sp: HC.rand(0.5, 1.6), warm: Math.random() < 0.5
    });
  W.drawAtmosphere = function (ctx, cx, cy, dt) {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.x < 0) m.x += HC.VIEW_W; else if (m.x > HC.VIEW_W) m.x -= HC.VIEW_W;
      if (m.y < 0) m.y += HC.VIEW_H; else if (m.y > HC.VIEW_H) m.y -= HC.VIEW_H;
      var tw = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(W.time * m.sp * 2 + m.ph));
      ctx.globalAlpha = tw * 0.5;
      ctx.fillStyle = m.warm ? '#ffd9a0' : '#9fc4e8';
      ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
    }
    ctx.globalAlpha = 1;
  };

  // fog + rain
  var fogBlobs = [];
  for (var fi = 0; fi < 7; fi++)
    fogBlobs.push({ x: Math.random() * 800, y: Math.random() * 800, r: 60 + Math.random() * 90, vx: 3 + Math.random() * 5, ph: Math.random() * 7 });
  var rainDrops = [];
  for (var ri = 0; ri < 46; ri++)
    rainDrops.push({ x: Math.random() * HC.VIEW_W, y: Math.random() * HC.VIEW_H, sp: 150 + Math.random() * 120, len: 4 + Math.random() * 5 });
  var splashes = [];

  W.drawWeather = function (ctx, cx, cy, dt) {
    ctx.save();
    for (var i = 0; i < fogBlobs.length; i++) {
      var f = fogBlobs[i];
      f.x += f.vx * dt;
      var fx = ((f.x - cx * 0.5) % (HC.VIEW_W + 300)) - 150;
      var fy = ((f.y - cy * 0.5) % (HC.VIEW_H + 200)) - 100;
      if (fx < -149) fx += HC.VIEW_W + 300;
      if (fy < -99) fy += HC.VIEW_H + 200;
      var grd = ctx.createRadialGradient(fx, fy, 1, fx, fy, f.r);
      var al = 0.045 + 0.02 * Math.sin(W.time * 0.4 + f.ph);
      grd.addColorStop(0, 'rgba(96,124,168,' + al + ')');
      grd.addColorStop(1, 'rgba(96,124,168,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(fx - f.r, fy - f.r, f.r * 2, f.r * 2);
    }
    if (W.map && W.map.rain) {
      ctx.strokeStyle = 'rgba(150,175,225,0.20)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var j = 0; j < rainDrops.length; j++) {
        var d = rainDrops[j];
        d.y += d.sp * dt; d.x -= d.sp * 0.18 * dt;
        if (d.y > HC.VIEW_H) {
          // leave a brief splash where the drop lands
          if (splashes.length < 30 && Math.random() < 0.5)
            splashes.push({ x: d.x, y: HC.rand(HC.VIEW_H * 0.45, HC.VIEW_H), t: 0 });
          d.y = -8; d.x = Math.random() * (HC.VIEW_W + 40);
        }
        if (d.x < -10) d.x += HC.VIEW_W + 20;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * 0.18, d.y + d.len);
      }
      ctx.stroke();
      // splashes
      for (var s = splashes.length - 1; s >= 0; s--) {
        var sp = splashes[s];
        sp.t += dt;
        if (sp.t > 0.28) { splashes.splice(s, 1); continue; }
        var r = sp.t * 14;
        ctx.strokeStyle = 'rgba(160,185,230,' + (0.22 * (1 - sp.t / 0.28)) + ')';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, r, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // vignette
  var vignette = null;
  W.drawVignette = function (ctx) {
    if (!vignette) {
      vignette = document.createElement('canvas');
      vignette.width = HC.VIEW_W; vignette.height = HC.VIEW_H;
      var vg = vignette.getContext('2d');
      var grd = vg.createRadialGradient(HC.VIEW_W / 2, HC.VIEW_H / 2, HC.VIEW_H * 0.45, HC.VIEW_W / 2, HC.VIEW_H / 2, HC.VIEW_H * 1.05);
      grd.addColorStop(0, 'rgba(5,7,18,0)');
      grd.addColorStop(1, 'rgba(5,7,18,0.55)');
      vg.fillStyle = grd;
      vg.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    }
    ctx.drawImage(vignette, 0, 0);
  };

  W.drawGround = drawGround;
  return W;
})();
