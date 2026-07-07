// The Hollow Crown — entities: player, Vela, enemy AI, the Gravekeeper, projectiles, pickups, NPCs
'use strict';

// ---------- enemy design table: add a row here to add an enemy family ----------
HC.ENEMY_DEFS = {
  hollow: {
    name: 'Hollow Villager', hp: 34, spd: 26, dmg: 14, r: 5, aggro: 85, souls: 15,
    windup: 0.5, lungeSpd: 130, lungeT: 0.26, recover: 0.7, atkRange: 20
  },
  dog: {
    name: 'Grave Dog', hp: 26, spd: 56, dmg: 10, r: 5, aggro: 115, souls: 12,
    windup: 0.35, lungeSpd: 210, lungeT: 0.3, recover: 0.85, atkRange: 60, circles: true
  },
  archer: {
    name: 'Corpse Archer', hp: 30, spd: 30, dmg: 12, r: 5, aggro: 140, souls: 18,
    windup: 0.65, recover: 1.6, ranged: true, keepMin: 70, keepMax: 120
  }
};

// ---------- player ----------
HC.makePlayer = function (x, y) {
  var P = {
    kind: 'player', x: x, y: y, r: 5,
    face: 'down', fx: 0, fy: 1,
    hp: 100, st: 100,
    walkT: 0, moving: false,
    atk: null, combo: 0, comboWindow: 0,
    roll: 0, rollDx: 0, rollDy: 0,
    guard: 0, guardCd: 0,
    drink: 0, flasks: 3, maxFlasks: 3,
    iframes: 0, flash: 0,
    kx: 0, ky: 0,
    hasSword: false,
    dead: false,
    alive: true
  };

  P.maxHp = function () { return 100 + HC.run.stats.hp * 22; };
  P.maxSt = function () { return 100 + HC.run.stats.st * 14; };
  P.dmgMult = function () { return Math.pow(1.16, HC.run.stats.str); };
  P.hp = P.maxHp();
  P.st = P.maxSt();

  P.update = function (dt) {
    if (P.dead) return;
    var inp = HC.input;
    P.iframes = Math.max(0, P.iframes - dt);
    P.flash = Math.max(0, P.flash - dt);
    P.guardCd = Math.max(0, P.guardCd - dt);
    P.comboWindow = Math.max(0, P.comboWindow - dt);
    P.kx *= Math.pow(0.002, dt); P.ky *= Math.pow(0.002, dt);

    var busy = !!P.atk || P.roll > 0 || P.drink > 0;

    // stamina regen
    P.stDelay = Math.max(0, (P.stDelay || 0) - dt);
    if (P.stDelay <= 0 && P.guard <= 0) P.st = Math.min(P.maxSt(), P.st + 42 * dt);

    // guard
    if (P.guard > 0) {
      P.guard -= dt;
      if (P.guard <= 0) P.guardCd = 2.2;
    } else if (inp.hit('guard') && !busy && P.guardCd <= 0 && P.st >= 15 && P.hasSword) {
      P.guard = 0.8;
      P.st -= 15; P.stDelay = 0.4;
      HC.audio.sfx.guard();
      HC.particles.burst(P.x, P.y, 10, { color: '#9aa3b2', spMin: 20, spMax: 50, lifeMax: 0.4 });
    }

    // movement input
    var mx = (inp.held('right') ? 1 : 0) - (inp.held('left') ? 1 : 0);
    var my = (inp.held('down') ? 1 : 0) - (inp.held('up') ? 1 : 0);
    var mlen = Math.sqrt(mx * mx + my * my);
    if (mlen > 0) { mx /= mlen; my /= mlen; }

    if (P.roll > 0) {
      P.roll -= dt;
      HC.world.moveEnt(P, P.rollDx * 175 * dt, P.rollDy * 175 * dt);
      if (Math.random() < 0.6) HC.particles.spawn({ x: P.x, y: P.y + 6, vx: -P.rollDx * 20, vy: -P.rollDy * 20, life: 0.3, color: '#3c4460', size: 2 });
    } else if (P.atk) {
      var a = P.atk;
      a.t += dt;
      if (a.phase === 'windup' && a.t >= a.windup) { a.phase = 'active'; a.t = 0; P.swing(a); }
      else if (a.phase === 'active') {
        HC.world.moveEnt(P, P.fx * a.lunge * dt, P.fy * a.lunge * dt);
        if (a.t >= 0.12) { a.phase = 'recover'; a.t = 0; }
      } else if (a.phase === 'recover') {
        if (a.t >= a.recover) { P.atk = null; P.comboWindow = 0.5; }
      }
    } else if (P.drink > 0) {
      P.drink -= dt;
      HC.world.moveEnt(P, mx * 22 * dt, my * 22 * dt);
      if (P.drink <= 0) {
        P.hp = Math.min(P.maxHp(), P.hp + 45);
        HC.audio.sfx.heal();
        HC.floaters.add(P.x, P.y - 14, '+45', '#7fe08a');
        HC.particles.burst(P.x, P.y, 14, { color: '#ffd47a', spMin: 10, spMax: 40, lifeMax: 0.7, glow: 1 });
      }
    } else {
      var spd = P.guard > 0 ? 34 : 66;
      P.moving = mlen > 0;
      if (P.moving) {
        HC.world.moveEnt(P, mx * spd * dt, my * spd * dt);
        P.walkT += dt;
        if (Math.abs(mx) > Math.abs(my)) { P.face = mx > 0 ? 'right' : 'left'; }
        else if (my !== 0) { P.face = my > 0 ? 'down' : 'up'; }
        P.fx = mx; P.fy = my;
        if (mlen === 0) { P.fx = 0; P.fy = 1; }
      }

      // actions
      if (inp.hit('attack') && P.hasSword && P.st >= 16) {
        var step = P.comboWindow > 0 ? (P.combo + 1) % 3 : 0;
        P.combo = step;
        P.st -= 16; P.stDelay = 0.45;
        P.atk = {
          phase: 'windup', t: 0, step: step,
          windup: step === 2 ? 0.14 : 0.08,
          recover: step === 2 ? 0.26 : 0.16,
          lunge: step === 2 ? 95 : 40,
          dmg: (step === 2 ? 24 : 14) * P.dmgMult(),
          range: step === 2 ? 26 : 22,
          span: step === 2 ? 2.9 : 2.4
        };
      } else if (inp.hit('dodge') && P.st >= 22) {
        P.roll = 0.32;
        P.iframes = Math.max(P.iframes, 0.3);
        P.st -= 22; P.stDelay = 0.5;
        P.rollDx = mlen > 0 ? mx : P.fx;
        P.rollDy = mlen > 0 ? my : P.fy;
        if (P.rollDx === 0 && P.rollDy === 0) { P.rollDy = 1; }
        HC.audio.sfx.dodge();
      } else if (inp.hit('flask')) {
        if (P.flasks > 0 && P.hp < P.maxHp()) {
          P.flasks--; P.drink = 0.7;
          HC.audio.sfx.interact();
        } else {
          HC.audio.sfx.deny();
          HC.floaters.add(P.x, P.y - 14, P.flasks <= 0 ? 'NO EMBERS' : 'FULL', '#9aa3b2');
        }
      }
    }

    // knockback drift
    HC.world.moveEnt(P, P.kx * dt, P.ky * dt);
  };

  P.swing = function (a) {
    HC.audio.sfx.swing();
    var ang = Math.atan2(P.fy, P.fx);
    if (P.fx === 0 && P.fy === 0) ang = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 }[P.face];
    a.ang = ang;
    var hitAny = false;
    var ents = HC.game.ents;
    for (var i = 0; i < ents.length; i++) {
      var e = ents[i];
      if (!e.isEnemy || e.hp <= 0 || e.rising > 0) continue;
      var d = HC.dist(P.x, P.y, e.x, e.y);
      if (d > a.range + e.r + 4) continue;
      var da = Math.abs(HC.angDiff(ang, HC.angTo(P.x, P.y, e.x, e.y)));
      if (d > 10 && da > a.span / 2) continue;
      e.hurt(a.dmg, P.x, P.y, a.step === 2);
      hitAny = true;
    }
    if (hitAny) {
      HC.game.hitstop = a.step === 2 ? 0.07 : 0.04;
      HC.camera.shake(a.step === 2 ? 2.5 : 1.2, 0.12);
    }
  };

  P.hurt = function (dmg, sx, sy) {
    if (P.dead || P.iframes > 0) return false;
    var guarded = P.guard > 0;
    var final = Math.round(guarded ? dmg * 0.25 : dmg);
    P.hp -= final;
    P.flash = 0.15;
    P.iframes = 0.75;
    HC.floaters.add(P.x, P.y - 16, final, guarded ? '#9aa3b2' : '#c04a50');
    if (guarded) {
      HC.audio.sfx.guardBlock();
      HC.particles.burst(P.x, P.y, 8, { color: '#9aa3b2', spMin: 30, spMax: 70, lifeMax: 0.3 });
    } else {
      HC.audio.sfx.hurt();
      HC.camera.shake(3, 0.2);
      HC.particles.burst(P.x, P.y, 10, { color: '#93262e', spMin: 20, spMax: 70, lifeMax: 0.5 });
      var ang = HC.angTo(sx, sy, P.x, P.y);
      P.kx += Math.cos(ang) * 90; P.ky += Math.sin(ang) * 90;
    }
    if (P.hp <= 0) { P.hp = 0; P.dead = true; HC.game.onPlayerDeath(); }
    return true;
  };

  P.base = function () { return P.y + 8; };

  P.draw = function (ctx, cx, cy) {
    var S = HC.sprites.player;
    var dir = P.face;
    var frames = S[dir] || S.down;
    var f = P.moving || P.roll > 0 ? (Math.floor(P.walkT * 8) % 2) : 0;
    var img = frames[f];
    var px = Math.round(P.x - cx - img.width / 2);
    var py = Math.round(P.y - cy - img.height + 6);

    // shadow
    ctx.fillStyle = 'rgba(5,7,15,0.45)';
    ctx.fillRect(px + 2, Math.round(P.y - cy + 3), img.width - 4, 3);

    if (P.iframes > 0 && P.roll <= 0 && Math.floor(P.iframes * 18) % 2 === 0 && !P.dead) ctx.globalAlpha = 0.5;
    ctx.drawImage(img, px, py);
    if (P.flash > 0) {
      ctx.globalAlpha = P.flash * 5;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(img, px, py);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;

    // ash guard ring
    if (P.guard > 0) {
      ctx.strokeStyle = 'rgba(154,163,178,' + (0.35 + 0.3 * Math.sin(HC.world.time * 20)) + ')';
      ctx.beginPath();
      ctx.arc(Math.round(P.x - cx), Math.round(P.y - cy - 4), 11, 0, Math.PI * 2);
      ctx.stroke();
    }

    // sword slash
    if (P.atk && P.atk.phase === 'active') {
      var a = P.atk;
      var t = a.t / 0.12;
      ctx.save();
      ctx.translate(Math.round(P.x - cx), Math.round(P.y - cy - 4));
      ctx.rotate(a.ang);
      var rr = a.range;
      var sweep = a.span;
      ctx.strokeStyle = 'rgba(230,223,200,' + (0.9 - t * 0.6) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, rr - 4, -sweep / 2 + sweep * t * 0.4, -sweep / 2 + sweep * (0.4 + t * 0.6));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,212,122,' + (0.5 - t * 0.4) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, rr - 1, -sweep / 2, -sweep / 2 + sweep * t);
      ctx.stroke();
      ctx.restore();
    }

    // drinking glow
    if (P.drink > 0) {
      ctx.fillStyle = 'rgba(255,212,122,0.25)';
      ctx.fillRect(px + 2, py + 4, img.width - 4, img.height - 8);
    }
  };

  P.lights = function () {
    return [{ x: P.x, y: P.y - 5, r: P.hasSword ? 78 : 64, warm: 1, flicker: 1 }];
  };

  return P;
};

