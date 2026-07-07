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
  g.push(R('2:,', '4:.', '20:F', '4:d', '8:F', '4:.', '2:,'));       // 3 arena north fence + exit gate
  for (var r4 = 4; r4 <= 19; r4++)
    g.push(R('2:,', '4:.', '1:F', '30:.', '1:F', '6:,'));            // 4-19 boss arena
  g.push(R('2:,', '4:.', '13:F', '4:b', '15:F', '6:,'));             // 20 arena south fence + boss gate
  for (var r21 = 21; r21 <= 30; r21++)
    g.push(R('2:,', '17:.', '4:p', '19:.', '2:,'));                  // 21-30 path north segment
  g.push(R('2:,', '14:.', '7:p', '19:.', '2:,'));                    // 31 bend
  g.push(R('2:,', '11:.', '7:p', '22:.', '2:,'));                    // 32
  g.push(R('2:,', '10:.', '5:p', '25:.', '2:,'));                    // 33
  for (var r34 = 34; r34 <= 44; r34++)
    g.push(R('2:,', '10:.', '4:p', '26:.', '2:,'));                  // 34-44 path west segment
  g.push(R('2:,', '4:.', '6:F', '4:a', '22:F', '6:,'));              // 45 zone gate
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
      { type: 'coffin', at: [[14, 62], [28, 64], [17, 66], [26, 68]] }
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
      { type: 'ember', x: 36, y: 44 }, { type: 'ember', x: 24, y: 47 }
    ],
    gates: { a: { open: false }, b: { open: true }, d: { open: false } },
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
  for (var c18 = 18; c18 <= 29; c18++)
    c.push(R('2:,', '13:.', '4:p', '13:.', '2:,'));                   // 18-29 approach road

  var chapel = {
    id: 'chapel',
    name: 'CANDLEFALL CHAPEL',
    grid: c,
    darkness: 0.8,
    music: 'ambient',
    rain: true,
    entries: {
      fromGraveyard: { x: 16.5, y: 27, face: 'up' },
      start: { x: 16.5, y: 27, face: 'up' }
    },
    props: [
      { type: 'chapel', x: 13, y: 1 },
      { type: 'gatepost', at: [[14, 16], [19, 16]] },
      { type: 'candles', at: [[9, 8], [25, 13], [12, 14], [20, 8], [24, 8], [8, 12]] },
      { type: 'tree', at: [[3, 4], [30, 6], [4, 20], [29, 22], [2, 12], [31, 11], [4, 26], [29, 27]] },
      { type: 'tomb', at: [[9, 20], [24, 21], [27, 25]] },
      { type: 'skulls', at: [[8, 15]] }
    ],
    spawns: [
      { type: 'brazier', x: 16, y: 11 },
      { type: 'shrine', x: 23, y: 9 },
      { type: 'survivor', x: 13, y: 8 }
    ],
    gates: {},
    triggers: [
      { x0: 13, y0: 21, x1: 20, y1: 26, event: 'chapelIntro', once: true },
      { x0: 14, y0: 29, x1: 19, y1: 29, event: 'toGraveyard' }
    ]
  };

  return { graveyard: graveyard, chapel: chapel };
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
    '#': 'wall', 'F': 'grass', 'a': 'path', 'b': 'grass', 'd': 'path'
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
        if (ch === 'a' || ch === 'b' || ch === 'd') {
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
      }
      if (p.light) W.lights.push(p.light);
      W.props.push(p);
    }
    for (var pi = 0; pi < mapDef.props.length; pi++) {
      var pd = mapDef.props[pi];
      if (pd.at) for (var ai = 0; ai < pd.at.length; ai++) addProp(pd.type, pd.at[ai][0], pd.at[ai][1]);
      else addProp(pd.type, pd.x, pd.y);
    }

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
    if (ch !== 'a' && ch !== 'b' && ch !== 'd') return false;
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
      warmGlows.push([lx, ly, r, L.warm]);
    }
    ctx.drawImage(lightCanvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var j = 0; j < warmGlows.length; j++) {
      var wg = warmGlows[j];
      var grd = ctx.createRadialGradient(wg[0], wg[1], 1, wg[0], wg[1], wg[2] * 0.8);
      var a = wg[3] ? 0.10 : 0.06;
      grd.addColorStop(0, wg[3] ? 'rgba(255,170,70,' + a + ')' : 'rgba(120,200,255,' + a + ')');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(wg[0] - wg[2], wg[1] - wg[2], wg[2] * 2, wg[2] * 2);
    }
    ctx.restore();
  };

  // fog + rain
  var fogBlobs = [];
  for (var fi = 0; fi < 7; fi++)
    fogBlobs.push({ x: Math.random() * 800, y: Math.random() * 800, r: 60 + Math.random() * 90, vx: 3 + Math.random() * 5, ph: Math.random() * 7 });
  var rainDrops = [];
  for (var ri = 0; ri < 46; ri++)
    rainDrops.push({ x: Math.random() * HC.VIEW_W, y: Math.random() * HC.VIEW_H, sp: 150 + Math.random() * 120, len: 4 + Math.random() * 5 });

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
        if (d.y > HC.VIEW_H) { d.y = -8; d.x = Math.random() * (HC.VIEW_W + 40); }
        if (d.x < -10) d.x += HC.VIEW_W + 20;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * 0.18, d.y + d.len);
      }
      ctx.stroke();
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
