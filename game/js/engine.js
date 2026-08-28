/* Hi Roller — slot-machine cabinets, gutter tracks, 100-tower combat */
(function (g) {
  'use strict';
  const HR = g.HR;
  const W = HR.LOGICAL_W;
  const H = HR.LOGICAL_H;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function choice(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function makeTower(typeId, owner, skin) {
    const p = HR.Save.data;
    const lv = (owner === 0 ? (p.towerLevels[typeId] || 1) : 1 + ((HR.tierIndex(p.rank) / 2) | 0));
    const talents = owner === 0 ? (p.talents[typeId] || {}) : {};
    const st = HR.towerStats(typeId, lv, skin, talents);
    const def = HR.TOWERS[typeId];
    return {
      type: typeId, ability: def.ability, family: def.family,
      level: lv, owner, skin,
      hp: st.hp, maxHp: st.hp, dmg: st.dmg, cd: st.cd, range: st.range,
      mods: st.mods, cool: rand(0, 0.35),
      x: 0, y: 0, r: 40, crumble: 0, flash: 0, alive: true,
      def,
    };
  }

  function makeCabinet(owner, index, strip) {
    return {
      owner, index,
      x: W / 2, y: 0, w: W * 0.72, h: 132,
      windows: [],
      strip: strip.slice(),
      slotCount: 3,
      spinning: false, spinT: 0, spinDur: 0.55, invuln: 0, request: false,
      shake: 0, blur: 0,
    };
  }

  class Match {
    constructor(opts) {
      this.mode = opts.mode || 'practice';
      this.duration = opts.duration || (this.mode === 'practice' ? HR.PRACTICE_SECONDS : HR.MATCH_SECONDS);
      this.player = HR.Save.data;
      this.skin = this.player.selectedSkin;
      this.theme = HR.THEMES[this.player.selectedTheme] || HR.THEMES.classic;
      this.oppName = opts.oppName || choice(HR.BOT_NAMES);
      this.oppTierIndex = opts.oppTierIndex != null ? opts.oppTierIndex : HR.tierIndex(this.player.rank);
      this.difficulty = opts.difficulty || 0.7;
      this.timeLeft = this.duration;
      this.elapsed = 0;
      this.running = false;
      this.over = false;
      this.result = null;
      this.countdown = 3;
      this.expandPhase = 1;
      this.chips = [240, 240];
      this.doubleT = [0, 0];
      this.spinCd = [0, 0];
      this.ddCd = [0, 0];
      this.damage = [0, 0];
      this.minionsScored = [0, 0];
      this.rotations = [0, 0];
      this.reels = [[], []];
      this.minions = [];
      this.projectiles = [];
      this.particles = [];
      this.floaters = [];
      this.traps = [];
      this.spawnT = 0.7;
      this.shake = 0;
      this.aiT = 0;
      this.emoteT = 0;
      this.trackXs = [];
      this.towerXs = [];
      this.loadout = [
        (this.player.loadout && this.player.loadout.length >= 3) ? this.player.loadout.slice() : HR.STARTER_TOWERS.slice(),
        this._aiLoadout(),
      ];
      this._initReels();
      this.bg = null;
      const img = new Image();
      img.src = 'assets/ui/bg-casino.png';
      img.onload = () => { this.bg = img; };
    }

    _aiLoadout() {
      const pool = HR.TOWER_ORDER.filter((id) => HR.TOWERS[id].unlockLevel <= Math.max(1, this.player.level + this.oppTierIndex * 4));
      const out = [];
      const src = pool.length ? pool : HR.STARTER_TOWERS;
      for (let i = 0; i < 9; i++) out.push(src[i % src.length]);
      return out;
    }

    _initReels() {
      for (let s = 0; s < 2; s++) {
        const cab = makeCabinet(s, 0, this.loadout[s]);
        for (let i = 0; i < 3; i++) cab.windows.push(makeTower(cab.strip[i % cab.strip.length], s, s === 0 ? this.skin : 'wood'));
        this.reels[s].push(cab);
      }
      this._layout();
    }

    _layout() {
      const nCab = this.reels[0].length;
      const slots = this.reels[0][0].slotCount;
      for (let s = 0; s < 2; s++) {
        const isP = s === 0;
        const top = isP ? H * 0.54 : H * 0.18;
        const bot = isP ? H * 0.80 : H * 0.44;
        this.reels[s].forEach((cab, i) => {
          const t = nCab === 1 ? 0.5 : i / (nCab - 1);
          cab.y = lerp(top, bot, isP ? t : 1 - t);
          cab.x = W / 2;
          cab.w = W * (slots <= 3 ? 0.70 : slots <= 4 ? 0.78 : 0.84);
          cab.h = slots >= 6 ? 112 : 128;
          cab.slotCount = slots;
          while (cab.windows.length < slots) cab.windows.push(null);
          this._placeWindows(cab);
        });
      }
      this._computeTracks();
    }

    _placeWindows(cab) {
      const n = cab.slotCount;
      const span = cab.w * 0.78;
      const start = cab.x - span / 2;
      const step = n === 1 ? 0 : span / (n - 1);
      for (let i = 0; i < n; i++) {
        const tw = cab.windows[i];
        if (tw) { tw.x = start + i * step; tw.y = cab.y; tw.r = cab.h * 0.34; }
      }
    }

    _computeTracks() {
      const cab = this.reels[0][0];
      const n = cab.slotCount;
      const span = cab.w * 0.78;
      const start = cab.x - span / 2;
      const step = n === 1 ? 80 : span / (n - 1);
      this.towerXs = [];
      this.trackXs = [];
      for (let i = 0; i < n; i++) this.towerXs.push(start + i * step);
      this.trackXs.push(this.towerXs[0] - step * 0.48);
      for (let i = 0; i < n - 1; i++) this.trackXs.push((this.towerXs[i] + this.towerXs[i + 1]) / 2);
      this.trackXs.push(this.towerXs[n - 1] + step * 0.48);
    }

    start() { this.running = true; }

    expandTo(cabs, slots) {
      const cur = this.reels[0].length;
      if (cabs > cur) {
        for (let s = 0; s < 2; s++) {
          for (let k = cur; k < cabs; k++) {
            const cab = makeCabinet(s, k, this.loadout[s]);
            cab.slotCount = slots;
            for (let i = 0; i < slots; i++) cab.windows.push(null);
            this.reels[s].push(cab);
          }
        }
        this.floaters.push({ x: W / 2, y: H / 2, text: 'THE WHEEL GROWS', color: '#c9a227', t: 1.3, vy: -20, size: 26 });
        HR.Audio.warn();
      }
      for (let s = 0; s < 2; s++) this.reels[s].forEach((c) => { c.slotCount = slots; });
      this._layout();
      this.expandPhase = cabs;
    }

    livingTowers(side) {
      let n = 0;
      this.reels[side].forEach((c) => c.windows.forEach((t) => { if (t && t.alive) n++; }));
      return n;
    }

    update(dt) {
      if (this.over) { this._fx(dt); return; }
      if (this.countdown > 0) {
        this.countdown -= dt;
        if (this.countdown <= 0) { this.countdown = 0; this.start(); }
        this._fx(dt);
        return;
      }
      if (!this.running) return;
      dt = Math.min(dt, 0.05);
      this.elapsed += dt;
      this.timeLeft = Math.max(0, this.duration - this.elapsed);
      this.shake = Math.max(0, this.shake - dt * 8);
      for (let i = 0; i < 2; i++) {
        this.spinCd[i] = Math.max(0, this.spinCd[i] - dt);
        this.ddCd[i] = Math.max(0, this.ddCd[i] - dt);
        this.doubleT[i] = Math.max(0, this.doubleT[i] - dt);
      }
      this.emoteT = Math.max(0, this.emoteT - dt);
      const frac = this.elapsed / this.duration;
      if (this.expandPhase < 2 && frac >= 0.33) this.expandTo(2, 4);
      if (this.expandPhase < 3 && frac >= 0.66) this.expandTo(3, 6);
      this.spawnT -= dt;
      if (this.spawnT <= 0) { this.spawnT = 3; this._spawn(); }
      this._updateCabs(dt);
      this._updateMinions(dt);
      this._updateTowers(dt);
      this._updateProjectiles(dt);
      this._fx(dt);
      this._ai(dt);
      if (this.timeLeft <= 0 || this.livingTowers(0) === 0 || this.livingTowers(1) === 0) this._finish();
    }

    _spawn() {
      for (let s = 0; s < 2; s++) {
        const n = Math.min(2, this.trackXs.length);
        for (let k = 0; k < n; k++) {
          const lane = (Math.random() * this.trackXs.length) | 0;
          const x = this.trackXs[lane];
          this.minions.push({
            owner: s, lane, x, y: s === 0 ? H - 210 : 150,
            hp: 70, maxHp: 70, speed: 92 + this.difficulty * 14,
            dir: s === 0 ? -1 : 1, r: 15, stun: 0, marked: 0, burn: 0, poison: 0, slow: 0,
            wob: rand(0, 6.28),
          });
        }
      }
    }

    _updateCabs(dt) {
      for (let s = 0; s < 2; s++) {
        this.reels[s].forEach((cab) => {
          cab.invuln = Math.max(0, cab.invuln - dt);
          cab.shake = Math.max(0, cab.shake - dt * 6);
          if (cab.spinning) {
            cab.spinT += dt;
            cab.blur = Math.sin((cab.spinT / cab.spinDur) * Math.PI);
            if (cab.spinT >= cab.spinDur * 0.5 && cab.request) {
              cab.request = false;
              this._landSpin(cab);
            }
            if (cab.spinT >= cab.spinDur) { cab.spinning = false; cab.spinT = 0; cab.blur = 0; }
          } else {
            for (let i = 0; i < cab.windows.length; i++) {
              const t = cab.windows[i];
              if (t && t.alive && t.hp / t.maxHp < 0.2 && t.hp > 0) { this.spinCabinet(cab); break; }
            }
          }
          cab.windows.forEach((t) => {
            if (t && t.alive && t.ability === 'regen') {
              t.hp = Math.min(t.maxHp, t.hp + (t.def.regen || 4) * (1 + (t.mods.sig || 0)) * dt);
            }
          });
          this._placeWindows(cab);
        });
      }
    }

    _landSpin(cab) {
      const strip = cab.strip.length ? cab.strip : HR.STARTER_TOWERS;
      for (let i = 0; i < cab.slotCount; i++) {
        const cur = cab.windows[i];
        const should = !cur || !cur.alive || cur.hp / cur.maxHp < 0.55;
        if (!should && Math.random() > 0.35) continue;
        const id = strip[(Math.floor(Math.random() * strip.length) + i) % strip.length];
        const fresh = makeTower(id, cab.owner, cab.owner === 0 ? this.skin : 'wood');
        if (cur && cur.mods && cur.mods.spinHeal) fresh.hp = Math.min(fresh.maxHp, fresh.hp + fresh.maxHp * cur.mods.spinHeal);
        cab.windows[i] = fresh;
      }
      this.rotations[cab.owner]++;
      if (cab.owner === 0) HR.Save.data.stats.rotations++;
    }

    spinCabinet(cab) {
      if (!cab || cab.spinning) return false;
      cab.spinning = true; cab.spinT = 0; cab.request = true;
      const skin = HR.LOG_SKINS[cab.owner === 0 ? this.skin : 'wood'];
      cab.spinDur = 0.55 / (skin.rot || 1);
      cab.invuln = cab.spinDur;
      cab.shake = 0.4;
      this.shake = 0.22;
      HR.Audio.spin();
      if (cab.owner === 0 && HR.Save.data.settings.haptics && navigator.vibrate) navigator.vibrate(30);
      this._burst(cab.x, cab.y, '#c9a227', 16);
      return true;
    }

    manualSpin(side) {
      if (this.spinCd[side] > 0 || this.chips[side] < 50) return false;
      let best = null, bestR = 1;
      this.reels[side].forEach((cab) => {
        cab.windows.forEach((t) => {
          if (t && t.alive && t.hp / t.maxHp < bestR) { bestR = t.hp / t.maxHp; best = cab; }
        });
        if (!best) best = cab;
      });
      if (!best) return false;
      this.chips[side] -= 50;
      this.spinCd[side] = 10;
      return this.spinCabinet(best);
    }

    doubleDown(side) {
      if (this.ddCd[side] > 0) return false;
      this.doubleT[side] = 5; this.ddCd[side] = 20;
      if (side === 0) { HR.Save.data.stats.doubleDowns++; HR.Audio.upgrade(); }
      this.floaters.push({ x: W / 2, y: side === 0 ? H * 0.7 : H * 0.3, text: 'DOUBLE DOWN', color: '#c9a227', t: 1.1, vy: -28, size: 24 });
      return true;
    }

    _updateMinions(dt) {
      const keep = [];
      for (const m of this.minions) {
        if (m.stun > 0) m.stun -= dt;
        else {
          const slow = m.slow > 0 ? 0.55 : 1;
          m.y += m.dir * m.speed * slow * dt;
          if (m.slow > 0) m.slow -= dt;
        }
        if (m.burn > 0) { m.hp -= 8 * dt; m.burn -= dt; }
        if (m.poison > 0) { m.hp -= 6 * dt; m.poison -= dt; }
        m.wob += dt * 6;
        // stay on track
        const tx = this.trackXs[m.lane] || m.x;
        m.x = lerp(m.x, tx + Math.sin(m.wob) * 3, 0.2);
        if (m.marked > 0) m.marked -= dt;

        const enemy = 1 - m.owner;
        this.reels[enemy].forEach((cab) => {
          if (cab.invuln > 0) return;
          cab.windows.forEach((t) => {
            if (!t || !t.alive) return;
            if (Math.abs(m.y - t.y) < 34 && Math.abs(m.x - t.x) < 70) this._hurt(t, cab, 5 * dt);
          });
        });
        this.traps = this.traps.filter((tr) => {
          tr.t -= dt;
          if (tr.owner !== m.owner && Math.abs(m.x - tr.x) < 28 && Math.abs(m.y - tr.y) < 40) {
            m.slow = Math.max(m.slow, 1.2); m.hp -= 4 * dt;
          }
          return tr.t > 0;
        });

        const scored = (m.owner === 0 && m.y < 140) || (m.owner === 1 && m.y > H - 200);
        if (scored) {
          const gain = 10 * (this.doubleT[m.owner] > 0 ? 2 : 1) * (m.owner === 0 ? (HR.LOG_SKINS[this.skin].chip || 1) : 1);
          this.chips[m.owner] += gain;
          this.minionsScored[m.owner]++;
          if (m.owner === 0) { HR.Save.data.stats.minionsScored++; HR.Audio.score(); }
          this.floaters.push({ x: m.x, y: m.y, text: '+' + Math.round(gain), color: '#c9a227', t: 0.85, vy: -48, size: 16 });
        } else if (m.hp > 0) keep.push(m);
        else this._burst(m.x, m.y, '#b43a3a', 7);
      }
      this.minions = keep;
    }

    _hurt(t, cab, amt) {
      if (!t || !t.alive || (cab && cab.invuln > 0)) return;
      const dr = (t.mods && t.mods.dr) || (t.def.dr || 0);
      t.hp -= amt * (1 - dr);
      t.flash = 0.1;
      if (cab) cab.shake = Math.max(cab.shake, 0.1);
      if (t.hp <= 0) {
        t.hp = 0; t.alive = false; t.crumble = 0.4;
        this._burst(t.x, t.y, '#b43a3a', 18);
        HR.Audio.crumble();
        this.shake = 0.4;
        if (t.owner === 1) HR.Save.data.stats.towersCrumbled++;
        const self = this;
        setTimeout(() => {
          self.reels[t.owner].forEach((c) => {
            const i = c.windows.indexOf(t);
            if (i >= 0) c.windows[i] = null;
          });
        }, 380);
      }
    }

    _updateTowers(dt) {
      for (let s = 0; s < 2; s++) {
        this.reels[s].forEach((cab) => {
          const buffs = cab.windows.map((t) => t && t.alive && t.ability === 'buff');
          cab.windows.forEach((t, i) => {
            if (!t || !t.alive) return;
            if (t.crumble > 0) { t.crumble -= dt; return; }
            t.flash = Math.max(0, t.flash - dt);
            if (t.ability === 'aura') {
              this.minions.forEach((m) => {
                if (m.owner !== t.owner && Math.hypot(m.x - t.x, m.y - t.y) < 90) {
                  m.hp -= (t.def.aura || 8) * (1 + (t.mods.sig || 0)) * dt;
                  this.damage[t.owner] += (t.def.aura || 8) * dt;
                }
              });
            }
            let buff = 1;
            if (i > 0 && buffs[i - 1]) buff += 0.14;
            if (i < cab.windows.length - 1 && buffs[i + 1]) buff += 0.14;
            if (buff > 1 && t.cool <= 0 && s === 0) HR.Save.data.stats.pokerBuffs++;
            t.cool -= dt;
            if (t.cool > 0) return;
            const target = this._acquire(t, s);
            if (!target) return;
            t.cool = t.cd;
            this._fire(t, target, buff);
          });
        });
      }
    }

    _acquire(tower, side) {
      let best = null, bestD = tower.range;
      const reach = 1 + ((tower.mods && tower.mods.trackReach) || 0);
      for (const m of this.minions) {
        if (m.owner === side) continue;
        const d = Math.hypot(m.x - tower.x, m.y - tower.y);
        const colDist = Math.abs((this.trackXs[m.lane] || m.x) - tower.x);
        const nearTrack = colDist < 90 * reach;
        if (d < bestD && nearTrack) { bestD = d; best = m; }
      }
      if (best) return best;
      const enemy = 1 - side;
      this.reels[enemy].forEach((cab) => cab.windows.forEach((tw) => {
        if (!tw || !tw.alive) return;
        const d = Math.hypot(tw.x - tower.x, tw.y - tower.y);
        if (d < bestD) { bestD = d; best = tw; }
      }));
      return best;
    }

    _fire(tower, target, buff) {
      const ab = tower.ability;
      const sig = 1 + ((tower.mods && tower.mods.sig) || 0);
      const dmg = tower.dmg * buff * sig;
      const isM = target.lane != null;
      const shot = (tg, amount, color, extra) => this._shot(tower, tg, amount, color, extra);
      if (ab === 'rapid') {
        const n = (tower.def.multi || 3) + (tower.mods.cap ? 1 : 0);
        const foes = this.minions.filter((m) => m.owner !== tower.owner).sort((a, b) => Math.hypot(a.x - tower.x, a.y - tower.y) - Math.hypot(b.x - tower.x, b.y - tower.y)).slice(0, n);
        (foes.length ? foes : [target]).forEach((tg) => shot(tg, dmg, tower.def.color));
        if (tower.owner === 0) HR.Save.data.stats.slotShots += n;
        HR.Audio.shot();
      } else if (ab === 'aoe' || ab === 'freeze') {
        this._aoe(tower, target, dmg, tower.def.aoe || 64, (tower.def.stun || 0) * sig, tower.def.stunDur || 0.8);
        HR.Audio.hit();
      } else if (ab === 'snipe') {
        let amt = dmg;
        if (isM && target.marked > 0) { amt *= (tower.def.markBonus || 1.55); if (tower.owner === 0) HR.Save.data.stats.cardBonusKills++; }
        shot(target, amt, '#f4e9d0');
        if (isM) target.marked = 3.2;
        HR.Audio.shot();
      } else if (ab === 'crit' || ab === 'luck') {
        const minC = tower.def.critMin || 1, maxC = tower.def.critMax || 4;
        const crit = minC + ((Math.random() * (maxC - minC + 1)) | 0);
        shot(target, dmg * crit, '#f0d78c');
        if (crit >= 3) {
          this.floaters.push({ x: target.x, y: target.y - 16, text: crit + '×', color: '#f0d78c', t: 0.7, vy: -36, size: 18 });
          if (tower.owner === 0) HR.Save.data.stats.crits++;
        }
        HR.Audio.shot();
      } else if (ab === 'gold' || ab === 'steal') {
        shot(target, dmg, '#c9a227', (applied) => {
          this.chips[tower.owner] += applied * (tower.def.goldOnHit || tower.def.steal || 0.1) * 0.4;
          if (tower.owner === 0 && ab === 'steal') HR.Save.data.stats.blackjackStolen += applied;
        });
        HR.Audio.shot();
      } else if (ab === 'buff') {
        shot(target, dmg, '#6b8f4e');
      } else if (ab === 'burn') {
        shot(target, dmg, '#d35400', () => { if (isM) target.burn = tower.def.burnT || 2; });
        HR.Audio.shot();
      } else if (ab === 'slow' || ab === 'poison') {
        shot(target, dmg, '#7aa7c7', () => {
          if (!isM) return;
          if (ab === 'slow') target.slow = tower.def.slowT || 1.4;
          else target.poison = tower.def.poisonT || 3;
        });
        HR.Audio.shot();
      } else if (ab === 'shield' || ab === 'regen') {
        shot(target, dmg, '#7d8a99');
      } else if (ab === 'pierce' || ab === 'bounce' || ab === 'chain' || ab === 'split' || ab === 'execute' || ab === 'trap' || ab === 'aura') {
        if (ab === 'execute' && isM) {
          const missing = 1 - target.hp / target.maxHp;
          shot(target, dmg * (1 + missing * (tower.def.execute || 0.18) * sig), '#b43a3a');
        } else if (ab === 'trap') {
          this.traps.push({ x: target.x, y: target.y, owner: tower.owner, t: tower.def.trapT || 2.5 });
          shot(target, dmg, '#6b8f4e');
        } else if (ab === 'split') {
          shot(target, dmg * 0.7, tower.def.color);
          const others = this.minions.filter((m) => m !== target && m.owner !== tower.owner).slice(0, tower.def.split || 2);
          others.forEach((m) => shot(m, dmg * 0.5, tower.def.color));
        } else if (ab === 'chain') {
          shot(target, dmg, '#7ec8e3');
          const nxt = this.minions.find((m) => m !== target && m.owner !== tower.owner && Math.hypot(m.x - target.x, m.y - target.y) < 140);
          if (nxt) shot(nxt, dmg * 0.7, '#7ec8e3');
        } else {
          shot(target, dmg, tower.def.color, null, ab === 'pierce' ? 1 : 0);
        }
        HR.Audio.shot();
      } else {
        shot(target, dmg, tower.def.color);
        HR.Audio.shot();
      }
    }

    _shot(tower, target, dmg, color, onHit, pierce) {
      const dx = target.x - tower.x, dy = target.y - tower.y;
      const d = Math.hypot(dx, dy) || 1;
      this.projectiles.push({
        x: tower.x, y: tower.y, vx: dx / d * 540, vy: dy / d * 540,
        dmg, color, r: 5, owner: tower.owner, life: 1.15, target, onHit, homing: true, pierce: pierce || 0,
      });
    }

    _aoe(tower, target, dmg, radius, stunChance, stunDur) {
      const applyM = (m) => {
        m.hp -= dmg;
        if (Math.random() < stunChance) {
          m.stun = stunDur;
          if (tower.owner === 0) HR.Save.data.stats.stuns++;
        }
        this.damage[tower.owner] += dmg;
        if (tower.owner === 0) HR.Save.data.stats.damage += dmg;
      };
      if (target.lane != null) applyM(target);
      else {
        const cab = this._cabOf(target);
        this._hurt(target, cab, dmg);
        this.damage[tower.owner] += dmg;
      }
      this.minions.forEach((m) => {
        if (m.owner !== tower.owner && m !== target && Math.hypot(m.x - target.x, m.y - target.y) <= radius) applyM(m);
      });
    }

    _cabOf(tower) {
      for (const side of this.reels) for (const cab of side) if (cab.windows.indexOf(tower) >= 0) return cab;
      return null;
    }

    _updateProjectiles(dt) {
      const keep = [];
      for (const p of this.projectiles) {
        if (p.homing && p.target && p.target.hp > 0) {
          const dx = p.target.x - p.x, dy = p.target.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const spd = Math.hypot(p.vx, p.vy);
          p.vx = lerp(p.vx, dx / d * spd, 0.16);
          p.vy = lerp(p.vy, dy / d * spd, 0.16);
        }
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        let hit = false;
        if (p.target && Math.hypot(p.x - p.target.x, p.y - p.target.y) < 18) {
          hit = !p.pierce;
          const tgt = p.target;
          if (tgt.lane != null) {
            tgt.hp -= p.dmg;
            this.damage[p.owner] += p.dmg;
            if (p.owner === 0) HR.Save.data.stats.damage += p.dmg;
            if (p.onHit) p.onHit(p.dmg);
          } else if (tgt.alive) {
            this._hurt(tgt, this._cabOf(tgt), p.dmg);
            this.damage[p.owner] += p.dmg;
          }
          this.particles.push({ x: p.x, y: p.y, vx: rand(-40, 40), vy: rand(-40, 40), life: 0.22, color: p.color, r: 3 });
        }
        if (!hit && p.life > 0) keep.push(p);
      }
      this.projectiles = keep;
    }

    _fx(dt) {
      this.particles = this.particles.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; p.life -= dt; return p.life > 0; });
      this.floaters = this.floaters.filter((f) => { f.y += (f.vy || -30) * dt; f.t -= dt; return f.t > 0; });
    }
    _burst(x, y, color, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.28, sp = rand(40, 170);
        this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.2, 0.55), color, r: rand(2, 5) });
      }
    }

    _ai(dt) {
      this.aiT -= dt;
      if (this.aiT > 0) return;
      this.aiT = 0.75 / Math.max(0.4, this.difficulty);
      const s = 1;
      this.reels[s].forEach((cab) => {
        cab.windows.forEach((t, i) => {
          if (!t && this.chips[s] >= 80 && Math.random() < this.difficulty) {
            this.placeTower(s, cab, i, choice(this.loadout[s]));
          }
        });
      });
      if (this.spinCd[s] <= 0 && this.chips[s] >= 50 && Math.random() < 0.35) this.manualSpin(s);
      if (this.ddCd[s] <= 0 && this.elapsed > 35 && Math.random() < 0.15) this.doubleDown(s);
    }

    placeTower(side, cab, index, typeId) {
      if (cab.windows[index]) return false;
      if (this.chips[side] < 80) return false;
      if (side === 0 && this.player.unlockedTowers.indexOf(typeId) < 0) return false;
      cab.windows[index] = makeTower(typeId, side, side === 0 ? this.skin : 'wood');
      this.chips[side] -= 80;
      this._placeWindows(cab);
      HR.Audio.place();
      this._burst(cab.windows[index].x, cab.windows[index].y, HR.TOWERS[typeId].color, 10);
      if (side === 0 && this.livingTowers(0) >= 18 && !HR.Save.data.achievements.full_house) {
        HR.Save.data.achievements.full_house = Date.now();
        HR.Save.addChips(150);
      }
      return true;
    }

    upgradeInMatch(typeId) {
      const p = this.player;
      const lv = p.towerLevels[typeId] || 1;
      if (lv >= 4) return false;
      const cheap = ((HR.talentMods(typeId, p.talents[typeId] || {}).cheap) || 0);
      const c = Math.round(HR.UPGRADE_COST[lv] * (1 - cheap));
      if (this.chips[0] < c) return false;
      this.chips[0] -= c;
      p.towerLevels[typeId] = lv + 1;
      p.chipsSpent += c;
      this.reels[0].forEach((cab) => {
        cab.windows.forEach((t) => {
          if (t && t.type === typeId) {
            const st = HR.towerStats(typeId, t.level + 1, this.skin, p.talents[typeId] || {});
            const ratio = t.hp / t.maxHp;
            t.level += 1; t.maxHp = st.hp; t.hp = Math.max(1, st.hp * ratio);
            t.dmg = st.dmg; t.cd = st.cd; t.range = st.range; t.mods = st.mods;
          }
        });
      });
      HR.Save.persist();
      HR.Audio.upgrade();
      return true;
    }

    hitTestCab(x, y, side) {
      return this.reels[side].find((c) => Math.abs(x - c.x) < c.w / 2 && Math.abs(y - c.y) < c.h / 2 + 10) || null;
    }
    hitTestSlot(x, y, side) {
      const cab = this.hitTestCab(x, y, side);
      if (!cab) return null;
      let best = null, bd = 1e9;
      for (let i = 0; i < cab.slotCount; i++) {
        const n = cab.slotCount;
        const span = cab.w * 0.78;
        const sx = cab.x - span / 2 + (n === 1 ? 0 : span / (n - 1) * i);
        const d = Math.hypot(x - sx, y - cab.y);
        if (d < 52 && d < bd) { bd = d; best = { log: cab, cab, index: i, tower: cab.windows[i] }; }
      }
      return best;
    }

    _finish() {
      if (this.over) return;
      this.over = true; this.running = false;
      const pT = this.livingTowers(0), oT = this.livingTowers(1);
      let win;
      if (pT === 0 && oT > 0) win = false;
      else if (oT === 0 && pT > 0) win = true;
      else if (this.chips[0] !== this.chips[1]) win = this.chips[0] > this.chips[1];
      else win = true;
      const mvp = this.damage[0] >= this.damage[1];
      if (win && pT === 1) HR.Save.data.achievements.comeback = HR.Save.data.achievements.comeback || Date.now();
      if (win && this.elapsed < 180) HR.Save.data.achievements.speedster = HR.Save.data.achievements.speedster || Date.now();
      if (win && this.player.loadout && this.player.loadout.length === 9) HR.Save.data.achievements.loadout_ace = HR.Save.data.achievements.loadout_ace || Date.now();
      this.result = {
        win, mvp, oppName: this.oppName, oppTierIndex: this.oppTierIndex,
        chipsEarned: Math.round(this.chips[0] * 0.35 + (win ? 120 : 40)),
        duration: Math.round(this.elapsed), mode: this.mode,
        damage: Math.round(this.damage[0]), pTowers: pT, oTowers: oT, chips: Math.round(this.chips[0]),
      };
      if (win) HR.Audio.win(); else HR.Audio.lose();
      if (this.onOver) this.onOver(this.result);
    }

    draw(ctx, sw, sh) {
      const scale = Math.min(sw / W, sh / H);
      const ox = (sw - W * scale) / 2, oy = (sh - H * scale) / 2;
      this.view = { scale, ox, oy };
      ctx.save();
      ctx.translate(ox, oy); ctx.scale(scale, scale);
      if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 8 * this.shake, (Math.random() - 0.5) * 8 * this.shake);
      this._drawWorld(ctx);
      this.trackXs.forEach((x) => this._drawTrack(ctx, x));
      this.reels[1].forEach((c) => this._drawCab(ctx, c, true));
      this.reels[0].forEach((c) => this._drawCab(ctx, c, false));
      this.minions.forEach((m) => this._drawMinion(ctx, m));
      this.traps.forEach((tr) => {
        ctx.globalAlpha = 0.45; ctx.strokeStyle = '#6b8f4e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 16, 0, 6.28); ctx.stroke(); ctx.globalAlpha = 1;
      });
      this.projectiles.forEach((p) => {
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
      });
      this.particles.forEach((p) => {
        ctx.globalAlpha = clamp(p.life * 3, 0, 1); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1;
      });
      this.floaters.forEach((f) => {
        ctx.globalAlpha = clamp(f.t * 2, 0, 1); ctx.fillStyle = f.color;
        ctx.font = '800 ' + (f.size || 16) + 'px Georgia, serif';
        ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y); ctx.globalAlpha = 1;
      });
      ctx.restore();
    }

    _drawWorld(ctx) {
      ctx.fillStyle = '#1b2832'; ctx.fillRect(0, 0, W, H);
      if (this.bg) { ctx.globalAlpha = 0.55; ctx.drawImage(this.bg, 0, 0, W, H); ctx.globalAlpha = 1; }
      ctx.fillStyle = 'rgba(20,30,24,0.28)'; ctx.fillRect(0, 0, W, H / 2);
      ctx.strokeStyle = '#c9a227'; ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(50, H / 2); ctx.lineTo(W - 50, H / 2); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(244,233,208,0.14)';
      roundRect(ctx, W / 2 - 100, H / 2 - 16, 200, 32, 12); ctx.fill();
      ctx.fillStyle = '#f4e9d0'; ctx.font = '700 13px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('THE FELT', W / 2, H / 2 + 5);
    }

    _drawTrack(ctx, x) {
      const g = ctx.createLinearGradient(x, 140, x, H - 200);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.2, 'rgba(201,162,39,0.16)');
      g.addColorStop(0.5, 'rgba(107,143,78,0.28)');
      g.addColorStop(0.8, 'rgba(201,162,39,0.16)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(x - 16, 140, 32, H - 340);
      ctx.strokeStyle = 'rgba(244,233,208,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 16, 160); ctx.lineTo(x - 16, H - 210); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 16, 160); ctx.lineTo(x + 16, H - 210); ctx.stroke();
    }

    _drawCab(ctx, cab, dark) {
      const p = cab.spinning ? cab.spinT / cab.spinDur : 0;
      const squash = 1 - Math.sin(p * Math.PI) * 0.35;
      ctx.save();
      ctx.translate(cab.x + (Math.random() - 0.5) * cab.shake * 6, cab.y);
      ctx.scale(1, squash);
      const skin = HR.LOG_SKINS[cab.owner === 0 ? this.skin : 'wood'];
      const w = cab.w, h = cab.h;
      const grd = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      grd.addColorStop(0, skin.colors[0]); grd.addColorStop(0.5, skin.colors[1]); grd.addColorStop(1, skin.colors[0]);
      ctx.fillStyle = grd;
      ctx.shadowColor = skin.colors[2]; ctx.shadowBlur = 16;
      roundRect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = skin.colors[2]; ctx.lineWidth = 4; ctx.stroke();
      // slot-machine crown
      ctx.fillStyle = 'rgba(244,233,208,0.35)';
      roundRect(ctx, -w / 2 + 10, -h / 2 + 6, w - 20, 10, 4); ctx.fill();
      ctx.restore();

      for (let i = 0; i < cab.slotCount; i++) {
        const n = cab.slotCount;
        const span = cab.w * 0.78;
        const x = cab.x - span / 2 + (n === 1 ? 0 : span / (n - 1) * i);
        ctx.save(); ctx.translate(x, cab.y); ctx.scale(1, squash);
        ctx.beginPath(); ctx.arc(0, 0, cab.h * 0.36, 0, 6.28);
        ctx.fillStyle = '#1a140c'; ctx.fill();
        ctx.strokeStyle = 'rgba(240,215,140,0.45)'; ctx.lineWidth = 3; ctx.stroke();
        if (cab.blur > 0.15) {
          ctx.fillStyle = 'rgba(244,233,208,0.15)';
          for (let k = -2; k <= 2; k++) ctx.fillRect(-18, k * 14 * cab.blur, 36, 10);
        }
        ctx.restore();
        const t = cab.windows[i];
        if (t && (t.alive || t.crumble > 0) && cab.blur < 0.75) this._drawTower(ctx, t, squash);
        else if (!t) {
          ctx.fillStyle = 'rgba(244,233,208,0.35)'; ctx.font = '700 20px Georgia, serif';
          ctx.textAlign = 'center'; ctx.fillText('+', x, cab.y + 6);
        }
      }
      if (dark) {
        ctx.fillStyle = 'rgba(10,20,24,0.22)';
        roundRect(ctx, cab.x - cab.w / 2, cab.y - cab.h / 2, cab.w, cab.h, 22); ctx.fill();
      }
    }

    _drawTower(ctx, t, squash) {
      const def = t.def || HR.TOWERS[t.type];
      ctx.save();
      ctx.translate(t.x, t.y);
      if (t.crumble > 0) { ctx.rotate((0.4 - t.crumble) * 0.7); ctx.globalAlpha = t.crumble / 0.4; }
      ctx.scale(1, squash || 1);
      if (t.flash > 0) ctx.filter = 'brightness(1.8)';
      const r = t.r || 38;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28);
      ctx.fillStyle = def.color; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#2a1c10'; ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = def.accent; ctx.stroke();
      ctx.filter = 'none';
      ctx.fillStyle = '#f4e9d0'; ctx.font = '24px Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(def.symbol, 0, 1);
      const ratio = clamp(t.hp / t.maxHp, 0, 1);
      ctx.fillStyle = 'rgba(20,16,10,0.6)'; roundRect(ctx, -r, r + 3, r * 2, 6, 2); ctx.fill();
      ctx.fillStyle = ratio < 0.2 ? '#b43a3a' : ratio < 0.5 ? '#c9a227' : '#5aad6e';
      roundRect(ctx, -r, r + 3, r * 2 * ratio, 6, 2); ctx.fill();
      if (t.level > 1) {
        ctx.fillStyle = '#c9a227'; ctx.font = '800 9px system-ui'; ctx.fillText('Lv' + t.level, 0, -r - 7);
      }
      ctx.restore();
    }

    _drawMinion(ctx, m) {
      ctx.save(); ctx.translate(m.x, m.y);
      const col = m.owner === 0 ? '#7ec8e3' : '#c45c26';
      ctx.fillStyle = col; ctx.strokeStyle = '#2a1c10'; ctx.lineWidth = 3;
      roundRect(ctx, -11, -13, 22, 26, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1a140c'; ctx.fillRect(-5, -5, 3, 3); ctx.fillRect(2, -5, 3, 3);
      if (m.marked > 0) { ctx.strokeStyle = '#f0d78c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.28); ctx.stroke(); }
      const ratio = m.hp / m.maxHp;
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-11, 15, 22, 3);
      ctx.fillStyle = '#5aad6e'; ctx.fillRect(-11, 15, 22 * ratio, 3);
      ctx.restore();
    }

    screenToWorld(px, py) {
      const v = this.view || { scale: 1, ox: 0, oy: 0 };
      return { x: (px - v.ox) / v.scale, y: (py - v.oy) / v.scale };
    }
  }

  HR.Match = Match;
})(window);
