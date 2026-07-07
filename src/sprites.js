// The Hollow Crown — sprite factory: ASCII pixel maps for characters, procedural props and tiles
'use strict';
HC.sprites = (function () {
  var PAL = {
    '0': '#0d0f1e', // outline
    'K': '#161a2b', // near-black
    'C': '#262b47', // cloak dark navy
    'c': '#343c63', // cloak mid
    'l': '#4a5590', // cloak light
    'S': '#8d97a8', // steel
    's': '#5c6577', // steel dark
    'W': '#e6dfc8', // bone light
    'w': '#b0a88f', // bone dark
    'u': '#8a9478', // rotten flesh
    'v': '#5f6b52', // rotten dark
    'R': '#93262e', // blood red
    'r': '#c04a50', // red light
    'O': '#f2a13c', // lantern orange
    'o': '#ffd47a', // orange light
    'y': '#fff2c8', // flame core
    'G': '#3f5138', // green dark
    'g': '#5b7348', // green mid
    'B': '#4f3b2a', // brown dark
    'b': '#7a5f42', // brown light
    'E': '#8fe8ff', // spectral eye
    'e': '#3fa8c8', // spectral dark
    'M': '#3a4157', // stone mid
    'm': '#2b3145', // stone dark
    'H': '#767f9a', // stone light
    'Y': '#d8b455', // gold
    'D': '#33261d', // dark wood
    'F': '#c9b8a0'  // pale flesh
  };

  function make(w, h, fn) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    fn(g, w, h);
    return c;
  }

  function fromMap(rows, pal) {
    pal = pal || PAL;
    var h = rows.length, w = 0, i;
    for (i = 0; i < h; i++) w = Math.max(w, rows[i].length);
    return make(w, h, function (g) {
      for (var y = 0; y < h; y++) {
        var row = rows[y];
        for (var x = 0; x < row.length; x++) {
          var col = pal[row.charAt(x)];
          if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
        }
      }
    });
  }

  function flipX(src) {
    return make(src.width, src.height, function (g) {
      g.translate(src.width, 0); g.scale(-1, 1);
      g.drawImage(src, 0, 0);
    });
  }

  var S = {};

  // ---------- player: Ash Knight (12x16), down/up/side x 2 walk frames ----------
  var pBodyDown = [
    '....0000....',
    '...0cccc0...',
    '..0cllllc0..',
    '..0cKKKKc0..',
    '..0KEKKEK0..',
    '...0KKKK0...',
    '..0ccCCcc0..',
    '.0ccCoOCcc0.',
    '.0ccCoyCcc0.',
    '.0ccCCCCcc0.',
    '..0cCCCCc0..',
    '..0CCCCCC0..'
  ];
  var pBodyUp = [
    '....0000....',
    '...0cccc0...',
    '..0clllcc0..',
    '..0clcclc0..',
    '..0cccccc0..',
    '...0cccc0...',
    '..0ccCCcc0..',
    '.0ccCsSCcc0.',
    '.0ccCsSCcc0.',
    '.0ccCCCCcc0.',
    '..0cCCCCc0..',
    '..0CCCCCC0..'
  ];
  var pBodySide = [
    '....0000....',
    '...0cccc0...',
    '..0cllllc0..',
    '..0ccKKKE0..',
    '..0ccKKKK0..',
    '...0cKKK0...',
    '..0ccCCcc0..',
    '..0cCCoOc0..',
    '..0cCCoyc0..',
    '..0cCCCCc0..',
    '..0cCCCCc0..',
    '..0CCCCCC0..'
  ];
  var legsA = [
    '..0C0..0C0..',
    '..0s0..0s0..',
    '...0....0...',
    '............'
  ];
  var legsB = [
    '...0C00C0...',
    '...0s00s0...',
    '....0..0....',
    '............'
  ];
  function withLegs(body, legs) { return fromMap(body.concat(legs)); }
  S.player = {
    down: [withLegs(pBodyDown, legsA), withLegs(pBodyDown, legsB)],
    up: [withLegs(pBodyUp, legsA), withLegs(pBodyUp, legsB)],
    right: [withLegs(pBodySide, legsA), withLegs(pBodySide, legsB)]
  };
  S.player.left = [flipX(S.player.right[0]), flipX(S.player.right[1])];

  // ---------- Vela, the lantern spirit (10x12, 2 frames) ----------
  S.vela = [
    fromMap([
      '....O.....',
      '...OoO....',
      '..0oyyo0..',
      '.0oyyyyo0.',
      '.0oy0y0o0.',
      '.0oyyyyo0.',
      '.0oyyyyo0.',
      '..0oyyo0..',
      '...0oo0...',
      '....00....',
      '..........',
      '..........'
    ]),
    fromMap([
      '..........',
      '....O.....',
      '...OoO....',
      '..0oyyo0..',
      '.0oyyyyo0.',
      '.0oy0y0o0.',
      '.0oyyyyo0.',
      '..0oyyo0..',
      '..0oyyo0..',
      '...0oo0...',
      '....00....',
      '..........'
    ])
  ];

  // ---------- Hollow Villager (12x15, 2 frames) ----------
  var hvTop = [
    '...0000.....',
    '..0uuuu0....',
    '..0uEuE0....',
    '..0uuuu0....',
    '...0uu0.....',
    '..0GGGG0....',
    '.0uGGGGu0...',
    '.0uGGGGu0...',
    '.0u0GGG0u0..',
    '..00GGG00...',
    '...0GGG0....'
  ];
  S.hollow = [
    fromMap(hvTop.concat([
      '..0v0.0v0...',
      '..0v0.0v0...',
      '...0...0....',
      '............'
    ])),
    fromMap(hvTop.concat([
      '...0v00v0...',
      '...0v00v0...',
      '....0..0....',
      '............'
    ]))
  ];

  // ---------- Grave Dog (17x11 side, 2 frames) ----------
  S.dog = [
    fromMap([
      '.............00..',
      '.0000.......0WW0.',
      '0WwWW000000.0WE0.',
      '0wWWWWWWWW000WW0.',
      '.0WwWwWwWW0WW00..',
      '.0WWWWWWWWWW0.0..',
      '..0W0...0W0......',
      '..0W0...0W0......',
      '.0W0.....0W0.....',
      '.00.......00.....',
      '.................'
    ]),
    fromMap([
      '.............00..',
      '.0000.......0WW0.',
      '0WwWW000000.0WE0.',
      '0wWWWWWWWW000WW0.',
      '.0WwWwWwWW0WW00..',
      '.0WWWWWWWWWW0.0..',
      '...0W0.0W0.......',
      '...0W0..0W0......',
      '...0W0...0W0.....',
      '....0.....0......',
      '.................'
    ])
  ];
  S.dogLeft = [flipX(S.dog[0]), flipX(S.dog[1])];

  // ---------- Corpse Archer (12x15, 2 frames) ----------
  var caTop = [
    '...0000.....',
    '..0GggG0....',
    '..0GKKG0....',
    '..0GEKG0....',
    '...0KK0.....',
    '..0GGGG0..0.',
    '.0uGGGGu00b0',
    '.0uGGGG0b0b0',
    '.0u0GGG0..b0',
    '..00GG00..0.',
    '...0GG0.....'
  ];
  S.archer = [
    fromMap(caTop.concat([
      '..0v0.0v0...',
      '..0v0.0v0...',
      '...0...0....',
      '............'
    ])),
    fromMap(caTop.concat([
      '...0v00v0...',
      '...0v00v0...',
      '....0..0....',
      '............'
    ]))
  ];

  // ---------- The Gravekeeper (26x30, 2 frames + windup) ----------
  function gkMap(legFrame, armsUp) {
    var head = [
      '.........00000000.........',
      '........0cccccccc0........',
      '.......0clllllllcc0.......',
      '......0ccl0K0K0lcc0.......',
      '......0cKKEKKKEKKc0.......',
      '......0cKKKKKKKKKc0.......',
      '.......0cKKwwwKKc0........',
      '........0cKKKKKc0.........'
    ];
    var body = armsUp ? [
      '.....00ccclllcccc00.0SS0..',
      '....0ccccccccccccc0.0SS0..',
      '...0cclccccccccclcc00SS0..',
      '..0ccl0cccccccc0lcc0SS0...',
      '..0cl0.0cccccc0.0c0SS0....',
      '..0c0..0ccOocc0..00SS0....',
      '..00...0ccoycc0...0bb0....',
      '.......0ccOocc0...0bb0....',
      '.......0cCCCCc0...0bb0....',
      '.......0cCCCCc0...0bb0....',
      '.......0cCCCCc0....00.....',
      '......0ccCCCCcc0..........',
      '......0cCCCCCCc0..........',
      '......0cCCCCCCc0..........'
    ] : [
      '.....00ccclllcccc00.......',
      '....0ccccccccccccc0.......',
      '...0cclcccccccclcc0.......',
      '..0ccl0cccccccc0lcc0......',
      '..0cl0.0cccccc0.0cc0......',
      '..0c0..0ccOocc0..0c0.0SS0.',
      '..00...0ccoycc0..0c00SSSS0',
      '.......0ccOocc0..0c00S00S0',
      '.......0cCCCCc0..000.0bb0.',
      '.......0cCCCCc0......0bb0.',
      '.......0cCCCCc0......0bb0.',
      '......0ccCCCCcc0.....0bb0.',
      '......0cCCCCCCc0......00..',
      '......0cCCCCCCc0..........'
    ];
    var legsGA = [
      '......0CC0..0CC0..........',
      '......0CC0..0CC0..........',
      '......0ss0..0ss0..........',
      '.......00....00...........'
    ];
    var legsGB = [
      '.......0CC00CC0...........',
      '.......0CC00CC0...........',
      '.......0ss00ss0...........',
      '........00..00............'
    ];
    return head.concat(body).concat(legFrame === 0 ? legsGA : legsGB);
  }
  S.gravekeeper = [fromMap(gkMap(0, false)), fromMap(gkMap(1, false))];
  S.gravekeeperUp = fromMap(gkMap(0, true));

  // ---------- Survivor: Brother Cole, wounded (14x12) ----------
  S.survivor = fromMap([
    '....0000......',
    '...0ssss0.....',
    '...0sFFs0.....',
    '...0sFFs0.....',
    '....0FF0......',
    '..00ssss00....',
    '.0ssssssss0...',
    '.0ss0ss0ss000.',
    '.0ssssssssssR0',
    '..0ssssssss0R.',
    '...00000000.0.',
    '..............'
  ]);

  // ---------- broken sword pickup (12x12) ----------
  S.sword = fromMap([
    '.........0..',
    '........0S0.',
    '.......0SW0.',
    '......0SW0..',
    '.....0SW0...',
    '....0SW0....',
    '..000W0.....',
    '.0bb0W0.....',
    '0bb00b0.....',
    '0b0.0b0.....',
    '.0..000.....',
    '............'
  ]);

  // ---------- title crown (22x14) ----------
  S.crown = fromMap([
    '......................',
    '..0.......0.......0...',
    '.0Y0.....0Y0.....0Y0..',
    '.0Y0.....0Y0.....0Y0..',
    '.0YY0...0YY0....0YY0..',
    '.0YY00.00YY0.0.00YY0..',
    '.0YYY000YY000Y00YYY0..',
    '.0YYYYYYY00.0YYYYYY0..',
    '.0YYYY0YYYYYYYY0YYY0..',
    '.0YYY0.0YYYYYY0.0YY0..',
    '.0YYYYYYY0RR0YYYYYY0..',
    '.0YYYYYYY0RR0YYYYYY0..',
    '..000000000000000000..',
    '......................'
  ]);

  // ---------- procedural props ----------
  function speckle(g, w, h, base, specks, rng) {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (var i = 0; i < specks.length; i++) {
      var sp = specks[i];
      var n = Math.floor(w * h * sp.density);
      g.fillStyle = sp.color;
      for (var j = 0; j < n; j++) g.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), sp.size || 1, sp.size || 1);
    }
  }

  S.tombstone = function (seed) {
    var rng = HC.srng(seed * 7919 + 13);
    var variant = Math.floor(rng() * 3);
    return make(12, 14, function (g) {
      var M = PAL.M, m = PAL.m, H = PAL.H, O = PAL['0'];
      if (variant === 0) {
        g.fillStyle = O; g.fillRect(2, 2, 8, 11);
        g.fillStyle = M; g.fillRect(3, 3, 6, 9);
        g.fillStyle = H; g.fillRect(3, 3, 6, 1); g.fillRect(3, 3, 1, 8);
        g.fillStyle = m; g.fillRect(8, 4, 1, 8); g.fillRect(4, 11, 5, 1);
        g.fillStyle = O; g.fillRect(4, 2, 4, 1); g.fillRect(5, 1, 2, 1);
        g.fillStyle = M; g.fillRect(5, 2, 2, 1);
        g.fillStyle = m;
        if (rng() < 0.7) { g.fillRect(4, 5, 3, 1); g.fillRect(4, 7, 4, 1); }
      } else if (variant === 1) {
        g.fillStyle = O; g.fillRect(4, 1, 4, 12); g.fillRect(1, 4, 10, 3);
        g.fillStyle = M; g.fillRect(5, 2, 2, 10); g.fillRect(2, 5, 8, 1);
        g.fillStyle = H; g.fillRect(5, 2, 1, 9); g.fillRect(2, 5, 4, 1);
      } else {
        g.fillStyle = O; g.fillRect(2, 4, 9, 9);
        g.fillStyle = M; g.fillRect(3, 5, 7, 7);
        g.fillStyle = H; g.fillRect(3, 5, 7, 1);
        g.fillStyle = m; g.fillRect(3, 9, 7, 1); g.fillRect(6, 6, 1, 5);
        if (rng() < 0.5) { g.fillStyle = PAL.g; g.fillRect(3, 10, 2, 2); }
      }
      g.fillStyle = m; g.fillRect(1, 13, 10, 1);
    });
  };

  S.fence = make(16, 12, function (g) {
    g.fillStyle = PAL['0'];
    g.fillRect(0, 4, 16, 1); g.fillRect(0, 9, 16, 1);
    for (var x = 1; x < 16; x += 3) { g.fillRect(x, 2, 1, 9); g.fillRect(x, 1, 1, 1); }
    g.fillStyle = PAL.s;
    g.fillRect(0, 5, 16, 1);
    for (var x2 = 2; x2 < 16; x2 += 3) g.fillRect(x2, 2, 0, 0);
  });

  S.deadTree = function (seed) {
    var rng = HC.srng(seed * 6151 + 7);
    return make(26, 30, function (g) {
      g.strokeStyle = PAL['0'];
      function branch(x, y, ang, len, wid) {
        if (len < 2 || wid < 1) return;
        var nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
        g.fillStyle = PAL['0'];
        var steps = Math.ceil(len);
        for (var i = 0; i <= steps; i++) {
          var t = i / steps;
          var px = Math.round(HC.lerp(x, nx, t)), py = Math.round(HC.lerp(y, ny, t));
          var wv = Math.max(1, Math.round(wid * (1 - t * 0.35)));
          g.fillRect(px - Math.floor(wv / 2), py, wv, 1);
        }
        var n = wid > 1 ? 2 : (rng() < 0.5 ? 1 : 0);
        for (var b = 0; b < n; b++)
          branch(nx, ny, ang + HC.lerp(-0.9, 0.9, rng()), len * HC.lerp(0.5, 0.75, rng()), wid - 1);
      }
      branch(13, 29, -Math.PI / 2 + HC.lerp(-0.15, 0.15, rng()), 11, 3);
      g.fillStyle = PAL.K;
      g.fillRect(11, 26, 1, 3); g.fillRect(13, 24, 1, 4);
    });
  };

  S.brazier = function (lit) {
    return make(16, 16, function (g) {
      g.fillStyle = PAL['0'];
      g.fillRect(3, 7, 10, 4);
      g.fillRect(4, 11, 2, 3); g.fillRect(10, 11, 2, 3); g.fillRect(7, 11, 2, 4);
      g.fillStyle = PAL.s; g.fillRect(4, 8, 8, 2);
      g.fillStyle = PAL.S; g.fillRect(4, 8, 8, 1);
      g.fillStyle = PAL.m; g.fillRect(3, 14, 10, 1);
      if (lit) {
        g.fillStyle = PAL.O; g.fillRect(5, 4, 6, 4);
        g.fillStyle = PAL.o; g.fillRect(6, 3, 4, 4);
        g.fillStyle = PAL.y; g.fillRect(7, 4, 2, 3);
      } else {
        g.fillStyle = PAL.K; g.fillRect(5, 6, 6, 2);
      }
    });
  };
  S.brazierUnlit = S.brazier(false);
  S.brazierLit = S.brazier(true);

  S.shrine = make(16, 22, function (g) {
    g.fillStyle = PAL['0']; g.fillRect(2, 16, 12, 5);
    g.fillStyle = PAL.M; g.fillRect(3, 17, 10, 3);
    g.fillStyle = PAL.H; g.fillRect(3, 17, 10, 1);
    g.fillStyle = PAL['0']; g.fillRect(5, 3, 6, 14);
    g.fillStyle = PAL.w; g.fillRect(6, 4, 4, 12);
    g.fillStyle = PAL.W; g.fillRect(6, 4, 2, 10);
    g.fillStyle = PAL.K; g.fillRect(7, 6, 2, 2);
    g.fillStyle = PAL['0']; g.fillRect(6, 2, 4, 2);
    g.fillStyle = PAL.E; g.fillRect(7, 7, 1, 1);
    g.fillStyle = PAL.W; g.fillRect(3, 14, 1, 3); g.fillRect(12, 13, 1, 4);
    g.fillStyle = PAL.o; g.fillRect(3, 13, 1, 1); g.fillRect(12, 12, 1, 1);
  });

  S.candles = make(10, 8, function (g) {
    var xs = [1, 4, 7], hs = [4, 6, 3];
    for (var i = 0; i < 3; i++) {
      g.fillStyle = PAL.W; g.fillRect(xs[i], 7 - hs[i], 2, hs[i]);
      g.fillStyle = PAL.o; g.fillRect(xs[i], 6 - hs[i], 2, 1);
      g.fillStyle = PAL.y; g.fillRect(xs[i], 5 - hs[i] < 0 ? 0 : 5 - hs[i], 2, 1);
    }
  });

  S.coffin = make(16, 10, function (g) {
    g.fillStyle = PAL['0']; g.fillRect(1, 1, 14, 8);
    g.fillStyle = PAL.B; g.fillRect(2, 2, 12, 6);
    g.fillStyle = PAL.b; g.fillRect(2, 2, 12, 1); g.fillRect(2, 2, 1, 6);
    g.fillStyle = PAL.K; g.fillRect(4, 4, 8, 3);
  });

  S.skulls = make(12, 8, function (g) {
    var pts = [[2, 4], [6, 3], [9, 5], [4, 5]];
    for (var i = 0; i < pts.length; i++) {
      g.fillStyle = i % 2 ? PAL.w : PAL.W;
      g.fillRect(pts[i][0], pts[i][1], 3, 3);
      g.fillStyle = PAL.K;
      g.fillRect(pts[i][0], pts[i][1] + 1, 1, 1);
      g.fillRect(pts[i][0] + 2, pts[i][1] + 1, 1, 1);
    }
  });

  S.banner = make(8, 16, function (g) {
    g.fillStyle = PAL['0']; g.fillRect(0, 0, 8, 1);
    g.fillStyle = PAL.R; g.fillRect(1, 1, 6, 12);
    g.fillStyle = PAL.r; g.fillRect(1, 1, 2, 10);
    g.fillStyle = PAL.R; g.fillRect(1, 13, 2, 2); g.fillRect(5, 13, 2, 1);
    g.fillStyle = PAL.Y; g.fillRect(3, 5, 2, 3);
  });

  S.gateHalf = make(16, 20, function (g) {
    g.fillStyle = PAL['0'];
    g.fillRect(0, 0, 2, 20);
    g.fillRect(0, 2, 16, 2); g.fillRect(0, 16, 16, 2);
    for (var x = 4; x < 16; x += 4) g.fillRect(x, 0, 2, 19);
    g.fillStyle = PAL.s;
    g.fillRect(0, 3, 16, 1);
    for (var x2 = 4; x2 < 16; x2 += 4) g.fillRect(x2, 1, 1, 16);
    g.fillStyle = PAL.S;
    for (var x3 = 4; x3 < 16; x3 += 4) g.fillRect(x3, 0, 1, 2);
  });
  S.gatePost = make(6, 24, function (g) {
    g.fillStyle = PAL['0']; g.fillRect(0, 0, 6, 24);
    g.fillStyle = PAL.M; g.fillRect(1, 1, 4, 22);
    g.fillStyle = PAL.H; g.fillRect(1, 1, 1, 20);
    g.fillStyle = PAL.m; g.fillRect(4, 2, 1, 21);
    g.fillStyle = PAL.o; g.fillRect(2, 3, 2, 2);
  });

  // mausoleum: 72x52 stone structure
  S.mausoleum = make(72, 52, function (g) {
    g.fillStyle = PAL['0']; g.fillRect(2, 12, 68, 39);
    g.fillStyle = PAL.m; g.fillRect(4, 14, 64, 35);
    g.fillStyle = PAL.M; g.fillRect(4, 14, 64, 3);
    // roof
    g.fillStyle = PAL['0'];
    for (var i = 0; i < 10; i++) g.fillRect(4 + i * 3, 10 - i, 64 - i * 6, 3);
    g.fillStyle = PAL.m;
    for (var i2 = 0; i2 < 9; i2++) g.fillRect(6 + i2 * 3, 11 - i2, 60 - i2 * 6, 1);
    // stones
    var rng = HC.srng(99);
    g.fillStyle = PAL.M;
    for (var j = 0; j < 40; j++) g.fillRect(5 + Math.floor(rng() * 60), 18 + Math.floor(rng() * 28), 4, 1);
    g.fillStyle = PAL.K;
    for (var j2 = 0; j2 < 26; j2++) g.fillRect(5 + Math.floor(rng() * 60), 18 + Math.floor(rng() * 28), 3, 1);
    // door
    g.fillStyle = PAL['0']; g.fillRect(28, 24, 16, 27);
    g.fillStyle = PAL.K; g.fillRect(30, 26, 12, 25);
    g.fillStyle = '#05060d'; g.fillRect(32, 30, 8, 21);
    // columns
    g.fillStyle = PAL['0']; g.fillRect(10, 18, 6, 33); g.fillRect(56, 18, 6, 33);
    g.fillStyle = PAL.M; g.fillRect(11, 19, 4, 31); g.fillRect(57, 19, 4, 31);
    g.fillStyle = PAL.H; g.fillRect(11, 19, 1, 31); g.fillRect(57, 19, 1, 31);
    // candles by the door
    g.fillStyle = PAL.W; g.fillRect(24, 46, 2, 5); g.fillRect(46, 47, 2, 4);
    g.fillStyle = PAL.o; g.fillRect(24, 45, 2, 1); g.fillRect(46, 46, 2, 1);
  });

  // chapel facade: 112x88
  S.chapel = function (lit) {
    return make(112, 88, function (g) {
      // main body
      g.fillStyle = PAL['0']; g.fillRect(8, 34, 96, 53);
      g.fillStyle = PAL.m; g.fillRect(10, 36, 92, 50);
      // roof (broken)
      g.fillStyle = PAL['0'];
      for (var i = 0; i < 13; i++) g.fillRect(8 + i * 4, 30 - i * 2, 96 - i * 8, 4);
      g.fillStyle = PAL.K;
      for (var i2 = 0; i2 < 12; i2++) g.fillRect(10 + i2 * 4, 31 - i2 * 2, 92 - i2 * 8, 2);
      // hole in roof
      g.fillStyle = PAL.m; g.fillRect(70, 16, 18, 12);
      g.fillStyle = PAL['0']; g.fillRect(70, 16, 18, 2); g.fillRect(70, 26, 18, 2);
      // tower + cross
      g.fillStyle = PAL['0']; g.fillRect(48, 0, 16, 22);
      g.fillStyle = PAL.m; g.fillRect(50, 2, 12, 20);
      g.fillStyle = PAL.M; g.fillRect(50, 2, 12, 2);
      g.fillStyle = PAL.K; g.fillRect(53, 6, 6, 8);
      g.fillStyle = PAL['0']; g.fillRect(55, -0, 2, 2);
      g.fillStyle = PAL.Y; g.fillRect(55, 0, 2, 1);
      // stones texture
      var rng = HC.srng(1234);
      g.fillStyle = PAL.M;
      for (var j = 0; j < 90; j++) g.fillRect(12 + Math.floor(rng() * 86), 38 + Math.floor(rng() * 44), 5, 1);
      g.fillStyle = PAL.K;
      for (var j2 = 0; j2 < 60; j2++) g.fillRect(12 + Math.floor(rng() * 86), 38 + Math.floor(rng() * 44), 4, 1);
      // cracks
      g.fillStyle = PAL.K;
      g.fillRect(20, 40, 1, 12); g.fillRect(21, 50, 1, 8); g.fillRect(88, 44, 1, 16); g.fillRect(87, 58, 1, 6);
      // windows
      function windowAt(x, y) {
        g.fillStyle = PAL['0']; g.fillRect(x, y, 12, 20);
        g.fillStyle = PAL['0']; g.fillRect(x + 2, y - 3, 8, 4);
        g.fillStyle = lit ? PAL.O : PAL.K;
        g.fillRect(x + 2, y + 2, 8, 16);
        if (lit) {
          g.fillStyle = PAL.o; g.fillRect(x + 4, y + 4, 4, 10);
          g.fillStyle = PAL.y; g.fillRect(x + 5, y + 6, 2, 4);
        } else {
          g.fillStyle = '#101426'; g.fillRect(x + 4, y + 4, 4, 12);
        }
        g.fillStyle = PAL['0']; g.fillRect(x + 5, y + 2, 1, 16); g.fillRect(x + 2, y + 9, 8, 1);
      }
      windowAt(20, 46);
      windowAt(80, 46);
      // door (arched)
      g.fillStyle = PAL['0']; g.fillRect(44, 52, 24, 35);
      g.fillStyle = PAL.D; g.fillRect(46, 56, 20, 31);
      g.fillStyle = PAL['0']; g.fillRect(46, 52, 20, 6);
      g.fillStyle = PAL.D; g.fillRect(48, 54, 16, 6);
      g.fillStyle = PAL.B; g.fillRect(48, 58, 7, 28); g.fillRect(57, 58, 7, 28);
      g.fillStyle = PAL['0']; g.fillRect(55, 56, 2, 31);
      g.fillStyle = PAL.Y; g.fillRect(52, 70, 2, 2); g.fillRect(58, 70, 2, 2);
      // banners
      g.drawImage(S.banner, 12, 46);
      g.drawImage(S.banner, 92, 46);
    });
  };
  S.chapelDark = S.chapel(false);
  S.chapelLit = S.chapel(true);

  // ---------- tiles ----------
  function tile(fn, seed) {
    var rng = HC.srng(seed || 1);
    return make(16, 16, function (g) { fn(g, rng); });
  }
  var T = {};
  T.grass = [];
  for (var gi = 0; gi < 4; gi++) {
    T.grass.push(tile(function (g, rng) {
      speckle(g, 16, 16, '#222b1e', [
        { color: '#283323', density: 0.14 },
        { color: '#1b2318', density: 0.12 },
        { color: '#33402a', density: 0.05 },
        { color: '#171d14', density: 0.03 }
      ], rng);
    }, 100 + gi));
  }
  T.darkgrass = [];
  for (var gj = 0; gj < 3; gj++) {
    T.darkgrass.push(tile(function (g, rng) {
      speckle(g, 16, 16, '#1a2118', [
        { color: '#202a1c', density: 0.12 },
        { color: '#141a12', density: 0.12 },
        { color: '#26301f', density: 0.03 }
      ], rng);
    }, 200 + gj));
  }
  T.path = [];
  for (var pi = 0; pi < 3; pi++) {
    T.path.push(tile(function (g, rng) {
      speckle(g, 16, 16, '#37301f', [
        { color: '#403827', density: 0.12 },
        { color: '#2c2618', density: 0.14 },
        { color: '#4c422c', density: 0.04 },
        { color: '#241f13', density: 0.04 }
      ], rng);
    }, 300 + pi));
  }
  T.mud = [];
  for (var mi = 0; mi < 3; mi++) {
    T.mud.push(tile(function (g, rng) {
      speckle(g, 16, 16, '#241c12', [
        { color: '#2d2317', density: 0.13 },
        { color: '#1a140d', density: 0.16 },
        { color: '#b0a88f', density: 0.012 },
        { color: '#3a2e1d', density: 0.04 }
      ], rng);
    }, 400 + mi));
  }
  T.stonefloor = [];
  for (var si = 0; si < 3; si++) {
    T.stonefloor.push(tile(function (g, rng) {
      speckle(g, 16, 16, '#2b3040', [
        { color: '#333a4e', density: 0.1 },
        { color: '#222636', density: 0.14 },
        { color: '#1a1e2c', density: 0.04 }
      ], rng);
      g.fillStyle = '#222636';
      if (rng() < 0.6) g.fillRect(0, Math.floor(rng() * 16), 16, 1);
      if (rng() < 0.6) g.fillRect(Math.floor(rng() * 16), 0, 1, 16);
    }, 500 + si));
  }
  T.wall = tile(function (g, rng) {
    g.fillStyle = '#0d0f1e'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#3a4157'; g.fillRect(0, 0, 16, 5);
    g.fillStyle = '#4c5570'; g.fillRect(0, 0, 16, 1);
    g.fillStyle = '#262b3d'; g.fillRect(0, 5, 16, 11);
    g.fillStyle = '#1c2030';
    g.fillRect(2, 7, 5, 1); g.fillRect(9, 10, 5, 1); g.fillRect(4, 13, 6, 1);
    g.fillStyle = '#303650';
    g.fillRect(1, 6, 4, 1); g.fillRect(8, 9, 4, 1);
  }, 600);
  T.wallLow = tile(function (g, rng) {
    g.fillStyle = '#0d0f1e'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#343b52'; g.fillRect(1, 2, 14, 13);
    g.fillStyle = '#454e6b'; g.fillRect(1, 2, 14, 2);
    g.fillStyle = '#252a3c'; g.fillRect(2, 8, 5, 1); g.fillRect(9, 11, 4, 1);
  }, 601);
  S.tiles = T;

  S.fromMap = fromMap;
  S.make = make;
  S.flipX = flipX;
  S.PAL = PAL;
  return S;
})();