// ---------- Vela, the lantern spirit (visual companion) ----------
HC.makeVela = function (player) {
  var V = { kind: 'vela', x: player.x + 10, y: player.y - 16, t: 0, alive: true };
  V.update = function (dt) {
    V.t += dt;
    var tx = player.x + (player.face === 'right' ? -11 : 11);
    var ty = player.y - 16 + Math.sin(V.t * 2.4) * 2.5;
    V.x = HC.lerp(V.x, tx, 1 - Math.pow(0.02, dt));
    V.y = HC.lerp(V.y, ty, 1 - Math.pow(0.02, dt));
    if (Math.random() < dt * 6)
      HC.particles.spawn({ x: V.x, y: V.y + 3, vx: HC.rand(-4, 4), vy: HC.rand(4, 12), life: 0.6, color: '#ffd47a', size: 1 });
  };
  V.base = function () { return V.y + 20; };
  V.draw = function (ctx, cx, cy) {
    var img = HC.sprites.vela[Math.floor(V.t * 3) % 2];
    ctx.drawImage(img, Math.round(V.x - cx - 5), Math.round(V.y - cy - 6));
  };
  V.lights = function () { return [{ x: V.x, y: V.y, r: 30, warm: 1, flicker: 1 }]; };
  return V;
};

// ---------- generic enemy ----------
HC.makeEnemy = function (type, x, y, zone) {
  var def = HC.ENEMY_DEFS[type];
  var E = {
    kind: type, isEnemy: true, zone: zone || null,
    x: x, y: y, r: def.r, hp: def.hp,
    state: 'idle', t: 0, anim: 0,
    flash: 0, kx: 0, ky: 0,
    rising: 0.8, faceLeft: false,
    wanderA: HC.rand(0, Math.PI * 2), wanderT: 0,
    cd: HC.rand(0, 1),
    alive: true
  };

  E.hurt = function (dmg, sx, sy, heavy) {
    if (E.hp <= 0) return;
    E.hp -= dmg;
    E.flash = 0.12;
    if (E.state === 'idle') { E.state = 'aggro'; E.t = 0; }
    var ang = HC.angTo(sx, sy, E.x, E.y);
    var kb = heavy ? 150 : 80;
    E.kx += Math.cos(ang) * kb; E.ky += Math.sin(ang) * kb;
    HC.floaters.add(E.x, E.y - 14, Math.round(dmg), heavy ? '#ffd47a' : '#e6dfc8');
    HC.audio.sfx[heavy ? 'hitCrit' : 'hit']();
    HC.particles.burst(E.x, E.y - 4, heavy ? 12 : 7, { color: type === 'dog' ? '#b0a88f' : '#5f6b52', spMin: 30, spMax: heavy ? 110 : 70, lifeMax: 0.5 });
    if (E.hp <= 0) E.die();
  };

  E.die = function () {
    E.alive = false;
    HC.particles.burst(E.x, E.y - 4, 16, { color: '#5f6b52', spMin: 20, spMax: 90, lifeMax: 0.7 });
    HC.game.dropSouls(E.x, E.y, def.souls);
    if (Math.random() < 0.14) HC.game.addEnt(HC.makePickup('ember', E.x / HC.TILE, E.y / HC.TILE));
    HC.game.onEnemyDead(E);
  };

  E.update = function (dt) {
    var p = HC.game.player;
    E.anim += dt;
    E.flash = Math.max(0, E.flash - dt);
    E.kx *= Math.pow(0.002, dt); E.ky *= Math.pow(0.002, dt);
    HC.world.moveEnt(E, E.kx * dt, E.ky * dt);
    if (E.rising > 0) {
      E.rising -= dt;
      if (Math.random() < 0.5) HC.particles.spawn({ x: E.x + HC.rand(-5, 5), y: E.y + 4, vx: 0, vy: HC.rand(-30, -10), life: 0.4, color: '#2d2317', size: 2 });
      return;
    }
    var d = HC.dist(E.x, E.y, p.x, p.y);
    E.faceLeft = p.x < E.x;
    E.cd = Math.max(0, E.cd - dt);

    // separation from other enemies
    var ents = HC.game.ents;
    for (var i = 0; i < ents.length; i++) {
      var o = ents[i];
      if (o === E || !o.isEnemy || o.hp <= 0) continue;
      var od = HC.dist(E.x, E.y, o.x, o.y);
      if (od < 10 && od > 0.01) {
        var oa = HC.angTo(o.x, o.y, E.x, E.y);
        HC.world.moveEnt(E, Math.cos(oa) * 20 * dt, Math.sin(oa) * 20 * dt);
      }
    }

    switch (E.state) {
      case 'idle':
        E.wanderT -= dt;
        if (E.wanderT <= 0) { E.wanderT = HC.rand(1, 3); E.wanderA = HC.rand(0, Math.PI * 2); }
        HC.world.moveEnt(E, Math.cos(E.wanderA) * def.spd * 0.25 * dt, Math.sin(E.wanderA) * def.spd * 0.25 * dt);
        if (d < def.aggro && !p.dead) { E.state = 'aggro'; E.t = 0; }
        break;
      case 'aggro': {
        if (p.dead) { E.state = 'idle'; break; }
        var toP = HC.angTo(E.x, E.y, p.x, p.y);
        if (def.ranged) {
          if (d < def.keepMin) HC.world.moveEnt(E, -Math.cos(toP) * def.spd * dt, -Math.sin(toP) * def.spd * dt);
          else if (d > def.keepMax) HC.world.moveEnt(E, Math.cos(toP) * def.spd * dt, Math.sin(toP) * def.spd * dt);
          if (E.cd <= 0 && d <= def.aggro + 20) { E.state = 'windup'; E.t = 0; }
        } else if (def.circles && d < def.atkRange + 15 && E.cd > 0) {
          var ca = toP + Math.PI / 2;
          HC.world.moveEnt(E, Math.cos(ca) * def.spd * 0.8 * dt, Math.sin(ca) * def.spd * 0.8 * dt);
        } else {
          HC.world.moveEnt(E, Math.cos(toP) * def.spd * dt, Math.sin(toP) * def.spd * dt);
          if (d < def.atkRange && E.cd <= 0) { E.state = 'windup'; E.t = 0; }
        }
        break;
      }
      case 'windup':
        E.t += dt;
        if (E.t >= def.windup) {
          E.t = 0;
          if (def.ranged) {
            E.state = 'recover';
            var aa = HC.angTo(E.x, E.y, p.x, p.y);
            HC.audio.sfx.arrow();
            HC.game.addEnt(HC.makeArrow(E.x, E.y - 6, Math.cos(aa) * 145, Math.sin(aa) * 145, def.dmg));
          } else {
            E.state = 'lunge';
            var la = HC.angTo(E.x, E.y, p.x, p.y);
            E.lx = Math.cos(la); E.ly = Math.sin(la);
          }
        }
        break;
      case 'lunge':
        E.t += dt;
        HC.world.moveEnt(E, E.lx * def.lungeSpd * dt, E.ly * def.lungeSpd * dt);
        if (HC.dist(E.x, E.y, p.x, p.y) < E.r + p.r + 3) {
          if (p.hurt(def.dmg, E.x, E.y)) { E.state = 'recover'; E.t = 0; }
        }
        if (E.t >= def.lungeT) { E.state = 'recover'; E.t = 0; }
        break;
      case 'recover':
        E.t += dt;
        if (E.t >= def.recover) { E.state = 'aggro'; E.cd = HC.rand(0.4, 1.1); E.t = 0; }
        break;
    }
  };

  E.base = function () { return E.y + 7; };

  E.draw = function (ctx, cx, cy) {
    var frames = type === 'dog' ? (E.faceLeft ? HC.sprites.dogLeft : HC.sprites.dog) : HC.sprites[type === 'hollow' ? 'hollow' : 'archer'];
    var img = frames[Math.floor(E.anim * 5) % 2];
    var px = Math.round(E.x - cx - img.width / 2);
    var py = Math.round(E.y - cy - img.height + 6);
    ctx.fillStyle = 'rgba(5,7,15,0.4)';
    ctx.fillRect(px + 3, Math.round(E.y - cy + 3), img.width - 6, 2);
    if (E.rising > 0) {
      var rt = 1 - E.rising / 0.8;
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py + img.height * (1 - rt), img.width, img.height * rt);
      ctx.clip();
      ctx.drawImage(img, px, py + Math.round(img.height * (1 - rt) * 0.6));
      ctx.restore();
      return;
    }
    if (type !== 'dog' && E.faceLeft) {
      ctx.save(); ctx.translate(px + img.width, py); ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(img, px, py);
    }
    if (E.flash > 0 || E.state === 'windup') {
      ctx.globalAlpha = E.state === 'windup' ? 0.35 + 0.3 * Math.sin(E.anim * 30) : E.flash * 6;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(img, px, py);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  };

  return E;
};

