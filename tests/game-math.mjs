import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = {
  console,
  setTimeout,
  clearTimeout,
  navigator: { vibrate() {} },
  Image: class {
    set src(_value) {}
  },
};
context.window = context;
vm.createContext(context);

for (const file of ['game/js/data.js', 'game/js/towers.js']) {
  vm.runInContext(await readFile(file, 'utf8'), context, { filename: file });
}

const HR = context.HR;
const noop = () => {};
HR.Audio = new Proxy({}, { get: () => noop });
HR.Save = {
  data: {
    level: 1,
    rank: 0,
    selectedSkin: 'wood',
    selectedTheme: 'classic',
    loadout: HR.STARTER_TOWERS.slice(),
    unlockedTowers: HR.STARTER_TOWERS.slice(),
    towerLevels: Object.fromEntries(HR.STARTER_TOWERS.map((id) => [id, 1])),
    talents: {},
    chipsSpent: 0,
    achievements: {},
    settings: { haptics: false },
    stats: {
      rotations: 0, doubleDowns: 0, minionsScored: 0, pokerBuffs: 0,
      towersCrumbled: 0, damage: 0, stuns: 0, crits: 0, slotShots: 0,
      cardBonusKills: 0, blackjackStolen: 0,
    },
  },
  persist: noop,
  addChips: noop,
};

vm.runInContext(await readFile('game/js/engine.js', 'utf8'), context, { filename: 'game/js/engine.js' });

assert.equal(HR.TOWER_ORDER.length, 100, 'catalog must contain exactly 100 towers');
assert.deepEqual(
  [1, 2, 3, 4].map((level) => HR.upgradeMult(level, HR.UPGRADE_DMG)),
  [1, 1.15, 1.25, 1.4],
  'damage upgrade table is an absolute bonus, not a compounding sum',
);
assert.deepEqual(
  [1, 2, 3, 4].map((level) => HR.upgradeMult(level, HR.UPGRADE_HP)),
  [1, 1.1, 1.2, 1.3],
  'HP upgrade table is an absolute bonus, not a compounding sum',
);
for (let level = 1; level < 100; level += 1) {
  assert.ok(HR.xpToNext(level + 1) > HR.xpToNext(level), 'XP curve must increase monotonically');
}

const match = new HR.Match({ mode: 'practice', duration: 180, difficulty: 0.7, oppTierIndex: 0 });
assert.equal(match.livingTowers(0), 3);
assert.equal(match.livingTowers(1), 3);
assert.deepEqual(Array.from(match.chips), [240, 240]);

assert.equal(match.manualSpin(0), true);
assert.equal(match.chips[0], 190);
assert.equal(match.manualSpin(0), false, 'cooldown blocks an immediate second spin');
assert.equal(match.chips[0], 190, 'failed input must not consume chips');

const towerId = HR.STARTER_TOWERS[0];
match.chips[0] = 1000;
assert.equal(match.upgradeInMatch(towerId), true);
assert.equal(match.matchLevels[0][towerId], 2);
assert.equal(HR.Save.data.towerLevels[towerId], 1, 'temporary upgrades cannot leak into persistent progression');
assert.equal(match.chips[0], 800);

match.traps = [{ x: -500, y: -500, owner: 0, t: 2 }];
match.minions = [
  { owner: 0, lane: 0, x: 0, y: 500, hp: 70, maxHp: 70, speed: 0, dir: -1, r: 15, stun: 0, marked: 0, burn: 0, poison: 0, slow: 0, wob: 0 },
  { owner: 1, lane: 1, x: 1000, y: 1800, hp: 70, maxHp: 70, speed: 0, dir: 1, r: 15, stun: 0, marked: 0, burn: 0, poison: 0, slow: 0, wob: 0 },
];
match._updateMinions(0.5);
assert.equal(match.traps[0].t, 1.5, 'trap duration advances once per frame, independent of minion count');

const timing = new HR.Match({ mode: 'practice', duration: 180, difficulty: 0.7, oppTierIndex: 0 });
timing.countdown = 0;
timing.running = true;
timing.update(1);
assert.ok(Math.abs(timing.elapsed - 0.05) < 1e-9, 'simulation delta is capped at 50 ms');

console.log('Game math invariants passed.');
