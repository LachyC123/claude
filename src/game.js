// The Hollow Crown — game orchestration: states, map/event flow, HUD, main loop
'use strict';

HC.run = null;

HC.game = (function () {
  var G = {
    state: 'title',
    ents: [], player: null, vela: null, boss: null,
    hitstop: 0, fade: 1, fadeDir: -1,
    mapBannerT: 0, deathT: 0, endShown: false,
    upgSel: 0, flags: null, pendingMap: null,
    titleT: 0
  };
  var canvas, ctx;

  // ---------- run state ----------
  function newRun() {
    HC.run = {
      souls: 0,
      stats: { hp: 0, st: 0, str: 0 },
      checkpoint: { map: 'graveyard', entry: 'start' },
      time: 0, deaths: 0, kills: 0
    };
    G.flags = {
      swordTaken: false, graveCleared: false, z0Cleared: false,
      bossDead: false, brazierLit: false, metCole: false,
      shrineSeen: false, sawIntro: false, sawPreBoss: false,
      sawVillageEnter: false, sawVillageChoice: false,
      q1Started: false, choiceMade: null, rescueDone: false,
      bramSaved: false, lysaSaved: false, lostSeen: false,
      hasOil: false, q1Done: false
    };
  }

  // ---------- save / continue ----------
  var SAVE_KEY = 'hollowcrown_save';
  G.saveGame = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1,
        souls: HC.run.souls, stats: HC.run.stats, checkpoint: HC.run.checkpoint,
        time: HC.run.time, deaths: HC.run.deaths, kills: HC.run.kills,
        flags: G.flags
      }));
    } catch (e) { }
  };
  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  }
  function loadSave() {
    try {
      var d = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!d || d.v !== 1) return false;
      newRun();
      HC.run.souls = d.souls || 0;
      HC.run.stats = d.stats || HC.run.stats;
      HC.run.checkpoint = d.checkpoint || HC.run.checkpoint;
      HC.run.time = d.time || 0;
      HC.run.deaths = d.deaths || 0;
      HC.run.kills = d.kills || 0;
      for (var k in d.flags) G.flags[k] = d.flags[k];
      return true;
    } catch (e) { return false; }
  }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }

  G.setCheckpoint = function (map, entry) {
    HC.run.checkpoint = { map: map, entry: entry };
    G.saveGame();
  };

  // debug: jump straight to a post-prologue chapel with the flame lit
  G.debugToChapel = function () {
    newRun();
    HC.run.souls = 500;
    var f = G.flags;
    f.sawIntro = f.swordTaken = f.graveCleared = f.z0Cleared = true;
    f.bossDead = f.sawPreBoss = f.metCole = f.brazierLit = f.shrineSeen = true;
    HC.run.checkpoint = { map: 'chapel', entry: 'fromGraveyard' };
    G.loadMap('chapel', 'fromGraveyard');
    G.state = 'play';
  };

  // one source of truth for the objective tracker, derived from flags
  G.refreshQuest = function () {
    var F = G.flags;
    if (F.q1Done) HC.quest.set('THE BELL TOWER AWAITS - GROW STRONG');
    else if (F.q1Started) {
      if (F.choiceMade && !F.rescueDone) HC.quest.set(F.choiceMade === 'bram' ? 'DEFEND THE WORKSHOP' : 'DEFEND THE CELLAR');
      else if (F.hasOil) HC.quest.set('RETURN THE OIL TO THE CHAPEL FLAME');
      else if (!F.choiceMade) HC.quest.set('SEARCH THE BURNED VILLAGE - ANSWER THE VOICES');
      else HC.quest.set('FIND THE HOLY OIL IN THE VILLAGE STORE');
    }
    else if (F.brazierLit) HC.quest.set('SPEAK TO BROTHER COLE');
    else if (F.metCole) HC.quest.set('LIGHT THE CHAPEL FLAME');
    else if (F.bossDead || F.z0Cleared) HC.quest.set('REACH CANDLEFALL CHAPEL');
    else if (F.graveCleared) HC.quest.set('FOLLOW THE GRAVEYARD PATH NORTH');
    else if (F.swordTaken) HC.quest.set('CUT DOWN THE RISEN DEAD');
    else if (F.sawIntro) HC.quest.set('FIND A WEAPON IN THE MASS GRAVE');
  };

  // ---------- map loading ----------
  G.loadMap = function (mapId, entry) {
    HC.dialogue.active = false; // a new map never carries the previous scene's conversation
    var def = HC.maps[mapId];
    var spawn = HC.world.load(def, entry);
    G.ents = [];
    G.boss = null;

    for (var i = 0; i < def.spawns.length; i++) {
      var s = def.spawns[i];
      if (s.type === 'gravekeeper') {
        if (G.flags.bossDead) continue;
        G.boss = HC.makeGravekeeper(s.x * HC.TILE + 8, s.y * HC.TILE + 8);
        G.ents.push(G.boss);
      } else if (HC.ENEMY_DEFS[s.type]) {
        if (s.delayed && !G.flags[s.delayed]) continue;
        var e = HC.makeEnemy(s.type, s.x * HC.TILE + 8, s.y * HC.TILE + 8, s.zone);
        e.rising = 0;
        G.ents.push(e);
      } else if (s.type === 'wisp' || s.type === 'ember') {
        G.ents.push(HC.makePickup(s.type, s.x, s.y));
      } else if (s.type === 'sword') {
        if (!G.flags.swordTaken) G.ents.push(HC.makeInteractable('sword', s.x, s.y));
      } else if (s.type === 'oil') {
        if (!G.flags.hasOil) G.ents.push(HC.makeInteractable('oil', s.x, s.y));
      } else {
        G.ents.push(HC.makeInteractable(s.type, s.x, s.y));
      }
    }

    if (mapId === 'village' && G.flags.choiceMade && !G.flags.rescueDone) {
      spawnRescueWave(G.flags.choiceMade, true);
    }
    if (mapId === 'chapel') {
      if (G.flags.bramSaved) {
        G.ents.push(HC.makeInteractable('bram', 10, 11));
        HC.world.spawnProp('tent', 8, 10);
      }
      if (G.flags.lysaSaved) {
        G.ents.push(HC.makeInteractable('lysa', 10, 11));
        HC.world.spawnProp('herbtable', 8, 10);
      }
    }

    G.player = HC.makePlayer(spawn.x, spawn.y);
    G.player.face = spawn.face || 'down';
    G.player.hasSword = G.flags.swordTaken;
    G.vela = HC.makeVela(G.player);
    G.ents.push(G.vela);

    // gates re-apply persistent flags
    if (mapId === 'graveyard') {
      if (G.flags.z0Cleared) { HC.world.gates.A.open = true; HC.world.gates.A.anim = 1; }
      if (G.flags.bossDead) {
        HC.world.gates.B.open = true; HC.world.gates.B.anim = 1;
        HC.world.gates.D.open = true; HC.world.gates.D.anim = 1;
      }
      // triggers that already fired stay quiet
      markFired('intro', true);
      if (G.flags.bossDead) { markFired('preBoss'); markFired('bossStart'); }
    }
    if (mapId === 'chapel') {
      if (G.flags.brazierLit) HC.world.setChapelLit();
      if (G.flags.metCole || G.flags.brazierLit) markFired('chapelIntro');
    }

    HC.camera.snap(G.player.x, G.player.y);
    HC.audio.setMusic(G.flags.brazierLit && mapId === 'chapel' ? 'hub' : def.music);
    G.mapBannerT = 3;
    G.currentMap = mapId;
    G.refreshQuest();

    function markFired(ev, onlyIfSeen) {
      for (var t = 0; t < HC.world.triggers.length; t++) {
        var tr = HC.world.triggers[t];
        if (tr.event === ev) {
          if (onlyIfSeen && !G.flags.sawIntro) continue;
          tr.fired = true;
        }
      }
    }
  };

  // ---------- events ----------
  G.event = function (name) {
    switch (name) {
      case 'intro':
        G.flags.sawIntro = true;
        HC.dialogue.start('intro', function () { G.refreshQuest(); });
        break;
      case 'swordTaken':
        G.flags.swordTaken = true;
        G.player.hasSword = true;
        HC.audio.sfx.soul();
        HC.dialogue.start('swordTaken', function () {
          G.refreshQuest();
          HC.toast('J / X : ATTACK      SPACE : DODGE ROLL      L : ASH GUARD');
          spawnDelayed('swordTaken');
          G.saveGame();
        });
        break;
      case 'graveCleared':
        HC.dialogue.start('graveCleared', function () { G.refreshQuest(); });
        break;
      case 'z0Cleared':
        G.flags.z0Cleared = true;
        HC.world.setGate('A', true);
        G.setCheckpoint('graveyard', 'gateA');
        HC.dialogue.start('zone0Cleared', function () {
          G.refreshQuest();
          HC.toast('CHECKPOINT - THE GATE STANDS OPEN');
        });
        break;
      case 'preBoss':
        if (G.flags.sawPreBoss) break;
        G.flags.sawPreBoss = true;
        HC.dialogue.start('preBoss');
        break;
      case 'bossStart':
        if (!G.boss || G.flags.bossDead) break;
        HC.world.setGate('B', false);
        HC.dialogue.start('bossStart', function () {
          G.boss.activate();
          HC.audio.setMusic('boss');
        });
        break;
      case 'bossDead':
        HC.dialogue.start('bossDead', function () { G.refreshQuest(); });
        break;
      case 'toChapel':
        G.pendingMap = { map: 'chapel', entry: 'fromGraveyard' };
        break;
      case 'toGraveyard':
        G.pendingMap = { map: 'graveyard', entry: 'fromChapel' };
        break;
      case 'chapelIntro':
        HC.dialogue.start('chapelIntro', function () {
          HC.quest.set('FIND WHO STILL LIVES HERE');
        });
        break;
      case 'brazierLit':
        G.flags.brazierLit = true;
        HC.world.setChapelLit();
        HC.audio.sfx.brazier();
        HC.audio.setMusic('hub');
        HC.camera.shake(2, 0.3);
        G.setCheckpoint('chapel', 'fromGraveyard');
        HC.dialogue.start('brazierLit', function () {
          G.refreshQuest();
          var mins = Math.floor(HC.run.time / 60), secs = Math.floor(HC.run.time % 60);
          G.endInfo = {
            title: 'THE CHAPEL FLAME IS LIT',
            sub: 'PROLOGUE COMPLETE',
            stats: 'TIME ' + mins + ':' + (secs < 10 ? '0' : '') + secs + '   DEATHS ' + HC.run.deaths + '   SLAIN ' + HC.run.kills,
            lines: ['NEXT : QUEST 1 - LIGHT THE CHAPEL', 'SPEAK TO BROTHER COLE', 'THE BURNED VILLAGE WAITS ON THE WEST ROAD']
          };
          G.state = 'end';
          G.saveGame();
        });
        break;
      case 'toVillage':
        if (!G.flags.q1Started) {
          G.player.x = Math.max(G.player.x, 3.5 * HC.TILE);
          HC.floaters.add(G.player.x, G.player.y - 18, 'THE ASH WIND BITES - SPEAK TO COLE FIRST', '#c9bfa4');
        } else {
          G.pendingMap = { map: 'village', entry: 'fromChapel' };
        }
        break;
      case 'toChapelEast':
        G.pendingMap = { map: 'chapel', entry: 'fromVillage' };
        break;
      case 'villageEnter':
        if (G.flags.sawVillageEnter) break;
        G.flags.sawVillageEnter = true;
        G.setCheckpoint('village', 'fromChapel');
        HC.dialogue.start('villageEnter');
        break;
      case 'villageChoice':
        if (G.flags.sawVillageChoice || G.flags.choiceMade) break;
        G.flags.sawVillageChoice = true;
        HC.dialogue.start('villageChoice');
        G.saveGame();
        break;
      case 'q1Return':
        G.flags.q1Done = true;
        G.flags.hasOil = false;
        HC.audio.sfx.brazier();
        HC.audio.setMusic('hub');
        HC.camera.shake(3, 0.5);
        HC.particles.burst(G.player.x, G.player.y - 20, 40, { color: '#ffd47a', spMin: 15, spMax: 90, lifeMax: 1.2, glow: 1 });
        G.setCheckpoint('chapel', 'fromGraveyard');
        HC.dialogue.start('q1Return', function () {
          G.refreshQuest();
          var mins = Math.floor(HC.run.time / 60), secs = Math.floor(HC.run.time % 60);
          var who = G.flags.bramSaved ? 'BRAM THE CARPENTER JOINS CANDLEFALL' :
                    G.flags.lysaSaved ? 'LYSA THE HERBALIST JOINS CANDLEFALL' : 'THE VILLAGE IS ASHES';
          G.endInfo = {
            title: 'QUEST 1 COMPLETE',
            sub: 'LIGHT THE CHAPEL',
            stats: 'TIME ' + mins + ':' + (secs < 10 ? '0' : '') + secs + '   DEATHS ' + HC.run.deaths + '   SLAIN ' + HC.run.kills,
            lines: [who, 'THE CHAPEL FLAME BURNS BRIGHT AND TRUE', 'NEXT : THE BELL TOWER - SILENCE THE CURSED BELL']
          };
          G.state = 'end';
          G.saveGame();
        });
        break;
    }
  }

  function spawnRescueWave(who, silent) {
    var spots = who === 'bram'
      ? [[4, 18], [8, 18.5], [6, 19.5], [9.5, 16]]
      : [[31, 28.5], [35, 28.5], [33, 30], [30, 26]];
    for (var i = 0; i < spots.length; i++) {
      var t = i === 3 ? 'archer' : 'hollow';
      var e = HC.makeEnemy(t, spots[i][0] * HC.TILE + 8, spots[i][1] * HC.TILE + 8, 'rescue');
      e.rising = silent ? 0 : 0.9 + i * 0.25;
      e.state = 'aggro';
      G.ents.push(e);
      if (!silent) HC.audio.sfx.rise();
    }
  };

  function spawnDelayed(flag) {
    var def = HC.maps[G.currentMap];
    for (var i = 0; i < def.spawns.length; i++) {
      var s = def.spawns[i];
      if (s.delayed === flag && HC.ENEMY_DEFS[s.type]) {
        var e = HC.makeEnemy(s.type, s.x * HC.TILE + 8, s.y * HC.TILE + 8, s.zone);
        e.rising = 0.9;
        e.state = 'aggro';
        G.ents.push(e);
        HC.audio.sfx.rise();
      }
    }
  }

  G.onEnemyDead = function (e) {
    HC.run.kills++;
    if (e.zone === 'boss-add' && G.boss) G.boss.adds = Math.max(0, G.boss.adds - 1);
    if (e.zone === 'grave' && !G.flags.graveCleared && zoneClear('grave')) {
      G.flags.graveCleared = true;
      setTimeout0(function () { G.event('graveCleared'); });
    }
    if (e.zone === 'z0' && !G.flags.z0Cleared && zoneClear('z0')) {
      setTimeout0(function () { G.event('z0Cleared'); });
    }
    if (e.zone === 'rescue' && !G.flags.rescueDone && zoneClear('rescue')) {
      setTimeout0(function () { G.rescueComplete(); });
    }
  };

  G.rescueComplete = function () {
    G.flags.rescueDone = true;
    var who = G.flags.choiceMade;
    if (who === 'bram') {
      G.flags.bramSaved = true;
      G.player.guardDur = 1.1;
      G.player.guardFactor = 0.15;
    } else {
      G.flags.lysaSaved = true;
      G.player.maxFlasks = 4;
      G.player.flaskHeal = 60;
      G.player.flasks = Math.min(G.player.flasks + 1, G.player.maxFlasks);
    }
    refreshDoorPrompts();
    HC.dialogue.start(who === 'bram' ? 'savedBram' : 'savedLysa', function () {
      G.refreshQuest();
      HC.toast(who === 'bram' ? 'BRAM HEADS FOR CANDLEFALL' : 'LYSA HEADS FOR CANDLEFALL');
      G.saveGame();
    });
  };

  function refreshDoorPrompts() {
    var F = G.flags;
    for (var i = 0; i < G.ents.length; i++) {
      var e = G.ents[i];
      if (e.kind === 'bramDoor')
        e.prompt = F.choiceMade ? (F.choiceMade === 'bram' ? (F.rescueDone ? 'EMPTY WORKSHOP' : 'BRAM') : 'THE HAMMERING HAS STOPPED') : 'ANSWER THE HAMMERING';
      if (e.kind === 'lysaDoor')
        e.prompt = F.choiceMade ? (F.choiceMade === 'lysa' ? (F.rescueDone ? 'EMPTY CELLAR' : 'LYSA') : 'THE CELLAR IS SILENT') : 'ANSWER THE VOICE BELOW';
    }
  }

  var delayedCalls = [];
  function setTimeout0(fn) { delayedCalls.push({ t: 0.8, fn: fn }); }

  function zoneClear(zone) {
    for (var i = 0; i < G.ents.length; i++) {
      var e = G.ents[i];
      if (e.isEnemy && e.zone === zone && e.alive && e.hp > 0) return false;
    }
    return true;
  }

  G.onBossDead = function () {
    G.flags.bossDead = true;
    G.boss = null;
    HC.world.setGate('B', true);
    HC.world.setGate('D', true);
    HC.run.checkpoint = { map: 'graveyard', entry: 'arena' };
    HC.audio.setMusic('ambient');
    setTimeout0(function () { G.event('bossDead'); });
  };

  G.onPlayerDeath = function () {
    HC.run.deaths++;
    HC.audio.sfx.playerDeath();
    HC.audio.setMusic('none');
    HC.camera.shake(5, 0.5);
    HC.particles.burst(G.player.x, G.player.y - 6, 30, { color: '#f2a13c', spMin: 20, spMax: 100, lifeMax: 1 });
    G.deathT = 0;
    G.state = 'dead';
  };

  G.dropSouls = function (x, y, total) {
    var n = HC.clamp(Math.round(total / 12), 2, 6);
    var per = Math.round(total / n);
    for (var i = 0; i < n; i++) G.ents.push(HC.makeSoulFly(x + HC.rand(-6, 6), y + HC.rand(-10, 2), per));
  };

  G.addEnt = function (e) { G.ents.push(e); };

  HC.toast = function (text) {
    HC.floaters.add(HC.camera.x + HC.VIEW_W / 2, HC.camera.y + HC.VIEW_H - 40, text, '#c9bfa4');
  };

  // ---------- interactables ----------
  function nearestInteract() {
    var best = null, bd = 1e9;
    for (var i = 0; i < G.ents.length; i++) {
      var e = G.ents[i];
      if (!e.isInteract) continue;
      var d = HC.dist(G.player.x, G.player.y, e.x, e.y);
      if (d < (e.radius || 16) && d < bd) { bd = d; best = e; }
    }
    return best;
  }

  function useInteract(it) {
    var F = G.flags;
    if (it.kind === 'sword') {
      HC.audio.sfx.interact();
      it.alive = false;
      G.event('swordTaken');
    } else if (it.kind === 'brazier') {
      if (!F.brazierLit) { HC.audio.sfx.interact(); G.event('brazierLit'); it.prompt = 'REST BY THE FLAME'; }
      else if (F.hasOil && !F.q1Done) { G.event('q1Return'); it.prompt = 'REST BY THE FLAME'; }
      else {
        HC.audio.sfx.heal();
        G.player.hp = G.player.maxHp();
        G.player.flasks = G.player.maxFlasks;
        G.player.st = G.player.maxSt();
        HC.floaters.add(G.player.x, G.player.y - 16, 'YOU REST BY THE FLAME', '#ffd47a');
        HC.particles.burst(G.player.x, G.player.y - 6, 12, { color: '#ffd47a', spMin: 10, spMax: 40, lifeMax: 0.7, glow: 1 });
        G.saveGame();
      }
    } else if (it.kind === 'shrine') {
      HC.audio.sfx.interact();
      if (!F.shrineSeen) {
        F.shrineSeen = true;
        HC.dialogue.start('shrineFirst', function () { G.state = 'upgrade'; G.upgSel = 0; });
      } else { G.state = 'upgrade'; G.upgSel = 0; }
    } else if (it.kind === 'survivor') {
      HC.audio.sfx.interact();
      if (F.q1Done) HC.dialogue.start('coleAfterQ1');
      else if (F.brazierLit && !F.q1Started) {
        F.q1Started = true;
        HC.dialogue.start('q1Offer', function () { G.refreshQuest(); G.saveGame(); });
      } else if (F.q1Started) HC.dialogue.start('coleWaitingQ1');
      else if (!F.metCole) {
        F.metCole = true;
        HC.dialogue.start('survivor', function () { G.refreshQuest(); });
      } else HC.dialogue.start('survivorWaiting');
    } else if (it.kind === 'oil') {
      HC.audio.sfx.soul();
      it.alive = false;
      F.hasOil = true;
      HC.particles.burst(it.x, it.y - 4, 12, { color: '#ffd47a', spMin: 10, spMax: 50, lifeMax: 0.7, glow: 1 });
      HC.dialogue.start('oilTaken', function () { G.refreshQuest(); G.saveGame(); });
    } else if (it.kind === 'bramDoor' || it.kind === 'lysaDoor') {
      var mine = (it.kind === 'bramDoor') ? 'bram' : 'lysa';
      if (!F.choiceMade) {
        HC.audio.sfx.interact();
        F.choiceMade = mine;
        HC.camera.shake(2, 0.3);
        refreshDoorPrompts();
        HC.dialogue.start(mine === 'bram' ? 'rescueStartBram' : 'rescueStartLysa', function () {
          spawnRescueWave(mine, false);
          G.refreshQuest();
          G.saveGame();
        });
      } else if (F.choiceMade === mine && !F.rescueDone) {
        HC.dialogue.start(mine === 'bram' ? 'rescueStartBram' : 'rescueStartLysa');
      } else if (F.choiceMade !== mine && !F.lostSeen) {
        HC.audio.sfx.interact();
        F.lostSeen = true;
        HC.dialogue.start(mine === 'bram' ? 'lostBram' : 'lostLysa');
      }
    } else if (it.kind === 'bram') {
      HC.audio.sfx.interact();
      HC.dialogue.start('bramHub');
    } else if (it.kind === 'lysa') {
      HC.audio.sfx.interact();
      HC.dialogue.start('lysaHub');
    }
  }

  // ---------- upgrade shrine ----------
  var UPG = [
    { key: 'hp', name: 'HEALTH', desc: '+22 MAX HP' },
    { key: 'st', name: 'STAMINA', desc: '+14 MAX STAMINA' },
    { key: 'str', name: 'STRENGTH', desc: '+16 PERCENT SWORD DAMAGE' }
  ];
  function upgCost(key) { return 40 + HC.run.stats[key] * 35; }

  function updateUpgrade() {
    if (HC.input.hit('up')) { G.upgSel = (G.upgSel + UPG.length - 1) % UPG.length; HC.audio.sfx.ui(); }
    if (HC.input.hit('down')) { G.upgSel = (G.upgSel + 1) % UPG.length; HC.audio.sfx.ui(); }
    if (HC.input.hit('attack') || HC.input.hit('interact')) {
      var u = UPG[G.upgSel], cost = upgCost(u.key);
      if (HC.run.souls >= cost) {
        HC.run.souls -= cost;
        HC.run.stats[u.key]++;
        if (u.key === 'hp') G.player.hp = G.player.maxHp();
        if (u.key === 'st') G.player.st = G.player.maxSt();
        HC.audio.sfx.buy();
        HC.particles.burst(G.player.x, G.player.y - 8, 16, { color: '#8fe8ff', spMin: 20, spMax: 70, lifeMax: 0.8 });
      } else HC.audio.sfx.deny();
    }
    if (HC.input.hit('pause') || HC.input.hit('dodge')) { G.state = 'play'; HC.audio.sfx.ui(); }
  }

  function drawUpgrade() {
    var W = HC.VIEW_W, H = HC.VIEW_H;
    ctx.fillStyle = 'rgba(6,8,18,0.8)';
    ctx.fillRect(0, 0, W, H);
    var pw = 240, phh = 130, px = W / 2 - pw / 2, py = H / 2 - phh / 2;
    ctx.fillStyle = 'rgba(16,13,24,0.96)';
    ctx.fillRect(px, py, pw, phh);
    ctx.strokeStyle = '#6e563c'; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, phh - 1);
    HC.font.drawShadow(ctx, 'SHRINE OF REMEMBRANCE', W / 2, py + 8, '#ffd47a', 1, 'center');
    HC.font.draw(ctx, 'REMEMBRANCE: ' + HC.run.souls, W / 2, py + 20, '#8fe8ff', 1, 'center');
    for (var i = 0; i < UPG.length; i++) {
      var u = UPG[i], y = py + 38 + i * 22;
      var sel = i === G.upgSel;
      if (sel) {
        ctx.fillStyle = 'rgba(110,86,60,0.3)';
        ctx.fillRect(px + 8, y - 3, pw - 16, 18);
        HC.font.draw(ctx, '>', px + 12, y + 1, '#ffd47a', 1);
      }
      var cost = upgCost(u.key);
      var afford = HC.run.souls >= cost;
      HC.font.draw(ctx, u.name + ' ' + (HC.run.stats[u.key] > 0 ? '+' + HC.run.stats[u.key] : ''), px + 24, y, sel ? '#e6dfc8' : '#9aa3b2', 1);
      HC.font.draw(ctx, u.desc, px + 24, y + 8, '#6d7484', 1);
      HC.font.draw(ctx, String(cost), px + pw - 14, y + 4, afford ? '#8fe8ff' : '#93262e', 1, 'right');
    }
    HC.font.draw(ctx, 'J : OFFER      ESC : LEAVE', W / 2, py + phh - 12, '#6d7484', 1, 'center');
  }

  // ---------- HUD ----------
  function drawBar(x, y, w, h, frac, fill, back) {
    ctx.fillStyle = '#0a0c18';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = back;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, Math.round(w * HC.clamp(frac, 0, 1)), h);
    ctx.strokeStyle = 'rgba(110,86,60,0.7)';
    ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
  }

  function drawHUD() {
    var p = G.player;
    if (!p) return;
    drawBar(8, 8, 70 + HC.run.stats.hp * 8, 5, p.hp / p.maxHp(), '#a4333b', '#2a1114');
    drawBar(8, 16, 56 + HC.run.stats.st * 6, 4, p.st / p.maxSt(), '#5b7348', '#1a2118');
    // flasks
    for (var i = 0; i < p.maxFlasks; i++) {
      var fx = 9 + i * 8;
      ctx.fillStyle = i < p.flasks ? '#f2a13c' : '#3a3227';
      ctx.fillRect(fx, 24, 5, 6);
      ctx.fillStyle = i < p.flasks ? '#ffd47a' : '#2c2618';
      ctx.fillRect(fx + 1, 25, 2, 2);
      ctx.strokeStyle = '#0a0c18';
      ctx.strokeRect(fx - 0.5, 23.5, 6, 7);
    }
    // souls
    ctx.fillStyle = '#8fe8ff';
    ctx.fillRect(10, HC.VIEW_H - 14, 3, 3);
    ctx.fillStyle = 'rgba(143,232,255,0.4)';
    ctx.fillRect(9, HC.VIEW_H - 15, 5, 5);
    HC.font.drawShadow(ctx, String(HC.run.souls), 18, HC.VIEW_H - 16, '#8fe8ff', 1);

    HC.quest.draw(ctx);

    // boss bar
    if (G.boss && G.boss.state !== 'dormant' && G.boss.hp > 0) {
      var bw = 200, bx = HC.VIEW_W / 2 - bw / 2, by = HC.VIEW_H - 26;
      HC.font.drawShadow(ctx, G.boss.name, HC.VIEW_W / 2, by - 10, '#e6dfc8', 1, 'center');
      drawBar(bx, by, bw, 5, G.boss.hp / G.boss.maxHp, '#a4333b', '#211016');
      ctx.fillStyle = '#d8b455';
      ctx.fillRect(bx - 3, by - 1, 2, 7);
      ctx.fillRect(bx + bw + 1, by - 1, 2, 7);
    }

    // interact prompt
    if (G.state === 'play' && !HC.dialogue.active) {
      var it = nearestInteract();
      if (it) {
        var sx = Math.round(it.x - HC.camera.ox()), sy = Math.round(it.y - HC.camera.oy() - 24);
        HC.font.drawShadow(ctx, '(E) ' + it.prompt, sx, sy, '#ffd47a', 1, 'center');
      }
    }

    // low hp vignette
    if (p.hp / p.maxHp() < 0.3 && !p.dead) {
      var pulse = 0.12 + 0.08 * Math.sin(HC.world.time * 5);
      ctx.fillStyle = 'rgba(147,38,46,' + pulse + ')';
      ctx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    }

    // map banner
    if (G.mapBannerT > 0 && HC.world.map) {
      var a = HC.clamp(Math.min(G.mapBannerT, 3 - G.mapBannerT) * 1.5, 0, 1);
      ctx.globalAlpha = a;
      HC.font.drawShadow(ctx, HC.world.map.name, HC.VIEW_W / 2, 60, '#e6dfc8', 2, 'center');
      ctx.fillStyle = '#6e563c';
      ctx.fillRect(HC.VIEW_W / 2 - 60, 78, 120, 1);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- screens ----------
  G.titleSel = 0;
  G.titleOpts = function () { return hasSave() ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME']; };

  var titleParallax = null;
  function drawTitle() {
    var t = G.titleT;
    // deep gradient sky
    var sky = ctx.createLinearGradient(0, 0, 0, HC.VIEW_H);
    sky.addColorStop(0, '#0b0e1e');
    sky.addColorStop(0.55, '#0a0c18');
    sky.addColorStop(1, '#08060c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);

    // distant capital silhouette on the horizon (Solmire)
    ctx.fillStyle = '#0c1020';
    var hy = 150;
    ctx.fillRect(0, hy, HC.VIEW_W, HC.VIEW_H - hy);
    ctx.fillStyle = '#0e1226';
    for (var s = 0; s < 14; s++) {
      var sx = (s * 33 + 10) % HC.VIEW_W;
      var sh = 14 + ((s * 7919) % 22);
      ctx.fillRect(sx, hy - sh, 20, sh);
      // tiny crown spire towers
      if (s % 3 === 0) ctx.fillRect(sx + 8, hy - sh - 8, 4, 8);
    }
    // faint gold cathedral glow at center horizon
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var hg = ctx.createRadialGradient(HC.VIEW_W / 2, hy, 4, HC.VIEW_W / 2, hy, 90);
    hg.addColorStop(0, 'rgba(180,120,50,0.20)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(HC.VIEW_W / 2 - 90, hy - 90, 180, 100);
    ctx.restore();

    HC.world.drawWeather(ctx, 0, 0, 1 / 60);

    var cw = HC.sprites.crown;
    ctx.imageSmoothingEnabled = false;
    var bob = Math.sin(t * 1.2) * 3;

    // crown halo
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = 'lighter';
    var grd = ctx.createRadialGradient(HC.VIEW_W / 2, 66 + bob, 2, HC.VIEW_W / 2, 66 + bob, 66);
    grd.addColorStop(0, 'rgba(216,180,85,0.4)');
    grd.addColorStop(0.5, 'rgba(180,90,60,0.14)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(HC.VIEW_W / 2 - 66, 0 + bob, 132, 132);
    ctx.restore();

    // crown with drifting embers rising from it
    if (Math.random() < 0.4)
      HC.particles.spawn({ x: HC.VIEW_W / 2 + HC.rand(-24, 24), y: 60 + bob, vx: HC.rand(-4, 4), vy: HC.rand(-14, -5), life: 1.4, color: Math.random() < 0.5 ? '#f2a13c' : '#ffd47a', size: 1 });
    HC.particles.update(1 / 60);
    HC.particles.draw(ctx, 0, 0);

    ctx.drawImage(cw, 0, 0, cw.width, cw.height, Math.round(HC.VIEW_W / 2 - cw.width * 1.5), Math.round(30 + bob), cw.width * 3, cw.height * 3);

    HC.font.drawShadow(ctx, 'THE HOLLOW CROWN', HC.VIEW_W / 2, 84, '#e6dfc8', 2, 'center');
    // subtitle underline flourish
    ctx.fillStyle = '#6e563c';
    ctx.fillRect(HC.VIEW_W / 2 - 96, 104, 192, 1);
    ctx.fillStyle = '#93262e';
    ctx.fillRect(HC.VIEW_W / 2 - 3, 103, 6, 3);
    HC.font.draw(ctx, 'PROLOGUE : THE GRAVE WAKES', HC.VIEW_W / 2, 110, '#c9975a', 1, 'center');

    // menu
    var opts = G.titleOpts();
    if (G.titleSel >= opts.length) G.titleSel = 0;
    var my = 134;
    for (var i = 0; i < opts.length; i++) {
      var sel = i === G.titleSel;
      var yy = my + i * 16;
      if (sel) {
        var pulse = 0.5 + 0.5 * Math.sin(t * 5);
        ctx.fillStyle = 'rgba(110,86,60,' + (0.2 + pulse * 0.15) + ')';
        ctx.fillRect(HC.VIEW_W / 2 - 60, yy - 3, 120, 13);
        HC.font.draw(ctx, '>', HC.VIEW_W / 2 - 52, yy, '#ffd47a', 1);
        HC.font.draw(ctx, '<', HC.VIEW_W / 2 + 47, yy, '#ffd47a', 1);
      }
      HC.font.drawShadow(ctx, opts[i], HC.VIEW_W / 2, yy, sel ? '#ffd47a' : '#6d7484', 1, 'center');
    }

    HC.font.draw(ctx, 'WASD MOVE   J ATTACK   SPACE DODGE   L GUARD   F EMBER   E INTERACT', HC.VIEW_W / 2, 196, '#3f4658', 1, 'center');
    HC.font.draw(ctx, 'CLASS : ASH KNIGHT   -   ARROW KEYS TO CHOOSE', HC.VIEW_W / 2, 208, '#3f4658', 1, 'center');
    HC.world.drawVignette(ctx);
  }

  function drawDead() {
    G.deathT += 1 / 60;
    ctx.fillStyle = 'rgba(10,6,10,' + HC.clamp(G.deathT * 1.2, 0, 0.88) + ')';
    ctx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    if (G.deathT > 0.8) {
      HC.font.drawShadow(ctx, 'THE LANTERN PULLS YOU BACK', HC.VIEW_W / 2, HC.VIEW_H / 2 - 10, '#c04a50', 1, 'center');
      if (G.deathT > 1.6 && Math.floor(G.deathT * 2) % 2 === 0)
        HC.font.draw(ctx, 'PRESS ANY KEY', HC.VIEW_W / 2, HC.VIEW_H / 2 + 14, '#9aa3b2', 1, 'center');
    }
    if (G.deathT > 1.6 && HC.input.hit('any')) {
      G.loadMap(HC.run.checkpoint.map, HC.run.checkpoint.entry);
      G.state = 'play';
      G.fade = 1; G.fadeDir = -1;
    }
  }

  function drawEnd() {
    var info = G.endInfo || { title: 'CHAPTER COMPLETE', sub: '', stats: '', lines: [] };
    ctx.fillStyle = 'rgba(6,8,18,0.85)';
    ctx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    var pw = 300, phh = 158, px = HC.VIEW_W / 2 - pw / 2, py = HC.VIEW_H / 2 - phh / 2;
    // panel with warm inner glow
    ctx.fillStyle = 'rgba(14,12,22,0.97)';
    ctx.fillRect(px, py, pw, phh);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var g2 = ctx.createRadialGradient(HC.VIEW_W / 2, py + 30, 4, HC.VIEW_W / 2, py + 30, 70);
    g2.addColorStop(0, 'rgba(216,180,85,0.12)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(px, py, pw, phh);
    ctx.restore();
    ctx.strokeStyle = '#6e563c'; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, phh - 1);
    ctx.strokeStyle = 'rgba(110,86,60,0.4)'; ctx.strokeRect(px + 2.5, py + 2.5, pw - 5, phh - 5);
    var cw = HC.sprites.crown;
    ctx.drawImage(cw, px + pw / 2 - cw.width / 2, py + 8);
    HC.font.drawShadow(ctx, info.title, HC.VIEW_W / 2, py + 28, '#ffd47a', 1, 'center');
    HC.font.draw(ctx, info.sub, HC.VIEW_W / 2, py + 42, '#e6dfc8', 1, 'center');
    ctx.fillStyle = '#6e563c';
    ctx.fillRect(HC.VIEW_W / 2 - 70, py + 54, 140, 1);
    HC.font.draw(ctx, info.stats, HC.VIEW_W / 2, py + 62, '#8fe8ff', 1, 'center');
    for (var i = 0; i < info.lines.length; i++)
      HC.font.draw(ctx, info.lines[i], HC.VIEW_W / 2, py + 82 + i * 12, '#8a9078', 1, 'center');
    if (Math.floor(HC.world.time * 1.6) % 2 === 0)
      HC.font.draw(ctx, 'PRESS ANY KEY TO CONTINUE', HC.VIEW_W / 2, py + phh - 14, '#e6dfc8', 1, 'center');
  }

  function drawPause() {
    ctx.fillStyle = 'rgba(6,8,18,0.75)';
    ctx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    HC.font.drawShadow(ctx, 'PAUSED', HC.VIEW_W / 2, 70, '#e6dfc8', 2, 'center');
    var lines = [
      'WASD / ARROWS : MOVE',
      'J / X : ATTACK (CHAIN 3 HITS)',
      'SPACE / K : DODGE ROLL (I-FRAMES)',
      'L / SHIFT : ASH GUARD (75 PERCENT REDUCTION)',
      'F : DRINK EMBER FLASK',
      'E : INTERACT',
      'ESC : RESUME'
    ];
    for (var i = 0; i < lines.length; i++)
      HC.font.draw(ctx, lines[i], HC.VIEW_W / 2, 100 + i * 12, '#9aa3b2', 1, 'center');
  }

  // ---------- world rendering ----------
  function renderWorld() {
    var cx = HC.camera.ox(), cy = HC.camera.oy();
    HC.world.drawGround(ctx, cx, cy);

    var ysorted = [];
    HC.world.collectDrawables(ctx, cx, cy, ysorted);
    for (var i = 0; i < G.ents.length; i++) {
      var e = G.ents[i];
      if (!e.alive) continue;
      (function (e) {
        ysorted.push({ base: e.base ? e.base() : e.y, draw: function (c2) { e.draw(c2, cx, cy); } });
      })(e);
    }
    if (G.player && !G.player.dead)
      ysorted.push({ base: G.player.base(), draw: function (c2) { G.player.draw(c2, cx, cy); } });
    ysorted.sort(function (a, b) { return a.base - b.base; });
    for (var j = 0; j < ysorted.length; j++) ysorted[j].draw(ctx);

    HC.particles.draw(ctx, cx, cy);
    HC.world.drawAtmosphere(ctx, cx, cy, 1 / 60);

    // lights
    var lights = [];
    if (G.player && !G.player.dead) lights = lights.concat(G.player.lights());
    for (var k = 0; k < G.ents.length; k++) {
      var le = G.ents[k];
      if (le.alive && le.lights) lights = lights.concat(le.lights());
    }
    HC.world.drawLighting(ctx, cx, cy, lights);
    HC.world.drawWeather(ctx, cx, cy, 1 / 60);
    HC.floaters.draw(ctx, cx, cy);
    HC.world.drawVignette(ctx);
  }

  // ---------- update ----------
  function update(dt) {
    HC.audio.update();
    if (G.state === 'title') {
      G.titleT += dt;
      var opts = G.titleOpts();
      if (HC.input.hit('up')) { G.titleSel = (G.titleSel + opts.length - 1) % opts.length; HC.audio.sfx.ui(); }
      if (HC.input.hit('down')) { G.titleSel = (G.titleSel + 1) % opts.length; HC.audio.sfx.ui(); }
      if (HC.input.hit('attack') || HC.input.hit('interact') || HC.input.hit('dodge')) {
        HC.audio.ensure();
        var choice = opts[G.titleSel];
        if (choice === 'CONTINUE' && loadSave()) {
          G.loadMap(HC.run.checkpoint.map, HC.run.checkpoint.entry);
        } else {
          clearSave();
          newRun();
          G.loadMap('graveyard', 'start');
          if (HC.DEBUG) HC.run.souls = 300;
        }
        G.state = 'play';
        G.fade = 1; G.fadeDir = -1;
        HC.audio.sfx.interact();
      }
      return;
    }
    if (G.state === 'dead') { HC.particles.update(dt); HC.camera.update(dt); return; }
    if (G.state === 'pause') {
      if (HC.input.hit('pause')) G.state = 'play';
      return;
    }
    if (G.state === 'upgrade') { updateUpgrade(); return; }
    if (G.state === 'end') {
      HC.world.update(dt);
      HC.particles.update(dt);
      G.endT = (G.endT || 0) + dt;
      if (G.endT > 0.6 && HC.input.hit('any')) { G.endT = 0; G.state = 'play'; }
      return;
    }

    // play / dialogue
    if (G.hitstop > 0) { G.hitstop -= dt; return; }

    HC.run.time += dt;
    G.mapBannerT = Math.max(0, G.mapBannerT - dt);
    HC.world.update(dt);
    HC.quest.update(dt);

    for (var dc = delayedCalls.length - 1; dc >= 0; dc--) {
      delayedCalls[dc].t -= dt;
      if (delayedCalls[dc].t <= 0) { var fn = delayedCalls[dc].fn; delayedCalls.splice(dc, 1); fn(); }
    }

    if (HC.dialogue.active) {
      HC.dialogue.update(dt);
      G.vela.update(dt);
      HC.particles.update(dt);
      HC.floaters.update(dt);
      HC.camera.follow(G.player.x, G.player.y);
      HC.camera.update(dt);
      return;
    }

    if (HC.input.hit('pause')) { G.state = 'pause'; return; }

    if (HC.DEBUG) {
      if (HC.input.code('Digit1')) { var e1 = HC.world.map.entries.gateA; G.player.x = e1.x * 16; G.player.y = e1.y * 16; }
      if (HC.input.code('Digit2')) { var e2 = HC.world.map.entries.arena; if (e2) { G.player.x = e2.x * 16; G.player.y = e2.y * 16; } }
      if (HC.input.code('Digit3')) { G.pendingMap = { map: 'chapel', entry: 'fromGraveyard' }; }
      if (HC.input.code('KeyG')) { G.player.hp = G.player.maxHp(); HC.run.souls += 200; }
    }

    G.player.update(dt);
    for (var i = G.ents.length - 1; i >= 0; i--) {
      var e = G.ents[i];
      if (!e.alive) { G.ents.splice(i, 1); continue; }
      e.update(dt);
    }
    HC.particles.update(dt);
    HC.floaters.update(dt);

    // interact
    if (HC.input.hit('interact')) {
      var it = nearestInteract();
      if (it) useInteract(it);
    }

    // triggers
    var trs = HC.world.triggers;
    for (var t = 0; t < trs.length; t++) {
      var tr = trs[t];
      if (tr.fired && tr.once) continue;
      var p = G.player;
      if (p.x >= tr.x0 && p.x < tr.x1 && p.y >= tr.y0 && p.y < tr.y1) {
        if (!tr.once || !tr.fired) {
          tr.fired = true;
          G.event(tr.event);
        }
      }
    }

    // map transition
    if (G.pendingMap) {
      var pm = G.pendingMap; G.pendingMap = null;
      G.fade = 1; G.fadeDir = -1;
      G.loadMap(pm.map, pm.entry);
    }

    HC.camera.follow(G.player.x, G.player.y);
    HC.camera.update(dt);
  }

  // ---------- render ----------
  function render() {
    ctx.imageSmoothingEnabled = false;
    if (G.state === 'title') { drawTitle(); HC.input.endFrame(); return; }
    renderWorld();
    drawHUD();
    if (HC.dialogue.active) HC.dialogue.draw(ctx);
    if (G.state === 'upgrade') drawUpgrade();
    if (G.state === 'dead') drawDead();
    if (G.state === 'end') drawEnd();
    if (G.state === 'pause') drawPause();
    if (G.fade > 0) {
      G.fade = HC.clamp(G.fade + G.fadeDir * 0.02, 0, 1);
      ctx.fillStyle = 'rgba(5,6,14,' + G.fade + ')';
      ctx.fillRect(0, 0, HC.VIEW_W, HC.VIEW_H);
    }
    HC.input.endFrame();
  }

  // ---------- boot ----------
  G.init = function () {
    canvas = document.getElementById('game');
    canvas.width = HC.VIEW_W;
    canvas.height = HC.VIEW_H;
    ctx = canvas.getContext('2d');

    function resize() {
      var scale = Math.min(window.innerWidth / HC.VIEW_W, window.innerHeight / HC.VIEW_H);
      if (scale > 2) scale = Math.floor(scale);
      canvas.style.width = Math.round(HC.VIEW_W * scale) + 'px';
      canvas.style.height = Math.round(HC.VIEW_H * scale) + 'px';
    }
    window.addEventListener('resize', resize);
    resize();

    var last = performance.now(), acc = 0, STEP = 1 / 60;
    function frame(now) {
      var dtReal = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dtReal;
      var n = 0;
      while (acc >= STEP && n < 4) { update(STEP); acc -= STEP; n++; }
      render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  return G;
})();

window.addEventListener('load', function () { HC.game.init(); });
