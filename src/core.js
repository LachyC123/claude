// The Hollow Crown — core engine: namespace, math, input, camera, particles, audio, bitmap font
'use strict';
var HC = window.HC = {};

HC.VIEW_W = 400;
HC.VIEW_H = 225;
HC.TILE = 16;
HC.DEBUG = /[?&]debug/.test(location.search);

// ---------- math ----------
HC.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
HC.lerp = function (a, b, t) { return a + (b - a) * t; };
HC.dist = function (ax, ay, bx, by) { var dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); };
HC.angTo = function (ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); };
HC.angDiff = function (a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
HC.rand = function (a, b) { return a + Math.random() * (b - a); };
HC.randi = function (a, b) { return Math.floor(HC.rand(a, b + 1)); };
HC.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

// seeded rng for deterministic tile/prop art
HC.srng = function (seed) {
  var s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

// ---------- input ----------
HC.input = (function () {
  var down = {}, pressed = {};
  var MAP = {
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    attack: ['KeyJ', 'KeyX'],
    dodge: ['Space', 'KeyK'],
    guard: ['KeyL', 'ShiftLeft', 'ShiftRight'],
    flask: ['KeyF'],
    interact: ['KeyE', 'Enter'],
    pause: ['Escape', 'KeyP'],
    any: []
  };
  window.addEventListener('keydown', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
    if (!down[e.code]) pressed[e.code] = true;
    down[e.code] = true;
    pressed._any = true;
    if (HC.audio) HC.audio.ensure();
  });
  window.addEventListener('keyup', function (e) { down[e.code] = false; });
  window.addEventListener('blur', function () { down = {}; });
  function has(obj, action) {
    if (action === 'any') return !!obj._any;
    var codes = MAP[action];
    for (var i = 0; i < codes.length; i++) if (obj[codes[i]]) return true;
    return false;
  }
  return {
    held: function (a) { return has(down, a); },
    hit: function (a) { return has(pressed, a); },
    code: function (c) { return !!pressed[c]; },
    endFrame: function () { pressed = {}; }
  };
})();

// ---------- camera ----------
HC.camera = {
  x: 0, y: 0, tx: 0, ty: 0,
  shakeT: 0, shakeMag: 0,
  bounds: { w: 2000, h: 2000 },
  follow: function (x, y) { this.tx = x - HC.VIEW_W / 2; this.ty = y - HC.VIEW_H / 2; },
  snap: function (x, y) { this.follow(x, y); this.x = this.tx; this.y = this.ty; this.clampView(); },
  shake: function (mag, dur) { this.shakeMag = Math.max(this.shakeMag, mag); this.shakeT = Math.max(this.shakeT, dur); },
  clampView: function () {
    this.x = HC.clamp(this.x, 0, Math.max(0, this.bounds.w - HC.VIEW_W));
    this.y = HC.clamp(this.y, 0, Math.max(0, this.bounds.h - HC.VIEW_H));
  },
  update: function (dt) {
    this.x = HC.lerp(this.x, this.tx, 1 - Math.pow(0.001, dt));
    this.y = HC.lerp(this.y, this.ty, 1 - Math.pow(0.001, dt));
    this.clampView();
    if (this.shakeT > 0) this.shakeT -= dt;
  },
  ox: function () { return Math.round(this.x + (this.shakeT > 0 ? HC.rand(-this.shakeMag, this.shakeMag) : 0)); },
  oy: function () { return Math.round(this.y + (this.shakeT > 0 ? HC.rand(-this.shakeMag, this.shakeMag) : 0)); }
};

// ---------- particles ----------
HC.particles = (function () {
  var list = [];
  return {
    list: list,
    spawn: function (o) {
      if (list.length > 500) list.shift();
      list.push({
        x: o.x, y: o.y,
        vx: o.vx || 0, vy: o.vy || 0,
        life: o.life || 0.5, t: 0,
        size: o.size || 1,
        color: o.color || '#fff',
        grav: o.grav || 0,
        drag: o.drag == null ? 1 : o.drag,
        glow: o.glow || 0
      });
    },
    burst: function (x, y, n, opts) {
      for (var i = 0; i < n; i++) {
        var a = HC.rand(0, Math.PI * 2), sp = HC.rand(opts.spMin || 10, opts.spMax || 60);
        this.spawn({
          x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: HC.rand(opts.lifeMin || 0.2, opts.lifeMax || 0.6),
          size: opts.size || 1, color: typeof opts.color === 'function' ? opts.color() : opts.color,
          grav: opts.grav || 0, drag: opts.drag == null ? 0.9 : opts.drag, glow: opts.glow || 0
        });
      }
    },
    update: function (dt) {
      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        p.t += dt;
        if (p.t >= p.life) { list.splice(i, 1); continue; }
        p.vy += p.grav * dt;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    },
    draw: function (ctx, cx, cy) {
      for (var i = 0; i < list.length; i++) {
        var p = list[i], a = 1 - p.t / p.life;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        var s = Math.max(1, Math.round(p.size * (0.5 + a * 0.5)));
        ctx.fillRect(Math.round(p.x - cx - s / 2), Math.round(p.y - cy - s / 2), s, s);
      }
      ctx.globalAlpha = 1;
    }
  };
})();

// ---------- floating text ----------
HC.floaters = (function () {
  var list = [];
  return {
    add: function (x, y, text, color, big) {
      list.push({ x: x, y: y, text: text, color: color || '#fff', t: 0, life: 0.9, big: !!big });
    },
    update: function (dt) {
      for (var i = list.length - 1; i >= 0; i--) {
        var f = list[i]; f.t += dt; f.y -= 18 * dt;
        if (f.t >= f.life) list.splice(i, 1);
      }
    },
    draw: function (ctx, cx, cy) {
      for (var i = 0; i < list.length; i++) {
        var f = list[i];
        ctx.globalAlpha = HC.clamp(2 - 2 * f.t / f.life, 0, 1);
        HC.font.draw(ctx, f.text, Math.round(f.x - cx), Math.round(f.y - cy), f.color, f.big ? 1 : 1, 'center');
      }
      ctx.globalAlpha = 1;
    }
  };
})();

// ---------- bitmap font (5x7) ----------
HC.font = (function () {
  var G = {
    'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    'C': ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    'G': ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
    'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'I': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    'J': ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
    'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    'V': ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
    'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
    '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '#####'],
    '2': ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
    '3': ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
    '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
    '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
    '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
    '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
    ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
    '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
    '?': ['.###.', '#...#', '....#', '..##.', '..#..', '.....', '..#..'],
    "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....'],
    '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
    ':': ['.....', '..#..', '..#..', '.....', '..#..', '..#..', '.....'],
    '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
    '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
    '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
    ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
    '"': ['.#.#.', '.#.#.', '.....', '.....', '.....', '.....', '.....'],
    '>': ['.....', '#....', '.#...', '..#..', '.#...', '#....', '.....'],
    '<': ['.....', '...#.', '..#..', '.#...', '..#..', '...#.', '.....'],
    '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....']
  };
  var cache = {};
  function glyphCanvas(ch, color) {
    var key = ch + '|' + color;
    if (cache[key]) return cache[key];
    var rows = G[ch];
    if (!rows) return null;
    var c = document.createElement('canvas');
    c.width = 5; c.height = 7;
    var g = c.getContext('2d');
    g.fillStyle = color;
    for (var y = 0; y < 7; y++)
      for (var x = 0; x < 5; x++)
        if (rows[y].charAt(x) === '#') g.fillRect(x, y, 1, 1);
    cache[key] = c;
    return c;
  }
  function width(text) { return text.length * 6 - 1; }
  function draw(ctx, text, x, y, color, scale, align) {
    text = String(text).toUpperCase();
    scale = scale || 1;
    var w = width(text) * scale;
    if (align === 'center') x -= Math.round(w / 2);
    else if (align === 'right') x -= w;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === ' ') continue;
      var gc = glyphCanvas(ch, color || '#fff');
      if (gc) ctx.drawImage(gc, 0, 0, 5, 7, x + i * 6 * scale, y, 5 * scale, 7 * scale);
    }
  }
  function drawShadow(ctx, text, x, y, color, scale, align) {
    draw(ctx, text, x + 1, y + 1, '#0a0c18', scale, align);
    draw(ctx, text, x, y, color, scale, align);
  }
  function wrap(text, maxChars) {
    var words = String(text).split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = cur ? cur + ' ' + words[i] : words[i];
      if (t.length > maxChars && cur) { lines.push(cur); cur = words[i]; }
      else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  return { draw: draw, drawShadow: drawShadow, width: width, wrap: wrap };
})();

