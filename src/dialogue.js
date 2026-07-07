// The Hollow Crown — dialogue scripts, dialogue box UI, quest tracker
'use strict';

HC.script = {
  intro: [
    { who: 'VELA', text: 'Up. UP. The soil has kept you long enough, Gravebound.' },
    { who: 'VELA', text: 'You died in the Candle War. The kingdom lost. The Crown... won.' },
    { who: 'VELA', text: 'Now it calls all dead things home. But you woke belonging to no one.' },
    { who: 'VELA', text: 'Find steel. The dead in this grave do not sleep kindly.' }
  ],
  swordTaken: [
    { who: 'GRAVEBOUND', text: 'A broken longsword. It remembers my hand.' },
    { who: 'VELA', text: "An Ash Knight's blade. Then that is what you were. What you are." },
    { who: 'VELA', text: 'They rise. Show me the war did not waste you.' }
  ],
  graveCleared: [
    { who: 'VELA', text: 'Good. The lantern drinks what they leave behind. Remembrance. Spend it well, when we find a shrine.' },
    { who: 'VELA', text: 'North, through the graveyard. A chapel still burns beyond the hill... barely.' }
  ],
  zone0Cleared: [
    { who: 'VELA', text: 'The old gate remembers how to open. Keep to the path, Gravebound.' }
  ],
  preBoss: [
    { who: 'VELA', text: 'Wait. The earth here is... listened to. Something old keeps this ground.' },
    { who: 'VELA', text: 'The Gravekeeper. He buried the dead of the war. Now he will not let them leave. Not even you.' }
  ],
  bossStart: [
    { who: 'GRAVEKEEPER', text: 'Back... into... the ground. The Crown counts its dead, little candle.' }
  ],
  bossDead: [
    { who: 'VELA', text: 'He was only guarding what he loved. Remember that face. The Crown will offer you far worse bargains.' },
    { who: 'VELA', text: 'The north gate is open. Candlefall waits.' }
  ],
  chapelIntro: [
    { who: 'VELA', text: 'Candlefall Chapel. Once a hundred candles held the dark out of this valley.' },
    { who: 'VELA', text: 'Now count them. One flame. And it is dying.' }
  ],
  survivor: [
    { who: 'BROTHER COLE', text: 'You... you walked the graveyard road? Alone?' },
    { who: 'BROTHER COLE', text: 'I am Cole. Last brother of Candlefall. The others fled, or... did not.' },
    { who: 'BROTHER COLE', text: 'The chapel flame is nearly out. If it dies, the fog takes us both. Please. The brazier. Light it.' }
  ],
  survivorAfter: [
    { who: 'BROTHER COLE', text: 'Warm. I had forgotten warm.' },
    { who: 'BROTHER COLE', text: 'Others will see the glow and come. A blacksmith. A healer. A militia. You will see. Candlefall will stand.' }
  ],
  survivorWaiting: [
    { who: 'BROTHER COLE', text: 'The brazier, Gravebound. Before the last candle drowns.' }
  ],
  brazierLit: [
    { who: 'VELA', text: 'There. Let it be seen from the capital: someone still holds a light in Veyr.' },
    { who: 'BROTHER COLE', text: 'Saints below... look at it burn.' },
    { who: 'VELA', text: 'This is where it begins. A hub for the living. Rest here. Grow strong at the shrine.' },
    { who: 'VELA', text: 'Beyond this night: the burned village, the Bell Tower, the Catacombs... and the knight who kneels beneath them.' }
  ],
  shrineFirst: [
    { who: 'VELA', text: 'Give the shrine what the dead gave you. Remembrance becomes strength. It is the only fair trade left in this kingdom.' }
  ],

  // ---------- Quest 1: Light the Chapel ----------
  q1Offer: [
    { who: 'BROTHER COLE', text: 'The flame is lit, but rain and fog will drown it by dawn. It needs holy oil. The village stores kept casks of it, before the burning.' },
    { who: 'BROTHER COLE', text: 'And Gravebound... last night I heard them on the west wind. Bram, hammering his workshop shut. Lysa, calling from her cellar.' },
    { who: 'BROTHER COLE', text: 'Two of ours, still alive in that ash. I could not go. I am not ashamed... I am not.' },
    { who: 'VELA', text: 'Oil for the flame, and whoever we can pull from the dark. The west road, Gravebound.' }
  ],
  coleWaitingQ1: [
    { who: 'BROTHER COLE', text: 'The west road, past the signpost. Hurry. The dead do not tire of knocking.' }
  ],
  villageEnter: [
    { who: 'VELA', text: 'Candlefall village. The Crown soldiers burned it for the crime of feeding rebels.' },
    { who: 'VELA', text: 'Ash keeps no one warm. But something in it is still moving. Stay sharp.' }
  ],
  villageChoice: [
    { who: 'VELA', text: 'Listen. Hammering, west - Bram is barricaded and the dead are through his wall.' },
    { who: 'VELA', text: 'And below the east houses - Lysa, in her cellar. Water rising, dead above.' },
    { who: 'VELA', text: 'One night. One of you. Whoever you answer first, the other... the fog is faster than we are. Choose, Gravebound.' }
  ],
  rescueStartBram: [
    { who: 'BRAM', text: 'WHO IS THERE? Living or dead, this hammer does not care!' },
    { who: 'VELA', text: 'They heard him too. Here they come. Keep them off the workshop!' }
  ],
  rescueStartLysa: [
    { who: 'LYSA', text: 'Hello?! Please - the doors, the water is at my knees and something is scratching the wood!' },
    { who: 'VELA', text: 'They heard her too. Here they come. Keep them off the cellar!' }
  ],
  savedBram: [
    { who: 'BRAM', text: 'Hah! Still standing. Bram, carpenter. You swing like a soldier and block like a barn door - I can fix one of those.' },
    { who: 'BRAM', text: 'A chapel flame, you say? Then Candlefall has walls again. I will follow the glow. Go, finish what you came for.' },
    { who: 'VELA', text: 'The east cellar has gone quiet. We chose, Gravebound. Remember what it cost.' }
  ],
  savedLysa: [
    { who: 'LYSA', text: 'Air - AIR. Thank you. Lysa. Herbalist. You bleed like a man who thinks flasks grow on trees. They do, if you know the tree.' },
    { who: 'LYSA', text: 'A flame at the chapel? Then there is somewhere to boil water again. I will follow the glow. Go - take what you came for.' },
    { who: 'VELA', text: 'The hammering has stopped, in the west. We chose, Gravebound. Remember what it cost.' }
  ],
  lostBram: [
    { who: 'VELA', text: 'The barricade is torn open from the inside... he swung until the end. Say his name once, and do not look further.' }
  ],
  lostLysa: [
    { who: 'VELA', text: 'The cellar doors float on black water. No one is calling now. Say her name once, and do not look down.' }
  ],
  oilTaken: [
    { who: 'VELA', text: 'Holy oil - pressed in the old chapel, blessed against fog and worse. The flame will drink it gladly. Back to Candlefall.' }
  ],
  q1Return: [
    { who: 'VELA', text: 'Pour it slow... there. Look at it stand up against the rain. That flame will outlive the night now. Maybe the winter.' },
    { who: 'BROTHER COLE', text: 'By every drowned saint. You went into the ash and came back. Candlefall owes you twice now.' }
  ],
  bramHub: [
    { who: 'BRAM', text: 'Reinforced your guard-arm bracing while you slept. Ash Guard will hold longer and turn more steel. Do not thank me, just do not die.' }
  ],
  lysaHub: [
    { who: 'LYSA', text: 'I cut your flasks with silverleaf. They hold more, heal deeper. And there is a fourth - carry it for the road.' }
  ],
  coleAfterQ1: [
    { who: 'BROTHER COLE', text: 'The glow reaches the tree line now. Others will come. And when they do... that cursed bell in the tower must be silenced. Soon.' }
  ]
};

