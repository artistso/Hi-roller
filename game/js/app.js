/* Hi Roller — splash, menus, talents, loadout, match loop */
(function (g) {
  'use strict';
  const HR = g.HR;
  const $ = (id) => document.getElementById(id);
  const SCREEN_IDS = ['splash','home','match','shop','profile','leaderboard','tournament','achievements','settings','result','loadout','talents','collection','guide','roadmap','about'];
  const screens = {};

  const App = {
    match: null, shopTab: 'upgrades', lbTab: 'rank', lastMode: 'ranked',
    currentScreen: 'splash', paused: false, deferredInstall: null,
    raf: 0, lastT: 0, talentTower: null, loadoutPick: 0,
    pointer: { down: false, x: 0, y: 0, sx: 0, sy: 0, lastTap: 0, lastSlot: null },

    boot() {
      SCREEN_IDS.forEach((n) => { screens[n] = $('screen-' + n); });
      HR.Save.load();
      this.bind();
      this.refreshHome();
      this.applyAudio();
      this.applyPreferences();
      this.weekTourney();
      if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
      if (HR.Save.data.splashSeen) this.show('home');
    },

    applyAudio() {
      const s = HR.Save.data.settings;
      HR.Audio.setMusic(s.music);
      HR.Audio.setSfx(s.sfx);
    },

    bind() {
      document.body.addEventListener('pointerdown', () => {
        HR.Audio.unlock();
        HR.Audio.setMusic(HR.Save.data.settings.music);
      });
      $('screen-splash').addEventListener('pointerdown', () => {
        HR.Save.data.splashSeen = true; HR.Save.persist();
        HR.Audio.unlock(); HR.Audio.setMode('menu'); this.applyAudio();
        this.show('home');
      });
      $('btn-play').onclick = () => this.startMatch('ranked');
      document.querySelectorAll('[data-go]').forEach((el) => {
        el.onclick = () => {
          HR.Audio.click();
          const go = el.getAttribute('data-go');
          if (go === 'practice') this.startMatch('practice');
          else if (go === 'ranked') this.startMatch('ranked');
          else this.show(go);
        };
      });
      document.querySelectorAll('[data-back]').forEach((el) => el.onclick = () => { HR.Audio.click(); this.show('home'); });
      $('btn-settings').onclick = () => { HR.Audio.click(); this.show('settings'); };
      $('btn-guide-practice').onclick = () => this.startMatch('practice');
      $('btn-pause').onclick = (e) => { e.stopPropagation(); this.openPause(); };
      $('shop-tabs').onclick = (e) => { const t = e.target.closest('[data-tab]'); if (!t) return; this.shopTab = t.getAttribute('data-tab'); this.renderShop(); };
      $('lb-tabs').onclick = (e) => { const t = e.target.closest('[data-lb]'); if (!t) return; this.lbTab = t.getAttribute('data-lb'); this.renderLeaderboard(); };
      $('btn-save-name').onclick = () => {
        HR.Save.data.username = $('inp-name').value.trim().slice(0, 16) || 'Wanderer';
        HR.Save.persist(); this.refreshHome(); this.toast('Name saved');
      };
      $('sw-music').onclick = () => this.toggle('music', 'sw-music');
      $('sw-sfx').onclick = () => this.toggle('sfx', 'sw-sfx');
      $('sw-haptics').onclick = () => this.toggle('haptics', 'sw-haptics');
      $('sw-motion').onclick = () => this.togglePreference('reducedMotion', 'sw-motion');
      $('sw-contrast').onclick = () => this.togglePreference('highContrast', 'sw-contrast');
      $('sw-gfx').onclick = () => {
        const s = HR.Save.data.settings;
        s.gfx = s.gfx === 'high' ? 'low' : 'high';
        HR.Save.persist(); $('sw-gfx').classList.toggle('on', s.gfx === 'high');
      };
      $('btn-reset').onclick = () => { if (confirm('Wipe local profile?')) { HR.Save.reset(); this.refreshHome(); this.show('home'); } };
      $('btn-register').onclick = () => this.registerTourney();
      $('btn-tourney-play').onclick = () => this.startMatch('tournament');
      $('btn-result-home').onclick = () => this.show('home');
      $('btn-result-again').onclick = () => this.startMatch(this.lastMode);
      $('btn-spin').onclick = (e) => { e.stopPropagation(); if (this.match) this.match.manualSpin(0); this.syncHud(); };
      $('btn-dd').onclick = (e) => { e.stopPropagation(); if (this.match) this.match.doubleDown(0); this.syncHud(); };
      $('btn-emote').onclick = (e) => { e.stopPropagation(); this.doEmote(); };
      $('btn-match-shop').onclick = (e) => { e.stopPropagation(); this.openMatchShop(); };
      $('btn-install').onclick = () => this.installWebApp();
      const cv = $('cv');
      cv.addEventListener('pointerdown', (e) => this.onDown(e));
      cv.addEventListener('pointermove', (e) => this.onMove(e));
      cv.addEventListener('pointerup', (e) => this.onUp(e));
      cv.addEventListener('pointercancel', (e) => this.onUp(e));
      window.addEventListener('resize', () => this.fitCanvas());
      window.addEventListener('hiroller:back', () => this.handleBack());
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.deferredInstall = event;
        $('btn-install').classList.remove('hidden');
      });
      window.addEventListener('appinstalled', () => {
        this.deferredInstall = null;
        $('btn-install').classList.add('hidden');
        this.toast('Hi Roller installed');
      });
      $('modal').onclick = (e) => { if (e.target.id === 'modal') this.closeModal(); };
    },

    toggle(key, id) {
      const s = HR.Save.data.settings;
      s[key] = !s[key];
      HR.Save.persist();
      $(id).classList.toggle('on', s[key]);
      this.applyAudio();
      HR.Audio.click();
    },

    togglePreference(key, id) {
      const s = HR.Save.data.settings;
      s[key] = !s[key];
      HR.Save.persist();
      $(id).classList.toggle('on', s[key]);
      $(id).setAttribute('aria-pressed', String(!!s[key]));
      this.applyPreferences();
      HR.Audio.click();
    },

    applyPreferences() {
      const s = HR.Save.data.settings;
      document.body.classList.toggle('reduce-motion', !!s.reducedMotion);
      document.body.classList.toggle('high-contrast', !!s.highContrast);
    },

    async installWebApp() {
      if (!this.deferredInstall) return this.toast('Use your browser menu to install Hi Roller');
      this.deferredInstall.prompt();
      await this.deferredInstall.userChoice;
      this.deferredInstall = null;
      $('btn-install').classList.add('hidden');
    },

    show(name) {
      this.currentScreen = name;
      this.paused = false;
      this.closeModal(false);
      Object.keys(screens).forEach((k) => { if (screens[k]) screens[k].classList.toggle('hidden', k !== name); });
      if (name === 'home') { this.refreshHome(); HR.Audio.setMode('menu'); }
      if (name === 'shop') this.renderShop();
      if (name === 'profile') this.renderProfile();
      if (name === 'leaderboard') this.renderLeaderboard();
      if (name === 'tournament') this.renderTourney();
      if (name === 'achievements') this.renderAchievements();
      if (name === 'settings') this.renderSettings();
      if (name === 'loadout') this.renderLoadout();
      if (name === 'talents') this.renderTalents();
      if (name === 'collection') this.renderCollection();
      if (name !== 'match') this.stopLoop();
    },

    handleBack() {
      if (!$('modal').classList.contains('hidden')) return this.closeModal();
      if (this.currentScreen === 'match') return this.openPause();
      if (this.currentScreen !== 'home') return this.show('home');
      if (window.HiRollerAndroid && typeof window.HiRollerAndroid.closeApp === 'function') {
        window.HiRollerAndroid.closeApp();
      }
    },

    refreshHome() {
      const p = HR.Save.data;
      const tier = HR.tierFor(p.rank);
      $('home-name').textContent = p.username;
      $('home-rank').textContent = tier.name + ' · Lv ' + p.level;
      $('home-chips').textContent = Math.floor(p.chips).toLocaleString();
      document.querySelectorAll('.live-chips').forEach((el) => el.textContent = Math.floor(p.chips).toLocaleString());
      this.setAvatar($('home-avatar'), p.avatar);
    },

    setAvatar(imgEl, id) {
      const a = HR.AVATARS.find((x) => x.id === id) || HR.AVATARS[0];
      if (a.src) {
        imgEl.src = a.src; imgEl.style.display = 'block';
        if (imgEl.nextElementSibling && imgEl.nextElementSibling.classList.contains('avatar-fallback')) imgEl.nextElementSibling.remove();
      } else {
        imgEl.style.display = 'none';
        let fb = imgEl.nextElementSibling;
        if (!fb || !fb.classList.contains('avatar-fallback')) { fb = document.createElement('div'); fb.className = 'avatar-fallback'; imgEl.after(fb); }
        fb.style.background = a.color || '#333'; fb.textContent = a.initials || '?';
      }
    },
    avatarNode(id, size) {
      const a = HR.AVATARS.find((x) => x.id === id) || HR.AVATARS[0];
      if (a.src) return '<img src="' + a.src + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:12px;object-fit:cover;border:1px solid var(--gold)" />';
      return '<div class="avatar-fallback" style="width:' + size + 'px;height:' + size + 'px;background:' + (a.color || '#333') + '">' + (a.initials || '?') + '</div>';
    },
    toast(msg) {
      const host = $('toasts') || document.body;
      const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
      if (host.id === 'toasts') host.appendChild(el);
      else { el.style.position = 'fixed'; el.style.left = '50%'; el.style.top = '18%'; el.style.transform = 'translateX(-50%)'; el.style.zIndex = 50; document.body.appendChild(el); }
      setTimeout(() => el.remove(), 2400);
    },

    famTabs(hostId, onPick, current) {
      const host = $(hostId); if (!host) return;
      host.innerHTML = '<button class="tab ' + (!current ? 'on' : '') + '" data-fam="">All</button>' +
        HR.FAMILY_ORDER.map((f) => '<button class="tab ' + (current === f ? 'on' : '') + '" data-fam="' + f + '">' + HR.FAMILIES[f].name + '</button>').join('');
      host.onclick = (e) => { const t = e.target.closest('[data-fam]'); if (!t) return; onPick(t.getAttribute('data-fam')); };
    },

    /* ----- LOADOUT ----- */
    renderLoadout() {
      const p = HR.Save.data;
      const strip = $('loadout-strip');
      strip.innerHTML = '';
      for (let i = 0; i < HR.LOADOUT_SIZE; i++) {
        const id = p.loadout[i];
        const t = id && HR.TOWERS[id];
        const el = document.createElement('div');
        el.className = 'slot' + (this.loadoutPick === i ? ' on' : '');
        el.innerHTML = '<div class="n">' + (i + 1) + '</div><div>' + (t ? t.symbol : '—') + '</div>';
        el.onclick = () => { this.loadoutPick = i; this.renderLoadout(); };
        strip.appendChild(el);
      }
      this._fam = this._fam || '';
      this.famTabs('loadout-fams', (f) => { this._fam = f; this.renderLoadout(); }, this._fam);
      const pool = $('loadout-pool');
      const ids = HR.TOWER_ORDER.filter((id) => (!this._fam || HR.TOWERS[id].family === this._fam) && p.unlockedTowers.indexOf(id) >= 0);
      pool.innerHTML = ids.map((id) => {
        const t = HR.TOWERS[id];
        const on = p.loadout.indexOf(id) >= 0;
        return '<div class="card"><div class="art">' + t.symbol + '</div><h3>' + t.name + '</h3><p>' + t.role + ' · ' + t.ability + '</p>' +
          (on ? '<div class="owned">ON STRIP</div>' : '<button class="btn" onclick="HR.App.putLoadout(\'' + id + '\')">SET SLOT ' + (this.loadoutPick + 1) + '</button></div>');
      }).join('');
    },
    putLoadout(id) {
      const p = HR.Save.data;
      const next = p.loadout.slice();
      while (next.length < HR.LOADOUT_SIZE) next.push(p.unlockedTowers[0]);
      next[this.loadoutPick] = id;
      HR.Save.setLoadout(next);
      HR.Audio.place();
      this.renderLoadout();
    },

    /* ----- TALENTS ----- */
    renderTalents() {
      const p = HR.Save.data;
      $('tp-pill').textContent = p.talentPoints + ' TP';
      if (this.talentTower) return this.drawTree(this.talentTower);
      $('talent-tree').classList.add('hidden');
      $('talent-list').classList.remove('hidden');
      this._tfam = this._tfam || '';
      this.famTabs('talent-fams', (f) => { this._tfam = f; this.talentTower = null; this.renderTalents(); }, this._tfam);
      const ids = HR.TOWER_ORDER.filter((id) => (!this._tfam || HR.TOWERS[id].family === this._tfam) && p.unlockedTowers.indexOf(id) >= 0);
      $('talent-list').innerHTML = ids.map((id) => {
        const t = HR.TOWERS[id];
        const n = Object.keys(p.talents[id] || {}).length;
        return '<div class="row" onclick="HR.App.openTree(\'' + id + '\')"><div style="font-size:22px">' + t.symbol + '</div><div class="grow"><div class="title">' + t.name + '</div><div class="desc">' + t.family + ' · ' + n + '/10 nodes</div></div><div class="price">TREE</div></div>';
      }).join('') || '<div class="desc">Unlock towers first.</div>';
    },
    openTree(id) { this.talentTower = id; this.renderTalents(); },
    drawTree(id) {
      const p = HR.Save.data;
      const t = HR.TOWERS[id];
      const tree = HR.treeFor(id);
      const have = p.talents[id] || {};
      $('talent-list').classList.add('hidden');
      const wrap = $('talent-tree');
      wrap.classList.remove('hidden');
      wrap.innerHTML = '<div style="padding:8px 12px;display:flex;gap:8px;align-items:center"><button class="icon-btn" onclick="HR.App.talentTower=null;HR.App.renderTalents()">←</button><b>' + t.symbol + ' ' + t.name + '</b><span class="desc" style="flex:1">' + t.desc + '</span></div>';
      const stage = document.createElement('div');
      stage.style.position = 'relative'; stage.style.height = '72%';
      tree.nodes.forEach((n) => {
        const el = document.createElement('div');
        el.className = 'tree-node' + (have[n.id] ? ' have' : (n.req.every((r) => have[r]) ? ' can' : ''));
        el.style.left = n.x + '%'; el.style.top = n.y + '%';
        el.innerHTML = '<b>' + n.name + '</b>' + n.cost + ' TP';
        el.title = n.desc;
        el.onclick = () => {
          if (HR.Save.unlockTalent(id, n.id)) { HR.Audio.upgrade(); this.drawTree(id); $('tp-pill').textContent = HR.Save.data.talentPoints + ' TP'; this.toast(n.name); }
          else this.toast(have[n.id] ? 'Already learned' : 'Need points / earlier nodes');
        };
        stage.appendChild(el);
      });
      wrap.appendChild(stage);
    },

    /* ----- COLLECTION ----- */
    renderCollection() {
      const p = HR.Save.data;
      $('col-count').textContent = p.unlockedTowers.length + '/100';
      this._cfam = this._cfam || '';
      this.famTabs('col-fams', (f) => { this._cfam = f; this.renderCollection(); }, this._cfam);
      const ids = HR.TOWER_ORDER.filter((id) => !this._cfam || HR.TOWERS[id].family === this._cfam);
      $('col-grid').innerHTML = ids.map((id) => {
        const t = HR.TOWERS[id];
        const own = p.unlockedTowers.indexOf(id) >= 0;
        return '<div class="card"><div class="art">' + (own ? t.symbol : '🔒') + '</div><h3>' + t.name + '</h3><p>' + (own ? t.desc : ('Lv ' + t.unlockLevel)) + '</p>' +
          (own ? '<button class="btn" onclick="HR.App.openTree(\'' + id + '\');HR.App.show(\'talents\')">TALENTS</button></div>' : '<div class="locked">LOCKED</div></div>');
      }).join('');
    },

    /* ----- MATCH ----- */
    startMatch(mode) {
      this.lastMode = mode;
      this.paused = false;
      HR.Audio.unlock(); HR.Audio.setMode('battle'); this.applyAudio();
      const p = HR.Save.data;
      let oppTier = HR.tierIndex(p.rank);
      let diff = 0.62;
      let dur = mode === 'practice' ? HR.PRACTICE_SECONDS : HR.MATCH_SECONDS;
      if (mode === 'ranked') { oppTier = clamp(oppTier + ((Math.random() * 3) | 0) - 1, 0, 5); diff = 0.65 + oppTier * 0.07; }
      if (mode === 'tournament') { const round = p.tournament.round || 0; oppTier = Math.min(5, 1 + round); diff = 0.72 + round * 0.06; }
      const opp = HR.BOT_NAMES[(Math.random() * HR.BOT_NAMES.length) | 0];
      this.match = new HR.Match({ mode, duration: dur, oppName: opp, oppTierIndex: oppTier, difficulty: diff });
      this.match.onOver = (res) => this.onMatchOver(res);
      this.show('match');
      this.fitCanvas(); this.syncHud();
      $('countdown').classList.remove('hidden');
      $('hint').classList.toggle('hidden', !!p.tutorialDone);
      if (!p.tutorialDone) {
        $('hint').textContent = 'Tracks run between windows. Tap to upgrade · swipe a cabinet to spin the reels · double-tap empty to place from your strip';
        setTimeout(() => { p.tutorialDone = true; HR.Save.persist(); $('hint').classList.add('hidden'); }, 7000);
      }
      this.lastT = performance.now();
      cancelAnimationFrame(this.raf);
      const loop = (t) => {
        const dt = Math.min(0.05, (t - this.lastT) / 1000);
        this.lastT = t;
        if (this.match) {
          if (!this.paused) this.match.update(dt);
          const cv = $('cv'); const ctx = cv.getContext('2d');
          ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.save();
          const dpr = this._dpr || 1; ctx.scale(dpr, dpr);
          this.match.draw(ctx, cv.width / dpr, cv.height / dpr);
          ctx.restore();
          this.syncHud();
          const cd = this.match.countdown;
          if (cd > 0) {
            $('countdown').classList.remove('hidden');
            $('countdown').querySelector('b').textContent = cd > 2 ? '3' : cd > 1 ? '2' : cd > 0.15 ? '1' : 'HI';
          } else $('countdown').classList.add('hidden');
        }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },
    stopLoop() { cancelAnimationFrame(this.raf); },
    fitCanvas() {
      const cv = $('cv'); if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, HR.Save.data.settings.gfx === 'low' ? 1.25 : 2.5);
      this._dpr = dpr;
      const w = window.innerWidth, h = window.innerHeight;
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
    },
    syncHud() {
      const m = this.match; if (!m) return;
      $('hud-opp-name').textContent = m.oppName;
      $('hud-opp-chips').textContent = Math.floor(m.chips[1]);
      $('hud-opp-towers').textContent = m.livingTowers(1);
      $('hud-chips').textContent = Math.floor(m.chips[0]);
      $('hud-lv').textContent = HR.Save.data.level;
      const t = Math.ceil(m.timeLeft); const mm = (t / 60) | 0, ss = t % 60;
      $('hud-timer').textContent = mm + ':' + (ss < 10 ? '0' : '') + ss;
      this._cdBar('btn-spin', m.spinCd[0], 10);
      this._cdBar('btn-dd', m.ddCd[0], 20);
      $('btn-spin').classList.toggle('ready', m.spinCd[0] <= 0 && m.chips[0] >= 50);
      $('btn-dd').classList.toggle('ready', m.ddCd[0] <= 0);
    },
    _cdBar(id, left, max) { const el = $(id).querySelector('.cd'); el.style.transform = left <= 0 ? 'scaleY(0)' : 'scaleY(' + (left / max) + ')'; },
    onDown(e) { const r = $('cv').getBoundingClientRect(); this.pointer.down = true; this.pointer.sx = this.pointer.x = e.clientX - r.left; this.pointer.sy = this.pointer.y = e.clientY - r.top; },
    onMove(e) { if (!this.pointer.down) return; const r = $('cv').getBoundingClientRect(); this.pointer.x = e.clientX - r.left; this.pointer.y = e.clientY - r.top; },
    onUp() {
      if (!this.pointer.down || !this.match) { this.pointer.down = false; return; }
      this.pointer.down = false;
      const dx = this.pointer.x - this.pointer.sx, dy = this.pointer.y - this.pointer.sy;
      const w = this.match.screenToWorld(this.pointer.sx, this.pointer.sy);
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        const cab = this.match.hitTestCab(w.x, w.y, 0);
        if (cab) this.match.manualSpin(0);
        return;
      }
      const slot = this.match.hitTestSlot(w.x, w.y, 0);
      const tnow = performance.now();
      if (slot && this.pointer.lastSlot && this.pointer.lastSlot.cab === slot.cab && this.pointer.lastSlot.index === slot.index && tnow - this.pointer.lastTap < 320) {
        if (!slot.tower) this.openPlacer(slot);
        this.pointer.lastTap = 0; return;
      }
      this.pointer.lastTap = tnow; this.pointer.lastSlot = slot;
      if (slot && slot.tower) this.openUpgrade(slot.tower);
      else if (slot && !slot.tower) this.toast('Double-tap to place from your strip (80 chips)');
    },
    openPlacer(slot) {
      const p = HR.Save.data;
      let html = '<button class="icon-btn close" onclick="HR.App.closeModal()">✕</button><h3 class="display">PLACE FROM STRIP</h3><p style="color:var(--muted)">80 chips. These are the nine on your reel.</p><div class="shop-grid">';
      (p.loadout || []).forEach((id) => {
        const t = HR.TOWERS[id]; if (!t) return;
        html += '<div class="card"><div class="art">' + t.symbol + '</div><h3>' + t.name + '</h3><p>' + t.role + '</p><button class="btn" onclick="HR.App.confirmPlace(\'' + id + '\')">PLACE</button></div>';
      });
      html += '</div>';
      this._placeTarget = slot; this.openModal(html);
    },
    confirmPlace(id) {
      const s = this._placeTarget; if (!s) return;
      if (this.match.placeTower(0, s.cab || s.log, s.index, id)) this.closeModal();
      else this.toast('Not enough chips');
    },
    openUpgrade(tower) {
      const def = HR.TOWERS[tower.type];
      const p = HR.Save.data;
      const lv = (this.match && this.match.matchLevels[0][tower.type]) || tower.level || 1;
      const cheap = (HR.talentMods(tower.type, p.talents[tower.type] || {}).cheap) || 0;
      const next = lv >= 4 ? null : Math.round(HR.UPGRADE_COST[lv] * (1 - cheap));
      this.openModal([
        '<button class="icon-btn close" onclick="HR.App.closeModal()">✕</button>',
        '<h3 class="display">' + def.symbol + ' ' + def.name + '</h3>',
        '<p style="color:var(--muted)">' + def.desc + ' · ' + def.ability + '</p>',
        '<div class="stat-grid"><div class="panel"><div class="k">HP</div><div class="v">' + Math.round(tower.hp) + '/' + tower.maxHp + '</div></div>',
        '<div class="panel"><div class="k">DMG</div><div class="v">' + tower.dmg.toFixed(1) + '</div></div>',
        '<div class="panel"><div class="k">Range</div><div class="v">' + Math.round(tower.range) + '</div></div>',
        '<div class="panel"><div class="k">This match</div><div class="v">' + lv + '/4</div></div></div>',
        lv >= 4 ? '<div class="owned">MAXED IN-MATCH</div>' :
          '<button class="btn primary" style="width:100%" onclick="HR.App.confirmUpgrade(\'' + tower.type + '\')">IN-MATCH UPGRADE ' + next + '</button>',
        '<p style="color:var(--muted);font-size:12px;margin-top:8px">Talent trees are in the menu — spend TP between matches.</p>',
      ].join(''));
    },
    confirmUpgrade(type) {
      if (this.match && this.match.upgradeInMatch(type)) { this.closeModal(); this.toast('Upgraded'); }
      else this.toast('Need more chips');
    },
    openMatchShop() {
      const p = HR.Save.data;
      let html = '<button class="icon-btn close" onclick="HR.App.closeModal()">✕</button><h3 class="display">IN-HAND UPGRADES</h3><p style="color:var(--muted)">Last for this match. Paid with match chips. Workshop levels set your starting point.</p><div class="shop-grid">';
      (p.loadout || []).forEach((id) => {
        const t = HR.TOWERS[id]; if (!t) return;
        const lv = (this.match && this.match.matchLevels[0][id]) || p.towerLevels[id] || 1;
        const cost = lv >= 4 ? 'MAX' : HR.UPGRADE_COST[lv];
        html += '<div class="card"><div class="art">' + t.symbol + '</div><h3>' + t.name + '</h3><p>Lv ' + lv + '</p>';
        html += lv >= 4 ? '<div class="owned">MAX</div></div>' : '<button class="btn" onclick="HR.App.confirmUpgrade(\'' + id + '\')">' + cost + '</button></div>';
      });
      html += '</div>';
      this.openModal(html);
    },
    openModal(html) {
      $('sheet').innerHTML = html;
      $('modal').classList.remove('hidden');
      if (this.currentScreen === 'match') this.paused = true;
    },
    closeModal(resume = true) {
      $('modal').classList.add('hidden');
      if (resume && this.currentScreen === 'match') this.paused = false;
    },
    openPause() {
      if (!this.match) return this.show('home');
      this.openModal([
        '<h3 class="display">TABLE PAUSED</h3>',
        '<p style="color:var(--muted)">The solo simulation is frozen while this drawer is open.</p>',
        '<button class="btn primary" style="width:100%" onclick="HR.App.closeModal()">RESUME</button>',
        '<button class="btn ghost" style="width:100%;margin-top:8px" onclick="HR.App.leaveMatch()">LEAVE MATCH</button>',
      ].join(''));
    },
    leaveMatch() {
      this.match = null;
      this.closeModal(false);
      this.show('home');
    },
    doEmote() {
      const m = this.match; if (!m || m.emoteT > 0) return;
      m.emoteT = 2;
      const em = HR.EMOTES.find((e) => e.id === HR.Save.data.selectedEmote) || HR.EMOTES[0];
      const el = document.createElement('div'); el.className = 'emote-pop'; el.textContent = em.glyph;
      el.style.left = '62%'; el.style.bottom = '22%'; $('hud').appendChild(el);
      setTimeout(() => el.remove(), 1600);
      HR.Save.data.stats.emotesUsed++; HR.Audio.chip();
    },
    onMatchOver(res) {
      this.closeModal();
      setTimeout(() => {
        const rec = HR.Save.recordMatch(res);
        if (this.lastMode === 'tournament') this.resolveTourney(res.win);
        HR.Audio.setMode('menu');
        $('res-mode').textContent = this.lastMode.toUpperCase();
        $('res-title').textContent = res.win ? 'YOU WIN' : 'BUST';
        $('res-sub').textContent = 'vs ' + res.oppName + (res.mvp ? ' · MVP' : '');
        $('res-chips').textContent = '+' + res.chipsEarned;
        $('res-xp').textContent = '+' + rec.xp;
        $('res-rank').textContent = (rec.delta >= 0 ? '+' : '') + rec.delta;
        $('res-dmg').textContent = Math.round(res.damage);
        this.show('result'); this.refreshHome();
      }, 700);
    },

    renderShop() {
      const p = HR.Save.data;
      document.querySelectorAll('#shop-tabs .tab').forEach((t) => t.classList.toggle('on', t.getAttribute('data-tab') === this.shopTab));
      document.querySelectorAll('.live-chips').forEach((el) => el.textContent = Math.floor(p.chips).toLocaleString());
      const body = $('shop-body');
      let html = '';
      const close = (inner) => inner + '</div>';
      if (this.shopTab === 'upgrades') {
        (p.loadout || HR.STARTER_TOWERS).forEach((id) => {
          const t = HR.TOWERS[id]; if (!t) return;
          const lv = p.towerLevels[id] || 1;
          const cost = lv >= 4 ? null : HR.UPGRADE_COST[lv];
          html += '<div class="card"><div class="art">' + t.symbol + '</div><h3>' + t.name + '</h3><p>Workshop starting level ' + lv + '/4</p>';
          html += !cost ? close('<div class="owned">MAX</div>') : close('<button class="btn" onclick="HR.App.buyUpgrade(\'' + id + '\')">' + cost + '</button>');
        });
      } else if (this.shopTab === 'skins') {
        Object.values(HR.LOG_SKINS).forEach((s) => {
          const own = p.skins.indexOf(s.id) >= 0, eq = p.selectedSkin === s.id;
          html += '<div class="card"><div class="art" style="background:' + s.colors[1] + '"></div><h3>' + s.name + '</h3><p>Cabinet skin</p>';
          if (eq) html += close('<div class="owned">EQUIPPED</div>');
          else if (own) html += close('<button class="btn" onclick="HR.App.equip(\'skin\',\'' + s.id + '\')">EQUIP</button>');
          else if (s.exclusive) html += close('<div class="locked">TOURNAMENT</div>');
          else html += close('<button class="btn" onclick="HR.App.buy(\'skin\',\'' + s.id + '\',' + s.cost + ')">' + s.cost + '</button>');
        });
      } else if (this.shopTab === 'themes') {
        Object.values(HR.THEMES).forEach((th) => {
          const own = p.themes.indexOf(th.id) >= 0, eq = p.selectedTheme === th.id;
          html += '<div class="card"><div class="art" style="background:' + th.felt + '"></div><h3>' + th.name + '</h3><p>Wilds theme</p>';
          if (eq) html += close('<div class="owned">EQUIPPED</div>');
          else if (own) html += close('<button class="btn" onclick="HR.App.equip(\'theme\',\'' + th.id + '\')">EQUIP</button>');
          else html += close('<button class="btn" onclick="HR.App.buy(\'theme\',\'' + th.id + '\',' + th.cost + ')">' + th.cost + '</button>');
        });
      } else if (this.shopTab === 'avatars') {
        HR.AVATARS.forEach((a) => {
          const own = p.avatars.indexOf(a.id) >= 0, eq = p.avatar === a.id;
          html += '<div class="card"><div class="art">' + (a.src ? '<img src="' + a.src + '" alt="" />' : (a.initials || '')) + '</div><h3>' + a.name + '</h3><p></p>';
          if (eq) html += close('<div class="owned">EQUIPPED</div>');
          else if (own) html += close('<button class="btn" onclick="HR.App.equip(\'avatar\',\'' + a.id + '\')">EQUIP</button>');
          else if (a.unlock.type === 'chips') html += close('<button class="btn" onclick="HR.App.buy(\'avatar\',\'' + a.id + '\',' + a.unlock.cost + ')">' + a.unlock.cost + '</button>');
          else html += close('<div class="locked">LOCKED</div>');
        });
      } else {
        HR.EMOTES.forEach((e) => {
          const own = p.emotes.indexOf(e.id) >= 0, eq = p.selectedEmote === e.id;
          html += '<div class="card"><div class="art">' + e.glyph + '</div><h3>' + e.name + '</h3><p>Taunt</p>';
          if (eq) html += close('<div class="owned">EQUIPPED</div>');
          else if (own) html += close('<button class="btn" onclick="HR.App.equip(\'emote\',\'' + e.id + '\')">EQUIP</button>');
          else html += close('<button class="btn" onclick="HR.App.buy(\'emote\',\'' + e.id + '\',' + e.cost + ')">' + e.cost + '</button>');
        });
      }
      body.innerHTML = html;
    },
    buyUpgrade(id) {
      const p = HR.Save.data; const lv = p.towerLevels[id] || 1; if (lv >= 4) return;
      if (!HR.Save.spend(HR.UPGRADE_COST[lv])) return this.toast('Not enough chips');
      p.towerLevels[id] = lv + 1; HR.Save.persist(); HR.Save.checkAchievements(); HR.Audio.upgrade(); this.renderShop(); this.refreshHome();
    },
    buy(kind, id, cost) {
      if (!HR.Save.spend(cost)) return this.toast('Not enough chips');
      HR.Save.grant(id, kind); HR.Audio.chip(); this.toast('Purchased'); this.renderShop(); this.refreshHome();
    },
    equip(kind, id) {
      const p = HR.Save.data;
      if (kind === 'skin') p.selectedSkin = id;
      if (kind === 'theme') p.selectedTheme = id;
      if (kind === 'avatar') p.avatar = id;
      if (kind === 'emote') p.selectedEmote = id;
      HR.Save.persist(); HR.Audio.click(); this.renderShop(); this.refreshHome();
    },

    renderProfile() {
      const p = HR.Save.data;
      const tier = HR.tierFor(p.rank);
      const next = HR.TIERS[Math.min(HR.TIERS.length - 1, HR.tierIndex(p.rank) + 1)];
      const span = next.min === tier.min ? 1 : next.min - tier.min;
      $('prof-av').innerHTML = this.avatarNode(p.avatar, 96);
      $('prof-name').textContent = p.username; $('prof-tier').textContent = tier.name;
      $('prof-rankpts').textContent = p.rank + ' RP';
      $('prof-bar').style.width = Math.min(100, ((p.rank - tier.min) / span) * 100) + '%';
      $('prof-lv').textContent = p.level; $('prof-wl').textContent = p.wins + '–' + p.losses;
      $('prof-st').textContent = p.streak; $('prof-peak').textContent = HR.tierFor(p.peakRank).name;
      $('prof-hist').innerHTML = (p.matchHistory.length ? p.matchHistory : [{ mode: 'none' }]).slice(0, 12).map((h) => {
        if (h.mode === 'none') return '<div class="desc">No matches yet.</div>';
        return '<div class="row"><div class="grow"><div class="title">' + (h.win ? 'WIN' : 'LOSS') + ' vs ' + h.opp + '</div><div class="desc">' + h.mode + '</div></div><div class="price">' + (h.delta >= 0 ? '+' : '') + h.delta + ' RP</div></div>';
      }).join('');
    },
    renderLeaderboard() {
      document.querySelectorAll('#lb-tabs .tab').forEach((t) => t.classList.toggle('on', t.getAttribute('data-lb') === this.lbTab));
      const p = HR.Save.data;
      const you = { name: p.username, rank: p.rank, wins: p.wins, chips: p.totalChipsEarned, streak: p.bestStreak, you: true };
      const key = this.lbTab === 'rank' ? 'rank' : this.lbTab === 'wins' ? 'wins' : this.lbTab === 'chips' ? 'chips' : 'streak';
      const rows = HR.FAKE_LEADERS.map((x) => Object.assign({ streak: 3 }, x)).concat([you]).sort((a, b) => b[key] - a[key]);
      $('lb-body').innerHTML = rows.map((r, i) => '<div class="row ' + (r.you ? 'you' : '') + '"><div style="width:28px;color:var(--gold)">' + (i + 1) + '</div><div class="grow"><div class="title">' + r.name + (r.you ? ' (you)' : '') + '</div><div class="desc">' + HR.tierFor(r.rank).name + '</div></div><div class="price">' + (r[key] || 0).toLocaleString() + '</div></div>').join('');
    },
    renderAchievements() {
      const p = HR.Save.data; let got = 0;
      $('ach-grid').innerHTML = HR.ACHIEVEMENTS.map((a) => { const on = !!p.achievements[a.id]; if (on) got++; return '<div class="ach ' + (on ? 'got' : '') + '"><div class="ic">' + a.icon + '</div><h4>' + a.name + '</h4><p>' + a.desc + '</p></div>'; }).join('');
      $('ach-count').textContent = got + '/' + HR.ACHIEVEMENTS.length;
    },
    weekTourney() {
      const p = HR.Save.data, w = HR.Save.weekId();
      if (p.tournament.weekId !== w) { p.tournament = { weekId: w, registered: false, eliminated: false, round: 0, wins: 0, champion: false }; HR.Save.persist(); }
    },
    renderTourney() {
      this.weekTourney();
      const p = HR.Save.data, t = p.tournament;
      $('btn-register').classList.toggle('hidden', t.registered);
      $('btn-tourney-play').classList.toggle('hidden', !t.registered || t.eliminated || t.champion);
      if (t.champion) $('tourney-status').textContent = 'Champion. Golden Dealer unlocked.';
      else if (t.eliminated) $('tourney-status').textContent = 'Eliminated in round ' + t.round + '.';
      else if (t.registered) $('tourney-status').textContent = 'Round ' + (t.round + 1) + ' of 6.';
      else $('tourney-status').textContent = '64-player single elim. Winner: Golden Dealer, Aurora case, 10,000 chips.';
      const rounds = ['R64', 'R32', 'R16', 'Quarter', 'Semi', 'Final'];
      $('bracket').innerHTML = rounds.map((name, i) => {
        let row = '<div class="round-title">' + name + '</div>';
        if (t.registered && i === t.round && !t.eliminated && !t.champion) row += '<div class="fight"><span class="you">' + p.username + '</span><span>vs</span><span>' + HR.BOT_NAMES[i % HR.BOT_NAMES.length] + '</span></div>';
        else if (t.registered && i < t.round) row += '<div class="fight"><span class="you">' + p.username + '</span><span>won</span><span style="color:var(--muted)">house</span></div>';
        else row += '<div class="fight"><span style="color:var(--muted)">TBD</span><span>vs</span><span style="color:var(--muted)">TBD</span></div>';
        return row;
      }).join('');
    },
    registerTourney() { HR.Save.data.tournament.registered = true; HR.Save.persist(); HR.Audio.upgrade(); this.toast('Registered'); this.renderTourney(); },
    resolveTourney(win) {
      const t = HR.Save.data.tournament; t.round += 1;
      if (win) {
        t.wins += 1;
        if (t.round >= 6) {
          t.champion = true; HR.Save.grant('a20', 'avatar'); HR.Save.grant('neon', 'skin');
          HR.Save.data.avatar = 'a20'; HR.Save.addChips(10000); HR.Save.checkAchievements(); this.toast('TOURNAMENT CHAMPION');
        }
      } else t.eliminated = true;
      HR.Save.persist();
    },
    renderSettings() {
      const p = HR.Save.data;
      $('inp-name').value = p.username;
      $('sw-music').classList.toggle('on', p.settings.music);
      $('sw-sfx').classList.toggle('on', p.settings.sfx);
      $('sw-haptics').classList.toggle('on', p.settings.haptics);
      $('sw-gfx').classList.toggle('on', p.settings.gfx !== 'low');
      $('sw-motion').classList.toggle('on', !!p.settings.reducedMotion);
      $('sw-motion').setAttribute('aria-pressed', String(!!p.settings.reducedMotion));
      $('sw-contrast').classList.toggle('on', !!p.settings.highContrast);
      $('sw-contrast').setAttribute('aria-pressed', String(!!p.settings.highContrast));
      $('btn-install').classList.toggle('hidden', !this.deferredInstall);
    },
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  HR.App = App;
  window.addEventListener('load', () => App.boot());
})(window);