// ---------- audio ----------
HC.audio = (function () {
  var ctx = null, master = null, musicBus = null, delay = null, noiseBuf = null;
  var enabled = true;

  function ensure() {
    if (ctx || !enabled) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { enabled = false; return; }
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.34;
    var fb = ctx.createGain(); fb.gain.value = 0.34;
    var wet = ctx.createGain(); wet.gain.value = 0.3;
    delay.connect(fb); fb.connect(delay);
    delay.connect(wet); wet.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0.55;
    musicBus.connect(master);
    musicBus.connect(delay);

    var len = ctx.sampleRate * 1;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  function now() { return ctx ? ctx.currentTime : 0; }

  function env(g, t0, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  function tone(type, freq, dur, peak, opts) {
    if (!ctx) return;
    opts = opts || {};
    var t0 = now() + (opts.at || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t0 + dur);
    env(g, t0, opts.a || 0.005, peak, dur);
    o.connect(g);
    g.connect(opts.music ? musicBus : master);
    if (opts.echo && !opts.music) g.connect(delay);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, peak, opts) {
    if (!ctx) return;
    opts = opts || {};
    var t0 = now() + (opts.at || 0);
    var s = ctx.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    var filt = ctx.createBiquadFilter();
    filt.type = opts.type || 'bandpass';
    filt.frequency.setValueAtTime(opts.freq || 1000, t0);
    if (opts.fslide) filt.frequency.exponentialRampToValueAtTime(Math.max(40, opts.fslide), t0 + dur);
    filt.Q.value = opts.q || 1;
    var g = ctx.createGain();
    env(g, t0, opts.a || 0.005, peak, dur);
    s.connect(filt); filt.connect(g); g.connect(master);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }

  var sfx = {
    swing: function () { noise(0.12, 0.22, { freq: 2400, fslide: 500, q: 2 }); },
    hit: function () {
      noise(0.1, 0.4, { freq: 700, fslide: 150, q: 1.5 });
      tone('square', 160, 0.08, 0.18, { slide: 70 });
    },
    hitCrit: function () {
      noise(0.14, 0.5, { freq: 900, fslide: 120, q: 1.5 });
      tone('square', 220, 0.12, 0.22, { slide: 60 });
    },
    hurt: function () {
      tone('sawtooth', 130, 0.22, 0.3, { slide: 55 });
      noise(0.15, 0.3, { freq: 400, fslide: 100 });
    },
    dodge: function () { noise(0.14, 0.15, { freq: 1200, fslide: 3000, q: 1 }); },
    guard: function () { tone('triangle', 300, 0.15, 0.2, { slide: 180 }); noise(0.08, 0.12, { freq: 3000, q: 3 }); },
    guardBlock: function () { tone('square', 90, 0.15, 0.3, { slide: 60 }); noise(0.1, 0.35, { freq: 500, q: 2 }); },
    soul: function () {
      tone('sine', 660, 0.18, 0.1, { echo: true });
      tone('sine', 990, 0.22, 0.07, { at: 0.05, echo: true });
    },
    heal: function () {
      tone('sine', 440, 0.3, 0.12, { slide: 660, echo: true });
      tone('sine', 550, 0.35, 0.1, { at: 0.1, slide: 880, echo: true });
    },
    interact: function () { tone('triangle', 520, 0.1, 0.12); },
    bell: function () {
      tone('sine', 340, 1.6, 0.28, { echo: true });
      tone('sine', 508, 1.2, 0.14, { echo: true });
      tone('sine', 906, 0.8, 0.08, { echo: true });
      noise(0.06, 0.2, { freq: 2500, q: 4 });
    },
    gate: function () {
      noise(0.5, 0.3, { type: 'lowpass', freq: 300, fslide: 90 });
      tone('square', 65, 0.5, 0.16, { slide: 45 });
    },
    roar: function () {
      tone('sawtooth', 90, 0.8, 0.3, { slide: 45, echo: true });
      noise(0.6, 0.25, { type: 'lowpass', freq: 600, fslide: 150 });
    },
    slam: function () {
      noise(0.3, 0.5, { type: 'lowpass', freq: 400, fslide: 60 });
      tone('sine', 70, 0.35, 0.4, { slide: 35 });
    },
    summon: function () {
      tone('sawtooth', 200, 0.5, 0.12, { slide: 90, echo: true });
      noise(0.4, 0.15, { freq: 300, fslide: 900 });
    },
    bossDeath: function () {
      tone('sawtooth', 160, 1.4, 0.3, { slide: 30, echo: true });
      tone('sine', 660, 1.8, 0.12, { at: 0.4, slide: 1320, echo: true });
      noise(1.0, 0.3, { type: 'lowpass', freq: 800, fslide: 60 });
    },
    playerDeath: function () {
      tone('sawtooth', 220, 1.2, 0.25, { slide: 40, echo: true });
      tone('sine', 440, 1.6, 0.1, { at: 0.3, slide: 110, echo: true });
    },
    ui: function () { tone('square', 700, 0.06, 0.08); },
    buy: function () { tone('sine', 520, 0.12, 0.12, { echo: true }); tone('sine', 780, 0.18, 0.1, { at: 0.08, echo: true }); },
    deny: function () { tone('square', 140, 0.15, 0.12, { slide: 100 }); },
    arrow: function () { noise(0.1, 0.18, { freq: 1800, fslide: 600, q: 2 }); },
    brazier: function () {
      noise(0.8, 0.2, { type: 'lowpass', freq: 900, fslide: 300 });
      tone('sine', 220, 1.2, 0.15, { slide: 440, echo: true });
      tone('sine', 330, 1.6, 0.1, { at: 0.3, slide: 660, echo: true });
    },
    rise: function () { noise(0.5, 0.2, { type: 'lowpass', freq: 500, fslide: 120 }); tone('sawtooth', 100, 0.4, 0.1, { slide: 60 }); }
  };

  // music: sparse dark ambient / boss pulse, scheduled per beat
  var music = { mode: 'none', nextAt: 0, bar: 0 };
  var SCALE = [110, 130.81, 146.83, 164.81, 196, 220];
  function setMode(m) { if (music.mode !== m) { music.mode = m; music.bar = 0; } }
  function musicUpdate() {
    if (!ctx || music.mode === 'none') return;
    while (music.nextAt < now() + 0.3) {
      var t = Math.max(music.nextAt, now());
      var at = t - now();
      music.bar++;
      if (music.mode === 'ambient') {
        var root = [110, 87.31, 98, 110][Math.floor(music.bar / 2) % 4];
        tone('triangle', root, 2.6, 0.10, { at: at, a: 0.8, music: true });
        tone('triangle', root * 1.5, 2.6, 0.05, { at: at, a: 1.0, music: true });
        if (Math.random() < 0.4) {
          var n = HC.pick(SCALE) * 4;
          tone('sine', n, 1.2, 0.05, { at: at + HC.rand(0, 1.2), a: 0.02, music: true });
        }
        music.nextAt = t + 2.4;
      } else if (music.mode === 'boss') {
        var step = 0.46;
        for (var i = 0; i < 4; i++) {
          tone('sawtooth', i % 2 === 0 ? 55 : 55, 0.22, i % 4 === 0 ? 0.20 : 0.11, { at: at + i * step, a: 0.01, music: true });
        }
        var chord = [110, 130.81, 164.81];
        if (music.bar % 2 === 0)
          for (var j = 0; j < chord.length; j++)
            tone('square', chord[j] * (music.bar % 4 === 0 ? 1 : 0.891), 0.5, 0.03, { at: at + 0.02, a: 0.05, music: true });
        if (Math.random() < 0.5) tone('sine', HC.pick(SCALE) * 8, 0.4, 0.04, { at: at + step * HC.randi(0, 3), music: true });
        music.nextAt = t + step * 4;
      } else if (music.mode === 'hub') {
        var r2 = [130.81, 110, 146.83, 110][Math.floor(music.bar / 2) % 4];
        tone('triangle', r2, 2.6, 0.09, { at: at, a: 0.9, music: true });
        tone('sine', r2 * 2, 2.6, 0.04, { at: at, a: 1.0, music: true });
        if (Math.random() < 0.55) {
          tone('sine', HC.pick([261.63, 329.63, 392, 440, 523.25]), 1.4, 0.05, { at: at + HC.rand(0, 1.4), a: 0.03, music: true });
        }
        music.nextAt = t + 2.4;
      }
    }
  }
  return { ensure: ensure, sfx: sfx, setMusic: setMode, update: musicUpdate, get ctx() { return ctx; } };
})();