// ---------- The Gravekeeper ----------
HC.makeGravekeeper = function (x, y) {
  var B = {
    kind: 'gravekeeper', isEnemy: true, isBoss: true, zone: 'boss',
    name: 'THE GRAVEKEEPER',
    sub: 'WARDEN OF THE SLEEPLESS EARTH',
    x: x, y: y, r: 10,
    maxHp: 340, hp: 340,
    state: 'dormant', t: 0, anim: 0,
    flash: 0, kx: 0, ky: 0,
    cdSwing: 0, cdSummon: 4, cdBell: 3,
    adds: 0, faceLeft: false, rising: 0,
    alive: true
  };

  B.phase = function () { return B.hp < B.maxHp * 0.35 ? 3 : B.hp < B.maxHp * 0.65 ? 2 : 1; };

  B.hurt = function (dmg, sx, sy, heavy) {
    if (B.hp <= 0 || B.state === 'dormant') return;
    B.hp -= dmg;
    B.flash = 0.1;
    HC.floaters.add(B.x, B.y - 30, Math.round(dmg), heavy ? '#ffd47a' : '#e6dfc8');
    HC.audio.sfx[heavy ? 'hitCrit' : 'hit']();
    HC.particles.burst(B.x, B.y - 10, 8, { color: '#343c63', spMin: 30, spMax: 80, lifeMax: 0.5 });
    if (B.hp <= 0) B.die();
  };

  B.die = function () {
    B.alive = false;
    HC.audio.sfx.bossDeath();
    HC.camera.shake(6, 0.8);
    HC.particles.burst(B.x, B.y - 12, 50, { color: '#8fe8ff', spMin: 20, spMax: 130, lifeMax: 1.2 });
    HC.particles.burst(B.x, B.y - 12, 30, { color: '#f2a13c', spMin: 10, spMax: 90, lifeMax: 1 });
    HC.game.dropSouls(B.x, B.y, 150);
    HC.game.onBossDead();
  };

  B.activate = function () {
    if (B.state === 'dormant') {
      B.state = 'intro'; B.t = 0;
      HC.audio.sfx.roar();
    }
  };

  B.update = function (dt) {
    var p = HC.game.player;
    B.anim += dt;
    B.flash = Math.max(0, B.flash - dt);
    B.kx *= Math.pow(0.002, dt); B.ky *= Math.pow(0.002, dt);
    if (B.state === 'dormant') return;
    var ph = B.phase();
    var d = HC.dist(B.x, B.y, p.x, p.y);
    B.faceLeft = p.x < B.x;
    B.cdSwing = Math.max(0, B.cdSwing - dt);
    B.cdSummon = Math.max(0, B.cdSummon - dt);
    B.cdBell = Math.max(0, B.cdBell - dt);

    switch (B.state) {
      case 'intro':
        B.t += dt;
        HC.camera.shake(1.5, 0.1);
        if (Math.random() < 0.4) HC.particles.spawn({ x: B.x + HC.rand(-14, 14), y: B.y + 4, vx: 0, vy: HC.rand(-40, -10), life: 0.5, color: '#2d2317', size: 2 });
        if (B.t > 1.4) { B.state = 'walk'; B.t = 0; }
        break;
      case 'walk': {
        if (p.dead) break;
        var spd = ph === 3 ? 34 : ph === 2 ? 26 : 21;
        var a = HC.angTo(B.x, B.y, p.x, p.y);
        HC.world.moveEnt(B, Math.cos(a) * spd * dt, Math.sin(a) * spd * dt);
        if (d < 44 && B.cdSwing <= 0) { B.state = 'windupSwing'; B.t = 0; }
        else if (ph >= 2 && B.cdBell <= 0 && d < 130) { B.state = 'windupBell'; B.t = 0; }
        else if (B.cdSummon <= 0 && B.adds < (ph >= 3 ? 3 : 2)) { B.state = 'windupSummon'; B.t = 0; }
        break;
      }
      case 'windupSwing':
        B.t += dt;
        if (B.t >= (ph === 3 ? 0.5 : 0.68)) {
          B.t = 0; B.state = 'swing'; B.swung = false;
          B.swingAng = HC.angTo(B.x, B.y, p.x, p.y);
        }
        break;
      case 'swing': {
        B.t += dt;
        HC.world.moveEnt(B, Math.cos(B.swingAng) * 90 * dt, Math.sin(B.swingAng) * 90 * dt);
        if (!B.swung && B.t >= 0.08) {
          B.swung = true;
          HC.audio.sfx.slam();
          HC.camera.shake(3, 0.2);
          var dd = HC.dist(B.x, B.y, p.x, p.y);
          var da = Math.abs(HC.angDiff(B.swingAng, HC.angTo(B.x, B.y, p.x, p.y)));
          if (dd < 42 && (dd < 14 || da < 1.5)) p.hurt(24, B.x, B.y);
          HC.particles.burst(B.x + Math.cos(B.swingAng) * 22, B.y + Math.sin(B.swingAng) * 22, 12, { color: '#37301f', spMin: 30, spMax: 90, lifeMax: 0.5 });
        }
        if (B.t >= 0.3) {
          if (ph === 3 && !B.chained) { B.chained = true; B.state = 'windupSwing'; B.t = 0.3; }
          else { B.chained = false; B.state = 'recover'; B.t = 0; B.cdSwing = 1.2; }
        }
        break;
      }
      case 'windupSummon':
        B.t += dt;
        if (B.t >= 1.0) {
          B.t = 0; B.state = 'recover';
          B.cdSummon = ph >= 3 ? 9 : 12;
          HC.audio.sfx.summon();
          HC.camera.shake(3, 0.3);
          var n = ph >= 3 ? 2 : 2;
          for (var i = 0; i < n; i++) {
            if (B.adds >= (ph >= 3 ? 3 : 2)) break;
            var sx = B.x + HC.rand(-40, 40), sy = B.y + HC.rand(20, 50);
            if (!HC.world.circleFree(sx, sy, 6)) { sx = B.x; sy = B.y + 24; }
            var m = HC.makeEnemy('hollow', sx, sy, 'boss-add');
            m.state = 'aggro';
            HC.game.addEnt(m);
            B.adds++;
            HC.audio.sfx.rise();
          }
          if (d < 34) p.hurt(14, B.x, B.y);
        }
        break;
      case 'windupBell':
        B.t += dt;
        if (B.t >= 0.9) {
          B.t = 0; B.state = 'recover';
          B.cdBell = ph >= 3 ? 5.5 : 7;
          HC.audio.sfx.bell();
          HC.camera.shake(4, 0.4);
          HC.game.addEnt(HC.makeShockwave(B.x, B.y, 18));
        }
        break;
      case 'recover':
        B.t += dt;
        if (B.t >= 0.7) { B.state = 'walk'; B.t = 0; }
        break;
    }
  };

  B.base = function () { return B.y + 10; };

  B.draw = function (ctx, cx, cy) {
    var up = B.state === 'windupSwing' || B.state === 'windupSummon' || B.state === 'windupBell';
    var img = up ? HC.sprites.gravekeeperUp : HC.sprites.gravekeeper[Math.floor(B.anim * 4) % 2];
    var px = Math.round(B.x - cx - img.width / 2);
    var py = Math.round(B.y - cy - img.height + 8);
    ctx.fillStyle = 'rgba(5,7,15,0.5)';
    ctx.fillRect(px + 5, Math.round(B.y - cy + 5), img.width - 10, 4);
    if (B.faceLeft) {
      ctx.save(); ctx.translate(px + img.width, py); ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0); ctx.restore();
    } else ctx.drawImage(img, px, py);
    if (B.flash > 0 || up) {
      ctx.globalAlpha = up ? 0.3 + 0.25 * Math.sin(B.anim * 26) : B.flash * 7;
      ctx.globalCompositeOperation = 'lighter';
      if (B.faceLeft) {
        ctx.save(); ctx.translate(px + img.width, py); ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0); ctx.restore();
      } else ctx.drawImage(img, px, py);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    if (B.state === 'swing') {
      ctx.save();
      ctx.translate(Math.round(B.x - cx), Math.round(B.y - cy - 6));
      ctx.rotate(B.swingAng);
      var t = Math.min(1, B.t / 0.25);
      ctx.strokeStyle = 'rgba(141,151,168,' + (0.8 - t * 0.6) + ')';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 34, -1.1 + 2.2 * t * 0.5, -1.1 + 2.2 * (0.4 + t * 0.6));
      ctx.stroke();
      ctx.restore();
    }
  };

  B.lights = function () { return [{ x: B.x, y: B.y - 8, r: 58, warm: 1, flicker: 1 }]; };

  return B;
};