HC.speakers = {
  'VELA': { color: '#ffd47a', sprite: function () { return HC.sprites.vela[0]; } },
  'GRAVEBOUND': { color: '#8fe8ff', sprite: function () { return HC.sprites.player.down[0]; } },
  'GRAVEKEEPER': { color: '#c04a50', sprite: function () { return HC.sprites.gravekeeper[0]; } },
  'BROTHER COLE': { color: '#9aa3b2', sprite: function () { return HC.sprites.survivor; } },
  'BRAM': { color: '#c9975a', sprite: function () { return HC.sprites.bram; } },
  'LYSA': { color: '#8fce7a', sprite: function () { return HC.sprites.lysa; } }
};

HC.dialogue = (function () {
  var D = { active: false, lines: null, idx: 0, chars: 0, onDone: null };

  D.start = function (idOrLines, onDone) {
    var lines = typeof idOrLines === 'string' ? HC.script[idOrLines] : idOrLines;
    if (!lines || !lines.length) { if (onDone) onDone(); return; }
    D.active = true;
    D.lines = lines;
    D.idx = 0;
    D.chars = 0;
    D.onDone = onDone || null;
  };

  D.update = function (dt) {
    if (!D.active) return;
    var line = D.lines[D.idx];
    D.chars += dt * 46;
    if (HC.input.hit('interact') || HC.input.hit('attack') || HC.input.hit('dodge')) {
      HC.audio.sfx.ui();
      if (D.chars < line.text.length) {
        D.chars = line.text.length;
      } else {
        D.idx++;
        D.chars = 0;
        if (D.idx >= D.lines.length) {
          D.active = false;
          var cb = D.onDone; D.onDone = null;
          if (cb) cb();
        }
      }
    }
  };

  D.draw = function (ctx) {
    if (!D.active) return;
    var W = HC.VIEW_W, H = HC.VIEW_H;
    var line = D.lines[D.idx];
    var sp = HC.speakers[line.who] || { color: '#fff', sprite: null };
    var bx = 8, bw = W - 16, bh = 58, by = H - bh - 6;

    ctx.fillStyle = 'rgba(12,10,20,0.92)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#6e563c';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    ctx.strokeStyle = 'rgba(110,86,60,0.4)';
    ctx.strokeRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);

    // portrait
    var img = sp.sprite ? sp.sprite() : null;
    if (img) {
      var scale = Math.min(2, Math.floor(40 / img.height) || 1);
      var pw = img.width * scale, ph = img.height * scale;
      ctx.fillStyle = 'rgba(30,26,42,0.8)';
      ctx.fillRect(bx + 6, by + 6, 46, bh - 12);
      ctx.strokeStyle = '#3d3428';
      ctx.strokeRect(bx + 6.5, by + 6.5, 45, bh - 13);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, Math.round(bx + 6 + (46 - pw) / 2), Math.round(by + 6 + (bh - 12 - ph) / 2), pw, ph);
    }

    HC.font.drawShadow(ctx, line.who, bx + 60, by + 7, sp.color, 1);
    var shown = line.text.substring(0, Math.floor(D.chars));
    var wrapped = HC.font.wrap(shown, 52);
    for (var i = 0; i < wrapped.length && i < 4; i++)
      HC.font.draw(ctx, wrapped[i], bx + 60, by + 19 + i * 9, '#e6dfc8', 1);

    if (D.chars >= line.text.length) {
      var blink = Math.floor(HC.world.time * 3) % 2 === 0;
      if (blink) HC.font.draw(ctx, '>', bx + bw - 12, by + bh - 12, '#ffd47a', 1);
    }
  };

  return D;
})();

