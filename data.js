/* Hi Roller — world data (towers live in towers.js) */
(function (g) {
  'use strict';
  g.HR = g.HR || {};
  const HR = g.HR;

  HR.LOGICAL_W = 1080;
  HR.LOGICAL_H = 2340;
  HR.MATCH_SECONDS = 300;
  HR.PRACTICE_SECONDS = 180;
  HR.LOADOUT_SIZE = 9;

  HR.PALETTE = {
    bg: '#1b2832',
    parchment: '#f4e9d0',
    ink: '#3b2a1a',
    teal: '#3d7a6a',
    grass: '#6b8f4e',
    sky: '#7ec8e3',
    gold: '#c9a227',
    gold2: '#f0d78c',
    wood: '#8b5a2b',
    danger: '#b43a3a',
    ok: '#5aad6e',
    muted: '#7a6a58',
  };

  HR.UPGRADE_COST = [0, 200, 500, 1000];
  HR.UPGRADE_DMG = [0, 0, 0.15, 0.25, 0.40];
  HR.UPGRADE_HP  = [0, 0, 0.10, 0.20, 0.30];

  HR.LOG_SKINS = {
    wood:    { id: 'wood',    name: 'Cedar Cabinet',  cost: 0,    level: 1,  rot: 1.00, hp: 1.00, dmg: 1.00, chip: 1.00, colors: ['#6b3a1f', '#c4894a', '#f0d78c'] },
    ceramic: { id: 'ceramic', name: 'Shrine Clay',    cost: 500,  level: 10, rot: 1.05, hp: 1.00, dmg: 1.00, chip: 1.00, colors: ['#d9cbb3', '#b7a48a', '#fff6e8'] },
    metal:   { id: 'metal',   name: 'Brassworks',     cost: 1500, level: 25, rot: 1.00, hp: 1.10, dmg: 1.00, chip: 1.00, colors: ['#8a7a4a', '#e6d48a', '#c9a227'] },
    plasma:  { id: 'plasma',  name: 'Starwood',       cost: 5000, level: 50, rot: 1.00, hp: 1.00, dmg: 1.15, chip: 1.00, colors: ['#2d4a3e', '#7ec8e3', '#c9a227'] },
    neon:    { id: 'neon',    name: 'Aurora Case',    cost: 0,    level: 999, rot: 1.00, hp: 1.00, dmg: 1.00, chip: 1.10, colors: ['#1b3a32', '#7ec8e3', '#e8c547'], exclusive: true },
  };

  HR.THEMES = {
    classic:   { id: 'classic',   name: 'Hyrule-less Wilds', cost: 0,    lane: '#c9a227', felt: '#4a7a3a' },
    steampunk: { id: 'steampunk', name: 'Brass Carnival',    cost: 800,  lane: '#e0a050', felt: '#3a2414' },
    cyberpunk: { id: 'cyberpunk', name: 'Moonlit Mesa',      cost: 1200, lane: '#7ec8e3', felt: '#1b2832' },
    tropical:  { id: 'tropical',  name: 'River Delta',       cost: 900,  lane: '#6b8f4e', felt: '#0a4a38' },
  };

  HR.AVATARS = [
    { id: 'a01', name: 'Hi There',     src: 'assets/avatars/avatar-01.png', unlock: { type: 'default' } },
    { id: 'a02', name: 'Croupier',     src: 'assets/avatars/avatar-02.png', unlock: { type: 'level', level: 3 } },
    { id: 'a03', name: 'Mask of Odds', src: 'assets/avatars/avatar-03.png', unlock: { type: 'chips', cost: 400 } },
    { id: 'a04', name: 'Showman',      src: 'assets/avatars/avatar-04.png', unlock: { type: 'level', level: 8 } },
    { id: 'a05', name: 'High Stakes',  src: 'assets/avatars/avatar-05.png', unlock: { type: 'chips', cost: 700 } },
    { id: 'a06', name: 'The House',    src: 'assets/avatars/avatar-06.png', unlock: { type: 'level', level: 15 } },
    { id: 'a07', name: 'Lucky Charm',  src: 'assets/avatars/avatar-07.png', unlock: { type: 'chips', cost: 600 } },
    { id: 'a08', name: 'Android',      color: '#7ec8e3', initials: 'AR', unlock: { type: 'level', level: 20 } },
    { id: 'a09', name: 'Riverboat',    color: '#c9a227', initials: 'RB', unlock: { type: 'chips', cost: 900 } },
    { id: 'a10', name: 'Kitsune',      color: '#e07a9a', initials: 'KX', unlock: { type: 'level', level: 30 } },
    { id: 'a11', name: 'Ace',          color: '#b43a3a', initials: 'AC', unlock: { type: 'wins', wins: 5 } },
    { id: 'a12', name: 'Diamond',      color: '#7ec8e3', initials: 'DM', unlock: { type: 'rank', rank: 3500 } },
    { id: 'a13', name: 'Joker',        color: '#8b6cc9', initials: 'JK', unlock: { type: 'chips', cost: 1500 } },
    { id: 'a14', name: 'Countess',     color: '#c9a227', initials: 'CT', unlock: { type: 'level', level: 40 } },
    { id: 'a15', name: 'Pit Boss',     color: '#b43a3a', initials: 'PB', unlock: { type: 'wins', wins: 25 } },
    { id: 'a16', name: 'Midnight',     color: '#4a5a8a', initials: 'MN', unlock: { type: 'chips', cost: 2000 } },
    { id: 'a17', name: 'Fortune',      color: '#5aad6e', initials: 'FN', unlock: { type: 'level', level: 50 } },
    { id: 'a18', name: 'Whale',        color: '#3d7a6a', initials: 'WH', unlock: { type: 'chipsEarned', amount: 50000 } },
    { id: 'a19', name: 'Legend',       color: '#f0d78c', initials: 'LG', unlock: { type: 'rank', rank: 5000 } },
    { id: 'a20', name: 'Golden Dealer',color: '#c9a227', initials: 'GD', unlock: { type: 'tournament' }, exclusive: true },
  ];

  HR.EMOTES = [
    { id: 'hi',     glyph: '👋', name: 'Hi',      cost: 0 },
    { id: 'clap',   glyph: '👏', name: 'Clap',    cost: 0 },
    { id: 'chips',  glyph: '💰', name: 'Chips',   cost: 0 },
    { id: 'fire',   glyph: '🔥', name: 'On Fire', cost: 250 },
    { id: 'cool',   glyph: '😎', name: 'Cool',    cost: 250 },
    { id: 'cry',    glyph: '😭', name: 'Tears',   cost: 250 },
    { id: 'king',   glyph: '👑', name: 'King',    cost: 400 },
    { id: 'dice',   glyph: '🎲', name: 'Dice',    cost: 400 },
    { id: 'boom',   glyph: '💥', name: 'Boom',    cost: 400 },
    { id: 'ghost',  glyph: '👻', name: 'Ghost',   cost: 600 },
    { id: 'dragon', glyph: '🐉', name: 'Dragon',  cost: 800 },
    { id: 'allin',  glyph: '🃏', name: 'All In',  cost: 1000 },
  ];

  HR.TIERS = [
    { name: 'Wanderer',  min: 0,    color: '#8b5a2b' },
    { name: 'River',     min: 500,  color: '#7ec8e3' },
    { name: 'Goldleaf',  min: 1000, color: '#c9a227' },
    { name: 'Starwood',  min: 2000, color: '#e8c547' },
    { name: 'Aurora',    min: 3500, color: '#7ec8e3' },
    { name: 'Hi Legend', min: 5000, color: '#f4e9d0' },
  ];

  HR.ACHIEVEMENTS = [
    { id: 'first_spin', name: 'First Spin', desc: 'Spin a cabinet for the first time.', icon: '🎰' },
    { id: 'chip_hoarder', name: 'Chip Hoarder', desc: 'Earn 10,000 chips in total.', icon: '🪙' },
    { id: 'unstoppable', name: 'Unstoppable', desc: 'Win 10 matches in a row.', icon: '🔥' },
    { id: 'tourney_champ', name: 'Tournament Champion', desc: 'Win a weekly tournament.', icon: '🏆' },
    { id: 'full_house', name: 'Full House', desc: 'Fill all 18 windows in a match.', icon: '🏠' },
    { id: 'first_win', name: 'First Payday', desc: 'Win your first match.', icon: '🥇' },
    { id: 'high_roller', name: 'Hi, Legend', desc: 'Reach Hi Legend.', icon: '💎' },
    { id: 'big_spender', name: 'Big Spender', desc: 'Spend 5,000 chips in the shop.', icon: '💸' },
    { id: 'perfect_game', name: 'Perfect Game', desc: 'Win without crumbling a tower.', icon: '✨' },
    { id: 'minion_mayhem', name: 'Track Star', desc: 'Score 100 minions.', icon: '👾' },
    { id: 'tower_defense', name: 'House Always Wins', desc: 'Deal 10,000 damage.', icon: '🛡️' },
    { id: 'crit_city', name: 'Crit City', desc: 'Land 50 crits.', icon: '🎲' },
    { id: 'blackjack', name: 'The Rake', desc: 'Steal 500 HP as chips.', icon: '🂡' },
    { id: 'all_in', name: 'All In', desc: 'Use Double Down 20 times.', icon: '📈' },
    { id: 'veteran', name: 'Trail Regular', desc: 'Play 50 matches.', icon: '🎫' },
    { id: 'slot_king', name: 'Reel King', desc: 'Fire 1,000 rapid shots.', icon: '🎰' },
    { id: 'roulette_master', name: 'Wheel Master', desc: 'Stun 50 minions.', icon: '🎡' },
    { id: 'marked_man', name: 'Marked Cards', desc: '40 snipe bonus kills.', icon: '🃏' },
    { id: 'neighborly', name: 'Good Neighbors', desc: 'Apply buffs 100 times.', icon: '♠️' },
    { id: 'ceramic_club', name: 'Shrine Clay', desc: 'Unlock the clay cabinet.', icon: '🏺' },
    { id: 'metal_head', name: 'Brassworks', desc: 'Unlock the brass cabinet.', icon: '⚙️' },
    { id: 'plasma_pro', name: 'Starwood', desc: 'Unlock Starwood.', icon: '⚡' },
    { id: 'neon_dreams', name: 'Aurora Case', desc: 'Unlock the tournament case.', icon: '🌈' },
    { id: 'lvl10', name: 'Trail Guide', desc: 'Reach level 10.', icon: '🔟' },
    { id: 'lvl25', name: 'Floor Manager', desc: 'Reach level 25.', icon: '📈' },
    { id: 'lvl50', name: 'Carnival Royalty', desc: 'Reach level 50.', icon: '👑' },
    { id: 'lvl100', name: 'The House', desc: 'Reach level 100.', icon: '🏛️' },
    { id: 'comeback', name: 'Comeback Kid', desc: 'Win with 1 tower left.', icon: '❤️' },
    { id: 'speedster', name: 'Speed Run', desc: 'Win in under 3 minutes.', icon: '⚡' },
    { id: 'shopaholic', name: 'Collector', desc: 'Own every non-exclusive cosmetic.', icon: '🛍️' },
    { id: 'first_blood', name: 'Snake Eyes', desc: 'Crumble an enemy tower.', icon: '💀' },
    { id: 'millionaire', name: 'Whale', desc: 'Earn 100,000 chips lifetime.', icon: '🐋' },
    { id: 'diamond_hands', name: 'Aurora Hands', desc: 'Reach Aurora tier.', icon: '💎' },
    { id: 'emote_fan', name: 'Table Talk', desc: 'Unlock 8 emotes.', icon: '💬' },
    { id: 'upgrade_max', name: 'Max Bet', desc: 'Fully in-match-upgrade a tower.', icon: '🆙' },
    { id: 'talent_cap', name: 'Mastery', desc: 'Finish any talent tree capstone.', icon: '🌳' },
    { id: 'hundred', name: 'The Full Wheel', desc: 'Unlock all 100 towers.', icon: '💯' },
    { id: 'loadout_ace', name: 'Nine Lives', desc: 'Win with a custom 9-tower loadout.', icon: '9️⃣' },
  ];

  HR.BOT_NAMES = [
    'LuckyLiu', 'AceVentura', 'ChipShark', 'WildNina', 'DiceDevil',
    'QueenOfHearts', 'ThePit', 'FoldMe', 'AllInAlan', 'RouletteRita',
    'CrapsCarl', 'FeltFern', 'HighStakes', 'VelvetViper', 'GoldTooth',
  ];

  HR.FAKE_LEADERS = [
    { name: 'WildKing', rank: 6120, wins: 340, chips: 89000 },
    { name: 'RiverQueen', rank: 5880, wins: 301, chips: 76000 },
    { name: 'ChipWizard', rank: 5410, wins: 277, chips: 64000 },
    { name: 'LadyLuck88', rank: 4990, wins: 240, chips: 51000 },
    { name: 'DiceStorm', rank: 4520, wins: 210, chips: 44000 },
    { name: 'AceHigh', rank: 4010, wins: 188, chips: 39000 },
    { name: 'FeltFox', rank: 3660, wins: 170, chips: 33000 },
    { name: 'SpinDoctor', rank: 3210, wins: 154, chips: 28000 },
    { name: 'RiverGod', rank: 2880, wins: 140, chips: 25000 },
    { name: 'PitViper', rank: 2440, wins: 121, chips: 21000 },
    { name: 'GoldAnte', rank: 1980, wins: 99, chips: 17000 },
    { name: 'SevenSeven', rank: 1540, wins: 80, chips: 12000 },
    { name: 'MiniBaccarat', rank: 1210, wins: 66, chips: 9000 },
    { name: 'SuitedConn', rank: 880, wins: 49, chips: 7000 },
    { name: 'AnteUp', rank: 540, wins: 31, chips: 4200 },
  ];

  HR.xpToNext = function (level) { return 80 + level * 20; };

  HR.tierFor = function (rank) {
    let t = HR.TIERS[0];
    for (const x of HR.TIERS) if (rank >= x.min) t = x;
    return t;
  };

  HR.tierIndex = function (rank) {
    let i = 0;
    for (let k = 0; k < HR.TIERS.length; k++) if (rank >= HR.TIERS[k].min) i = k;
    return i;
  };

  HR.upgradeMult = function (level, table) {
    let m = 1;
    for (let i = 2; i <= level; i++) m += table[i] || 0;
    return m;
  };
})(window);