// ---------- projectiles / shockwave ----------
HC.makeArrow = function (x, y, vx, vy, dmg) {
  var A = { kind: 'arrow', x: x, y: y, vx: vx, vy: vy, t: 0, alive: true };
  A.update = function (dt) {
    A.t += dt;
    A.x += A.vx * dt; A.y += A.vy * dt;
    if (A.t > 3 || HC.world.solidAt(A.x, A.y)) { A.alive = false; return; }
    var p = HC.game.player;
    if (!p.dead && p.iframes <= 0 && HC.dist(A.x, A.y, p.x, p.y - 4) < p.r + 3) {
      p.hurt(dmg, A.x - A.vx, A.y - A.vy);
      A.alive = false;
    }
  };
  A.base = function () { return A.y + 200; };
  A.draw = function (ctx, cx, cy) {
    var ang = Math.atan2(A.vy, A.vx);
    ctx.save();
    ctx.translate(Math.round(A.x - cx), Math.round(A.y - cy));
    ctx.rotate(ang);
    ctx.fillStyle = '#7a5f42'; ctx.fillRect(-4, 0, 7, 1);
    ctx.fillStyle = '#e6dfc8'; ctx.fillRect(3, 0, 2, 1);
    ctx.restore();
  };
  return A;
};

HC.makeShockwave = function (x, y, dmg) {
  var S = { kind: 'shock', x: x, y: y, r: 8, hitDone: false, alive: true };
  S.update = function (dt) {
    S.r += 95 * dt;
    if (S.r > 135) { S.alive = false; return; }
    var p = HC.game.player;
    if (!S.hitDone && !p.dead && p.iframes <= 0) {
      var d = HC.dist(S.x, S.y, p.x, p.y);
      if (Math.abs(d - S.r) < 7) {
        if (p.hurt(dmg, S.x, S.y)) S.hitDone = true;
      }
    }
  };
  S.base = function () { return 1; };
  S.draw = function (ctx, cx, cy) {
    var a = 1 - S.r / 135;
    ctx.strokeStyle = 'rgba(255,212,122,' + (0.55 * a) + ')';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(Math.round(S.x - cx), Math.round(S.y - cy), S.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(143,232,255,' + (0.4 * a) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(Math.round(S.x - cx), Math.round(S.y - cy), S.r + 3, 0, Math.PI * 2);
    ctx.stroke();
  };
  return S;
};

// soul wisps that fly to the player and become Remembrance
HC.makeSoulFly = function (x, y, value) {
  var S = { kind: 'soulfly', x: x, y: y, vx: HC.rand(-50, 50), vy: HC.rand(-70, -10), t: 0, alive: true };
  S.update = function (dt) {
    S.t += dt;
    var p = HC.game.player;
    if (S.t > 0.35) {
      var a = HC.angTo(S.x, S.y, p.x, p.y - 6);
      var sp = 90 + S.t * 260;
      S.vx = HC.lerp(S.vx, Math.cos(a) * sp, 1 - Math.pow(0.01, dt));
      S.vy = HC.lerp(S.vy, Math.sin(a) * sp, 1 - Math.pow(0.01, dt));
    }
    S.x += S.vx * dt; S.y += S.vy * dt;
    if (HC.dist(S.x, S.y, p.x, p.y - 6) < 7) {
      S.alive = false;
      HC.run.souls += value;
      HC.audio.sfx.soul();
      HC.particles.burst(p.x, p.y - 8, 4, { color: '#8fe8ff', spMin: 10, spMax: 40, lifeMax: 0.3 });
    }
  };
  S.base = function () { return S.y + 300; };
  S.draw = function (ctx, cx, cy) {
    ctx.fillStyle = '#8fe8ff';
    ctx.fillRect(Math.round(S.x - cx) - 1, Math.round(S.y - cy) - 1, 2, 2);
    ctx.fillStyle = 'rgba(143,232,255,0.4)';
    ctx.fillRect(Math.round(S.x - cx) - 2, Math.round(S.y - cy) - 2, 4, 4);
  };
  S.lights = function () { return [{ x: S.x, y: S.y, r: 12, warm: 0 }]; };
  return S;
};

// ---------- pickups & interactables ----------
HC.makePickup = function (type, tx, ty) {
  var P = { kind: type, x: tx * HC.TILE + 8, y: ty * HC.TILE + 8, t: HC.rand(0, 6), alive: true, isPickup: true };
  P.update = function (dt) {
    P.t += dt;
    var pl = HC.game.player;
    var d = HC.dist(P.x, P.y, pl.x, pl.y);
    if (type === 'wisp' && d < 10) {
      P.alive = false;
      HC.game.dropSouls(P.x, P.y, 8);
      HC.floaters.add(P.x, P.y - 10, 'A MEMORY LINGERS', '#8fe8ff');
    } else if (type === 'ember' && d < 10) {
      P.alive = false;
      HC.audio.sfx.heal();
      if (pl.flasks < pl.maxFlasks) { pl.flasks++; HC.floaters.add(P.x, P.y - 10, '+1 EMBER', '#f2a13c'); }
      else { pl.hp = Math.min(pl.maxHp(), pl.hp + 15); HC.floaters.add(P.x, P.y - 10, '+15', '#7fe08a'); }
      HC.particles.burst(P.x, P.y, 8, { color: '#f2a13c', spMin: 10, spMax: 50, lifeMax: 0.5 });
    }
  };
  P.base = function () { return P.y + 4; };
  P.draw = function (ctx, cx, cy) {
    var bob = Math.sin(P.t * 3) * 2;
    var px = Math.round(P.x - cx), py = Math.round(P.y - cy + bob);
    if (type === 'wisp') {
      ctx.fillStyle = 'rgba(143,232,255,0.35)';
      ctx.fillRect(px - 3, py - 3, 6, 6);
      ctx.fillStyle = '#8fe8ff'; ctx.fillRect(px - 1, py - 1, 3, 3);
      ctx.fillStyle = '#e8fbff'; ctx.fillRect(px, py, 1, 1);
    } else {
      ctx.fillStyle = 'rgba(242,161,60,0.3)';
      ctx.fillRect(px - 3, py - 3, 6, 6);
      ctx.fillStyle = '#f2a13c'; ctx.fillRect(px - 1, py - 1, 3, 3);
      ctx.fillStyle = '#ffd47a'; ctx.fillRect(px, py - 1, 1, 1);
    }
  };
  P.lights = function () { return [{ x: P.x, y: P.y, r: 16, warm: type === 'ember' ? 1 : 0, flicker: 1 }]; };
  return P;
};

HC.makeInteractable = function (type, tx, ty) {
  var I = {
    kind: type, x: tx * HC.TILE + 8, y: ty * HC.TILE + 8,
    t: 0, alive: true, isInteract: true, used: false
  };
  if (type === 'sword') { I.prompt = 'TAKE THE BROKEN SWORD'; I.radius = 22; }
  if (type === 'brazier') {
    I.prompt = (HC.game.flags && HC.game.flags.brazierLit) ? 'REST BY THE FLAME' : 'LIGHT THE CHAPEL FLAME';
    I.radius = 26; I.solid = true;
  }
  if (type === 'shrine') { I.prompt = 'OFFER REMEMBRANCE'; I.radius = 26; I.solid = true; }
  if (type === 'survivor') { I.prompt = 'SPEAK'; I.radius = 22; }

  if (I.solid) {
    HC.world.props.push({ type: type + '-block', x: I.x - 6, y: I.y - 4, solid: { x: I.x - 6, y: I.y - 4, w: 12, h: 10 }, base: -1, img: null, draw: null });
  }

  I.update = function (dt) { I.t += dt; };
  I.base = function () { return I.y + 8; };
  I.draw = function (ctx, cx, cy) {
    var S = HC.sprites;
    var px = Math.round(I.x - cx), py = Math.round(I.y - cy);
    if (type === 'sword') {
      ctx.drawImage(S.sword, px - 6, py - 8);
      var a = 0.3 + 0.2 * Math.sin(I.t * 3);
      ctx.fillStyle = 'rgba(230,223,200,' + a + ')';
      ctx.fillRect(px - 1, py - 6, 1, 1);
    } else if (type === 'brazier') {
      ctx.drawImage(HC.game.flags.brazierLit ? S.brazierLit : S.brazierUnlit, px - 8, py - 12);
      if (HC.game.flags.brazierLit && Math.random() < 0.3)
        HC.particles.spawn({ x: I.x + HC.rand(-3, 3), y: I.y - 8, vx: HC.rand(-5, 5), vy: HC.rand(-28, -12), life: 0.7, color: Math.random() < 0.5 ? '#f2a13c' : '#ffd47a', size: 1 });
    } else if (type === 'shrine') {
      ctx.drawImage(S.shrine, px - 8, py - 18);
    } else if (type === 'survivor') {
      ctx.drawImage(S.survivor, px - 7, py - 9 + (Math.floor(I.t * 1.5) % 2 === 0 ? 0 : 0));
    }
  };
  I.lights = function () {
    if (type === 'brazier' && HC.game.flags.brazierLit) return [{ x: I.x, y: I.y - 8, r: 85, warm: 1, flicker: 1 }];
    if (type === 'shrine') return [{ x: I.x - 5, y: I.y - 4, r: 20, warm: 1, flicker: 1 }, { x: I.x + 4, y: I.y - 5, r: 20, warm: 1, flicker: 1 }];
    if (type === 'sword') return [{ x: I.x, y: I.y - 4, r: 18, warm: 0, flicker: 1 }];
    return [];
  };
  return I;
};