HC.quest = (function () {
  var Q = { text: '', toastT: 0 };
  Q.set = function (text) {
    if (Q.text === text) return;
    Q.text = text;
    Q.toastT = 2.6;
    HC.audio.sfx.interact();
  };
  Q.update = function (dt) { Q.toastT = Math.max(0, Q.toastT - dt); };
  Q.draw = function (ctx) {
    if (!Q.text) return;
    HC.font.drawShadow(ctx, '* ' + Q.text, HC.VIEW_W - 6, 6, '#c9bfa4', 1, 'right');
    if (Q.toastT > 0) {
      var a = HC.clamp(Q.toastT, 0, 1);
      ctx.globalAlpha = a;
      var w = HC.font.width(Q.text) + 24;
      ctx.fillStyle = 'rgba(12,10,20,0.85)';
      ctx.fillRect(HC.VIEW_W / 2 - w / 2, 34, w, 16);
      ctx.strokeStyle = '#6e563c';
      ctx.strokeRect(HC.VIEW_W / 2 - w / 2 + 0.5, 34.5, w - 1, 15);
      HC.font.draw(ctx, Q.text, HC.VIEW_W / 2, 39, '#ffd47a', 1, 'center');
      ctx.globalAlpha = 1;
    }
  };
  return Q;
})();
