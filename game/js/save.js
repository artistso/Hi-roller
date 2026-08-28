/* Hi Roller — local progression, loadout, talent trees */
(function (g) {
  'use strict';
  const HR = g.HR;
  const KEY = 'hiroller.v2';

  function defaults() {
    const starters = (HR.STARTER_TOWERS || []).slice();
    const levels = {};
    starters.forEach((id) => { levels[id] = 1; });
    return {
      username: 'Wanderer',
      avatar: 'a01',
      level: 1,
      xp: 0,
      chips: 900,
      totalChipsEarned: 0,
      chipsSpent: 0,
      rank: 0,
      peakRank: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0,
      towerLevels: levels,
      unlockedTowers: starters.slice(),
      loadout: starters.slice(0, HR.LOADOUT_SIZE || 9),
      talents: {},
      talentPoints: 1,
      skins: ['wood'],
      selectedSkin: 'wood',
      themes: ['classic'],
      selectedTheme: 'classic',
      avatars: ['a01'],
      emotes: ['hi', 'clap', 'chips'],
      selectedEmote: 'hi',
      achievements: {},
      matchHistory: [],
      settings: {
        sfx: true,
        music: true,
        haptics: true,
        gfx: 'high',
        reducedMotion: false,
        highContrast: false,
      },
      stats: {
        damage: 0, minionsScored: 0, rotations: 0, crits: 0, stuns: 0,
        blackjackStolen: 0, doubleDowns: 0, matches: 0, slotShots: 0,
        cardBonusKills: 0, pokerBuffs: 0, towersCrumbled: 0, emotesUsed: 0,
      },
      tournament: { weekId: null, registered: false, eliminated: false, round: 0, wins: 0, champion: false },
      tutorialDone: false,
      splashSeen: false,
      createdAt: Date.now(),
    };
  }

  const Save = {
    data: defaults(),

    load() {
      try {
        const raw = localStorage.getItem(KEY) || localStorage.getItem('highroller.v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = Object.assign(defaults(), parsed);
          this.data.towerLevels = Object.assign(defaults().towerLevels, parsed.towerLevels || {});
          this.data.settings = Object.assign(defaults().settings, parsed.settings || {});
          this.data.stats = Object.assign(defaults().stats, parsed.stats || {});
          this.data.tournament = Object.assign(defaults().tournament, parsed.tournament || {});
          this.data.talents = parsed.talents || {};
          if (!this.data.loadout || !this.data.loadout.length) this.data.loadout = defaults().loadout;
          if (!this.data.unlockedTowers || this.data.unlockedTowers.length < 3) this.data.unlockedTowers = defaults().unlockedTowers;
        }
      } catch (e) { this.data = defaults(); }
      this.refreshUnlocks(false);
      return this.data;
    },

    persist() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },

    reset() { this.data = defaults(); this.persist(); },

    addChips(n) {
      this.data.chips += n;
      if (n > 0) this.data.totalChipsEarned += n;
      this.persist();
    },

    spend(n) {
      if (this.data.chips < n) return false;
      this.data.chips -= n;
      this.data.chipsSpent += n;
      this.persist();
      this.checkAchievements();
      return true;
    },

    addXp(n) {
      const p = this.data;
      p.xp += n;
      let leveled = 0;
      while (p.level < 100 && p.xp >= HR.xpToNext(p.level)) {
        p.xp -= HR.xpToNext(p.level);
        p.level += 1;
        p.talentPoints += 1;
        leveled += 1;
      }
      this.refreshUnlocks(true);
      this.persist();
      return leveled;
    },

    refreshUnlocks(announce) {
      const p = this.data;
      const newly = [];
      (HR.TOWER_ORDER || []).forEach((id) => {
        const t = HR.TOWERS[id];
        if (!t) return;
        if (p.level >= (t.unlockLevel || 1) && p.unlockedTowers.indexOf(id) < 0) {
          p.unlockedTowers.push(id);
          if (!p.towerLevels[id]) p.towerLevels[id] = 1;
          newly.push(t.name);
        }
      });
      Object.keys(HR.LOG_SKINS).forEach((id) => {
        const s = HR.LOG_SKINS[id];
        if (!s.exclusive && p.level >= s.level && p.skins.indexOf(id) < 0) {
          p.skins.push(id);
          newly.push(s.name);
        }
      });
      HR.AVATARS.forEach((a) => {
        if (p.avatars.indexOf(a.id) >= 0) return;
        const u = a.unlock;
        let ok = false;
        if (u.type === 'default') ok = true;
        if (u.type === 'level' && p.level >= u.level) ok = true;
        if (u.type === 'wins' && p.wins >= u.wins) ok = true;
        if (u.type === 'rank' && p.rank >= u.rank) ok = true;
        if (u.type === 'chipsEarned' && p.totalChipsEarned >= u.amount) ok = true;
        if (ok) { p.avatars.push(a.id); newly.push(a.name); }
      });
      p.loadout = (p.loadout || []).filter((id) => p.unlockedTowers.indexOf(id) >= 0);
      while (p.loadout.length < Math.min(HR.LOADOUT_SIZE, p.unlockedTowers.length)) {
        const next = p.unlockedTowers.find((id) => p.loadout.indexOf(id) < 0);
        if (!next) break;
        p.loadout.push(next);
      }
      if (announce && newly.length && HR.App) HR.App.toast('Unlocked: ' + newly.slice(0, 3).join(', ') + (newly.length > 3 ? '…' : ''));
      this.checkAchievements();
    },

    grant(id, kind) {
      const p = this.data;
      const arr = kind === 'skin' ? p.skins : kind === 'theme' ? p.themes : kind === 'avatar' ? p.avatars : p.emotes;
      if (arr.indexOf(id) < 0) arr.push(id);
      this.persist();
      this.checkAchievements();
    },

    unlockTalent(towerId, nodeId) {
      const tree = HR.treeFor(towerId);
      const node = tree.nodes.find((n) => n.id === nodeId);
      if (!node) return false;
      const have = (this.data.talents[towerId] || {});
      if (have[nodeId]) return false;
      if ((this.data.talentPoints || 0) < node.cost) return false;
      if (node.req.some((r) => !have[r])) return false;
      this.data.talentPoints -= node.cost;
      this.data.talents[towerId] = have;
      have[nodeId] = 1;
      this.checkAchievements();
      this.persist();
      return true;
    },

    setLoadout(ids) {
      const p = this.data;
      const clean = ids.filter((id) => p.unlockedTowers.indexOf(id) >= 0).slice(0, HR.LOADOUT_SIZE);
      if (clean.length < 3) return false;
      p.loadout = clean;
      this.persist();
      return true;
    },

    recordMatch(result) {
      const p = this.data;
      p.stats.matches += 1;
      if (result.win) {
        p.wins += 1;
        p.streak += 1;
        if (p.streak > p.bestStreak) p.bestStreak = p.streak;
      } else {
        p.losses += 1;
        p.streak = 0;
      }
      const myTier = HR.tierIndex(p.rank);
      const oppTier = result.oppTierIndex || myTier;
      let delta = 0;
      if (result.win) delta = oppTier > myTier ? 35 : 25;
      else delta = oppTier < myTier ? -25 : -15;
      if (result.mode === 'practice') delta = Math.round(delta * 0.35);
      p.rank = Math.max(0, p.rank + delta);
      if (p.rank > p.peakRank) p.peakRank = p.rank;
      const xp = (result.win ? 100 : 30) + (result.mvp ? 20 : 0);
      const leveled = this.addXp(xp);
      this.addChips(result.chipsEarned || 0);
      p.matchHistory.unshift({
        at: Date.now(), win: result.win, opp: result.oppName,
        chips: result.chipsEarned, duration: result.duration, mode: result.mode, delta,
      });
      if (p.matchHistory.length > 40) p.matchHistory.pop();
      this.refreshUnlocks(true);
      this.checkAchievements();
      this.persist();
      return { xp, delta, leveled };
    },

    checkAchievements() {
      const p = this.data;
      const unlock = (id) => {
        if (p.achievements[id]) return;
        p.achievements[id] = Date.now();
        const a = HR.ACHIEVEMENTS.find((x) => x.id === id);
        if (a && HR.App) HR.App.toast('Achievement: ' + a.name);
        this.addChips(150);
      };
      const s = p.stats;
      if (s.rotations >= 1) unlock('first_spin');
      if (p.totalChipsEarned >= 10000) unlock('chip_hoarder');
      if (p.bestStreak >= 10) unlock('unstoppable');
      if (p.tournament.champion) unlock('tourney_champ');
      if (p.wins >= 1) unlock('first_win');
      if (p.rank >= 5000) unlock('high_roller');
      if (p.chipsSpent >= 5000) unlock('big_spender');
      if (s.minionsScored >= 100) unlock('minion_mayhem');
      if (s.damage >= 10000) unlock('tower_defense');
      if (s.crits >= 50) unlock('crit_city');
      if (s.blackjackStolen >= 500) unlock('blackjack');
      if (s.doubleDowns >= 20) unlock('all_in');
      if (s.matches >= 50) unlock('veteran');
      if (s.slotShots >= 1000) unlock('slot_king');
      if (s.stuns >= 50) unlock('roulette_master');
      if (s.cardBonusKills >= 40) unlock('marked_man');
      if (s.pokerBuffs >= 100) unlock('neighborly');
      if (p.skins.indexOf('ceramic') >= 0) unlock('ceramic_club');
      if (p.skins.indexOf('metal') >= 0) unlock('metal_head');
      if (p.skins.indexOf('plasma') >= 0) unlock('plasma_pro');
      if (p.skins.indexOf('neon') >= 0) unlock('neon_dreams');
      if (p.level >= 10) unlock('lvl10');
      if (p.level >= 25) unlock('lvl25');
      if (p.level >= 50) unlock('lvl50');
      if (p.level >= 100) unlock('lvl100');
      if (p.rank >= 3500) unlock('diamond_hands');
      if (p.emotes.length >= 8) unlock('emote_fan');
      if (s.towersCrumbled >= 1) unlock('first_blood');
      if (p.totalChipsEarned >= 100000) unlock('millionaire');
      if (Object.values(p.towerLevels).some((lv) => lv >= 4)) unlock('upgrade_max');
      if (p.unlockedTowers.length >= 100) unlock('hundred');
      Object.keys(p.talents).forEach((tid) => {
        if (p.talents[tid] && p.talents[tid].cap) unlock('talent_cap');
      });
      this.persist();
    },

    weekId() {
      const d = new Date();
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      return d.getFullYear() + '-W' + week;
    },
  };

  HR.Save = Save;
})(window);
