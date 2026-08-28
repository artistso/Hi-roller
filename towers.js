/* Hi Roller — 100 towers + talent trees */
(function (g) {
'use strict';
const HR = g.HR = g.HR || {};
HR.FAMILIES = {
  reel: { id:'reel', name:'Reelworks', color:'#c45c26', accent:'#f0c14b', signature:'rapid' },
  wheel: { id:'wheel', name:'Wheelhouse', color:'#b43a3a', accent:'#f4e9d0', signature:'aoe' },
  card: { id:'card', name:'Cardcourt', color:'#dfe6ef', accent:'#c41e3a', signature:'snipe' },
  dice: { id:'dice', name:'Diceden', color:'#3d8b3d', accent:'#fff6c8', signature:'crit' },
  chip: { id:'chip', name:'Chipforge', color:'#c9a227', accent:'#6b3a1f', signature:'gold' },
  felt: { id:'felt', name:'Greenfelt', color:'#6b8f4e', accent:'#f4e9d0', signature:'buff' },
  ember: { id:'ember', name:'Emberpit', color:'#d35400', accent:'#2c1308', signature:'burn' },
  mist: { id:'mist', name:'Mistveil', color:'#7aa7c7', accent:'#e8f4ff', signature:'slow' },
  iron: { id:'iron', name:'Ironwager', color:'#7d8a99', accent:'#d9e0e8', signature:'shield' },
  star: { id:'star', name:'Starante', color:'#e8c547', accent:'#3b2a1a', signature:'luck' },
};
HR.TOWERS = {};
HR.TOWER_ORDER = [];
HR.FAMILY_ORDER = ['reel','wheel','card','dice','chip','felt','ember','mist','iron','star'];
HR.TOWERS['reel_00']={id:'reel_00',name:'Cherry Bomb',family:'reel',symbol:'🍒',color:'#c45c26',accent:'#f0c14b',hp:111.9,dmg:6.76,cd:0.35,range:219,ability:'rapid',role:'DPS',multi:3,unlockLevel:1,desc:'Three fruit shots. Fast, messy, joyful.',n:1};
HR.TOWER_ORDER.push('reel_00');
HR.TOWERS['reel_01']={id:'reel_01',name:'Lucky Seven',family:'reel',symbol:'7️⃣',color:'#c45c26',accent:'#f0c14b',hp:109.3,dmg:6.5,cd:0.33,range:216,ability:'rapid',role:'DPS',multi:3,unlockLevel:1,desc:'Sevens fly in a tight burst.',n:2};
HR.TOWER_ORDER.push('reel_01');
HR.TOWERS['reel_02']={id:'reel_02',name:'Wild Bar',family:'reel',symbol:'▬',color:'#c45c26',accent:'#f0c14b',hp:104.7,dmg:15.36,cd:0.9,range:233,ability:'pierce',role:'DPS',pierce:1,unlockLevel:1,desc:'A bar that punches through a line.',n:3};
HR.TOWER_ORDER.push('reel_02');
HR.TOWERS['reel_03']={id:'reel_03',name:'Triple Bell',family:'reel',symbol:'🔔',color:'#c45c26',accent:'#f0c14b',hp:100.3,dmg:10.6,cd:0.7,range:200,ability:'split',role:'DPS',split:2,unlockLevel:1,desc:'Bell splits into two chimes.',n:4};
HR.TOWER_ORDER.push('reel_03');
HR.TOWERS['reel_04']={id:'reel_04',name:'Nudge Needle',family:'reel',symbol:'📌',color:'#c45c26',accent:'#f0c14b',hp:100.6,dmg:36.72,cd:1.05,range:261,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:1,desc:'Nudge the reel, pin a minion.',n:5};
HR.TOWER_ORDER.push('reel_04');
HR.TOWERS['reel_05']={id:'reel_05',name:'Hold Hopper',family:'reel',symbol:'⏸',color:'#c45c26',accent:'#f0c14b',hp:116.7,dmg:8.82,cd:1.54,range:165,ability:'trap',role:'CONTROL',trapT:2.5,slow:0.5,unlockLevel:1,desc:'Hold symbols; drop a sticky trap.',n:6};
HR.TOWER_ORDER.push('reel_05');
HR.TOWERS['reel_06']={id:'reel_06',name:'Scatter Seed',family:'reel',symbol:'🌱',color:'#c45c26',accent:'#f0c14b',hp:104.0,dmg:9.4,cd:0.68,range:209,ability:'split',role:'DPS',split:2,unlockLevel:1,desc:'Scatter hits nearby tracks.',n:7};
HR.TOWER_ORDER.push('reel_06');
HR.TOWERS['reel_07']={id:'reel_07',name:'Payline Pike',family:'reel',symbol:'🔱',color:'#c45c26',accent:'#f0c14b',hp:103.5,dmg:16.64,cd:0.9,range:237,ability:'pierce',role:'DPS',pierce:1,unlockLevel:1,desc:'Along the payline, nothing stands.',n:8};
HR.TOWER_ORDER.push('reel_07');
HR.TOWERS['reel_08']={id:'reel_08',name:'Jackpot Jar',family:'reel',symbol:'🏺',color:'#c45c26',accent:'#f0c14b',hp:106.6,dmg:12.0,cd:1.05,range:193,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:1,desc:'Kills shake extra chips loose.',n:9};
HR.TOWER_ORDER.push('reel_08');
HR.TOWERS['reel_09']={id:'reel_09',name:'Reel Warden',family:'reel',symbol:'🎰',color:'#c45c26',accent:'#f0c14b',hp:111.9,dmg:6.24,cd:0.32,range:210,ability:'rapid',role:'DPS',multi:3,unlockLevel:2,desc:'The cabinet itself fights back.',n:10};
HR.TOWER_ORDER.push('reel_09');
HR.TOWERS['wheel_00']={id:'wheel_00',name:'Crimson Pocket',family:'wheel',symbol:'🔴',color:'#b43a3a',accent:'#f4e9d0',hp:129.5,dmg:21.2,cd:1.44,range:172,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:3,desc:'Red pocket burst, wide and mean.',n:11};
HR.TOWER_ORDER.push('wheel_00');
HR.TOWERS['wheel_01']={id:'wheel_01',name:'Black Pocket',family:'wheel',symbol:'⚫',color:'#b43a3a',accent:'#f4e9d0',hp:126.5,dmg:20.4,cd:1.36,range:170,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:4,desc:'Dark spin, chance to stun.',n:12};
HR.TOWER_ORDER.push('wheel_01');
HR.TOWERS['wheel_02']={id:'wheel_02',name:'Green Zero',family:'wheel',symbol:'🟢',color:'#b43a3a',accent:'#f4e9d0',hp:111.8,dmg:12.74,cd:1.43,range:193,ability:'freeze',role:'CONTROL',stun:0.22,stunDur:0.9,unlockLevel:5,desc:'Zero freeze — house smiles.',n:13};
HR.TOWER_ORDER.push('wheel_02');
HR.TOWERS['wheel_03']={id:'wheel_03',name:'Ivory Ball',family:'wheel',symbol:'⚪',color:'#b43a3a',accent:'#f4e9d0',hp:100.6,dmg:33.84,cd:1.12,range:273,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:6,desc:'The ball finds one skull.',n:14};
HR.TOWER_ORDER.push('wheel_03');
HR.TOWERS['wheel_04']={id:'wheel_04',name:'Double Street',family:'wheel',symbol:'2️⃣',color:'#b43a3a',accent:'#f4e9d0',hp:131.1,dmg:20.8,cd:1.32,range:178,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:7,desc:'Two rows of felt catch fire.',n:15};
HR.TOWER_ORDER.push('wheel_04');
HR.TOWERS['wheel_05']={id:'wheel_05',name:'Corner Bet',family:'wheel',symbol:'📐',color:'#b43a3a',accent:'#f4e9d0',hp:104.0,dmg:10.0,cd:0.72,range:200,ability:'split',role:'DPS',split:2,unlockLevel:8,desc:'Corner covers four headaches.',n:16};
HR.TOWER_ORDER.push('wheel_05');
HR.TOWERS['wheel_06']={id:'wheel_06',name:'Spin Oracle',family:'wheel',symbol:'🔮',color:'#b43a3a',accent:'#f4e9d0',hp:107.4,dmg:14.4,cd:0.97,range:197,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:9,desc:'Reads the next spin.',n:17};
HR.TOWER_ORDER.push('wheel_06');
HR.TOWERS['wheel_07']={id:'wheel_07',name:'Marble Gale',family:'wheel',symbol:'💨',color:'#b43a3a',accent:'#f4e9d0',hp:112.3,dmg:11.66,cd:1.17,range:189,ability:'slow',role:'CONTROL',slow:0.35,slowT:1.4,unlockLevel:10,desc:'Ball wind slows the lane.',n:18};
HR.TOWER_ORDER.push('wheel_07');
HR.TOWERS['wheel_08']={id:'wheel_08',name:'House Edge',family:'wheel',symbol:'🏠',color:'#b43a3a',accent:'#f4e9d0',hp:101.5,dmg:28.56,cd:1.25,range:251,ability:'execute',role:'SNIPE',execute:0.18,unlockLevel:11,desc:'The edge finishes the wounded.',n:19};
HR.TOWER_ORDER.push('wheel_08');
HR.TOWERS['wheel_09']={id:'wheel_09',name:'Wheelwright',family:'wheel',symbol:'🛠️',color:'#b43a3a',accent:'#f4e9d0',hp:129.5,dmg:19.6,cd:1.32,range:180,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:12,desc:'Builds bigger wheels of hurt.',n:20};
HR.TOWER_ORDER.push('wheel_09');
HR.TOWERS['card_00']={id:'card_00',name:'Ace High',family:'card',symbol:'🂡',color:'#dfe6ef',accent:'#c41e3a',hp:94.8,dmg:33.84,cd:1.15,range:269,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:13,desc:'One clean, high card.',n:21};
HR.TOWER_ORDER.push('card_00');
HR.TOWERS['card_01']={id:'card_01',name:'Face Card',family:'card',symbol:'🂻',color:'#dfe6ef',accent:'#c41e3a',hp:92.5,dmg:37.44,cd:1.09,range:265,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:14,desc:'Pretty, and lethal.',n:22};
HR.TOWER_ORDER.push('card_01');
HR.TOWERS['card_02']={id:'card_02',name:'River Sniper',family:'card',symbol:'🌊',color:'#dfe6ef',accent:'#c41e3a',hp:100.6,dmg:36.0,cd:1.19,range:261,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:15,desc:'Waits, then ends it.',n:23};
HR.TOWER_ORDER.push('card_02');
HR.TOWERS['card_03']={id:'card_03',name:'Dead Hand',family:'card',symbol:'💀',color:'#dfe6ef',accent:'#c41e3a',hp:100.4,dmg:26.88,cd:1.25,range:233,ability:'execute',role:'SNIPE',execute:0.18,unlockLevel:16,desc:'Bonus vs marked and hurt.',n:24};
HR.TOWER_ORDER.push('card_03');
HR.TOWERS['card_04']={id:'card_04',name:'Fold Fox',family:'card',symbol:'🦊',color:'#dfe6ef',accent:'#c41e3a',hp:118.0,dmg:11.66,cd:1.03,range:204,ability:'slow',role:'CONTROL',slow:0.35,slowT:1.4,unlockLevel:17,desc:'Makes them think twice.',n:25};
HR.TOWER_ORDER.push('card_04');
HR.TOWERS['card_05']={id:'card_05',name:'Flop Torch',family:'card',symbol:'🔥',color:'#dfe6ef',accent:'#c41e3a',hp:97.6,dmg:14.28,cd:0.93,range:206,ability:'burn',role:'DPS',burn:6,burnT:2.2,unlockLevel:18,desc:'Flop hits like a brand.',n:26};
HR.TOWER_ORDER.push('card_05');
HR.TOWERS['card_06']={id:'card_06',name:'Stack Splitter',family:'card',symbol:'✂️',color:'#dfe6ef',accent:'#c41e3a',hp:99.0,dmg:9.8,cd:0.68,range:203,ability:'split',role:'DPS',split:2,unlockLevel:19,desc:'Cuts the pot and the wave.',n:27};
HR.TOWER_ORDER.push('card_06');
HR.TOWERS['card_07']={id:'card_07',name:'Queen Press',family:'card',symbol:'♛',color:'#dfe6ef',accent:'#c41e3a',hp:126.4,dmg:8.46,cd:1.8,range:155,ability:'buff',role:'SUPPORT',buff:0.14,unlockLevel:20,desc:'Pressures neighbors to bet bigger.',n:28};
HR.TOWER_ORDER.push('card_07');
HR.TOWERS['card_08']={id:'card_08',name:'Joker Wild',family:'card',symbol:'🃏',color:'#dfe6ef',accent:'#c41e3a',hp:111.3,dmg:15.6,cd:1.0,range:197,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:21,desc:'Anything. That\'s the joke.',n:29};
HR.TOWER_ORDER.push('card_08');
HR.TOWERS['card_09']={id:'card_09',name:'Dealer\'s Gaze',family:'card',symbol:'👁️',color:'#dfe6ef',accent:'#c41e3a',hp:94.8,dmg:36.0,cd:1.05,range:257,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:22,desc:'If it looks, it hits.',n:30};
HR.TOWER_ORDER.push('card_09');
HR.TOWERS['dice_00']={id:'dice_00',name:'Snake Eyes',family:'dice',symbol:'🐍',color:'#3d8b3d',accent:'#fff6c8',hp:100.3,dmg:16.32,cd:1.26,range:214,ability:'crit',role:'WILDCARD',critMin:1,critMax:6,unlockLevel:23,desc:'Two pips, ugly luck.',n:31};
HR.TOWER_ORDER.push('dice_00');
HR.TOWERS['dice_01']={id:'dice_01',name:'Boxcars',family:'dice',symbol:'🚂',color:'#3d8b3d',accent:'#fff6c8',hp:109.0,dmg:18.02,cd:1.18,range:211,ability:'crit',role:'WILDCARD',critMin:1,critMax:6,unlockLevel:24,desc:'Twelve or nothing.',n:32};
HR.TOWER_ORDER.push('dice_01');
HR.TOWERS['dice_02']={id:'dice_02',name:'Hard Eight',family:'dice',symbol:'8️⃣',color:'#3d8b3d',accent:'#fff6c8',hp:106.5,dmg:17.34,cd:1.29,range:208,ability:'crit',role:'WILDCARD',critMin:1,critMax:6,unlockLevel:25,desc:'Hard way, hard hits.',n:33};
HR.TOWER_ORDER.push('dice_02');
HR.TOWERS['dice_03']={id:'dice_03',name:'Come Bet',family:'dice',symbol:'➡️',color:'#3d8b3d',accent:'#fff6c8',hp:108.0,dmg:6.37,cd:0.34,range:210,ability:'rapid',role:'DPS',multi:3,unlockLevel:26,desc:'Keeps coming.',n:34};
HR.TOWER_ORDER.push('dice_03');
HR.TOWERS['dice_04']={id:'dice_04',name:'Boneshaker',family:'dice',symbol:'🦴',color:'#3d8b3d',accent:'#fff6c8',hp:124.9,dmg:18.8,cd:1.32,range:172,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:27,desc:'Dice rattle the ground.',n:35};
HR.TOWER_ORDER.push('dice_04');
HR.TOWERS['dice_05']={id:'dice_05',name:'Loaded Pair',family:'dice',symbol:'⚖️',color:'#3d8b3d',accent:'#fff6c8',hp:99.0,dmg:17.68,cd:1.26,range:199,ability:'crit',role:'WILDCARD',critMin:1,critMax:6,unlockLevel:28,desc:'They were always going to hit.',n:36};
HR.TOWER_ORDER.push('dice_05');
HR.TOWERS['dice_06']={id:'dice_06',name:'Tumble Tower',family:'dice',symbol:'🗼',color:'#3d8b3d',accent:'#fff6c8',hp:105.7,dmg:14.0,cd:0.78,range:219,ability:'bounce',role:'DPS',bounce:2,unlockLevel:29,desc:'Dice bounce tracks.',n:37};
HR.TOWER_ORDER.push('dice_06');
HR.TOWERS['dice_07']={id:'dice_07',name:'Fortune Fives',family:'dice',symbol:'5️⃣',color:'#3d8b3d',accent:'#fff6c8',hp:113.3,dmg:11.52,cd:1.11,range:196,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:30,desc:'Fives pay the table.',n:38};
HR.TOWER_ORDER.push('dice_07');
HR.TOWERS['dice_08']={id:'dice_08',name:'Pass Line',family:'dice',symbol:'➖',color:'#3d8b3d',accent:'#fff6c8',hp:104.7,dmg:16.96,cd:0.85,range:233,ability:'pierce',role:'DPS',pierce:1,unlockLevel:31,desc:'A line they cannot cross.',n:39};
HR.TOWER_ORDER.push('dice_08');
HR.TOWERS['dice_09']={id:'dice_09',name:'Dice Priest',family:'dice',symbol:'📿',color:'#3d8b3d',accent:'#fff6c8',hp:106.0,dmg:15.3,cd:0.94,range:200,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:32,desc:'Blesses the next roll.',n:40};
HR.TOWER_ORDER.push('dice_09');
HR.TOWERS['chip_00']={id:'chip_00',name:'Stack Smith',family:'chip',symbol:'🪙',color:'#c9a227',accent:'#6b3a1f',hp:117.4,dmg:11.76,cd:1.08,range:187,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:33,desc:'Forges chips from fear.',n:41};
HR.TOWER_ORDER.push('chip_00');
HR.TOWERS['chip_01']={id:'chip_01',name:'Ante Well',family:'chip',symbol:'🪣',color:'#c9a227',accent:'#6b3a1f',hp:114.7,dmg:11.28,cd:1.02,range:184,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:34,desc:'Dips into the ante.',n:42};
HR.TOWER_ORDER.push('chip_01');
HR.TOWERS['chip_02']={id:'chip_02',name:'Banker Beetle',family:'chip',symbol:'🪲',color:'#c9a227',accent:'#6b3a1f',hp:112.0,dmg:13.52,cd:1.01,range:204,ability:'steal',role:'SUSTAIN',steal:0.32,unlockLevel:35,desc:'Skims a little off the top.',n:43};
HR.TOWER_ORDER.push('chip_02');
HR.TOWERS['chip_03']={id:'chip_03',name:'Rake Root',family:'chip',symbol:'🌿',color:'#c9a227',accent:'#6b3a1f',hp:109.3,dmg:13.0,cd:0.95,range:201,ability:'steal',role:'SUSTAIN',steal:0.32,unlockLevel:36,desc:'The house rake, living.',n:44};
HR.TOWER_ORDER.push('chip_03');
HR.TOWERS['chip_04']={id:'chip_04',name:'Pot Sprout',family:'chip',symbol:'🪴',color:'#c9a227',accent:'#6b3a1f',hp:106.6,dmg:11.52,cd:0.99,range:193,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:37,desc:'The pot grows if you water it in blood.',n:45};
HR.TOWER_ORDER.push('chip_04');
HR.TOWERS['chip_05']={id:'chip_05',name:'Oddsmaker',family:'chip',symbol:'📊',color:'#c9a227',accent:'#6b3a1f',hp:114.0,dmg:15.9,cd:1.03,range:200,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:38,desc:'Tilts numbers your way.',n:46};
HR.TOWER_ORDER.push('chip_05');
HR.TOWERS['chip_06']={id:'chip_06',name:'Token Toad',family:'chip',symbol:'🐸',color:'#c9a227',accent:'#6b3a1f',hp:113.3,dmg:12.24,cd:1.02,range:187,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:39,desc:'Croaks, coins drop.',n:47};
HR.TOWER_ORDER.push('chip_06');
HR.TOWERS['chip_07']={id:'chip_07',name:'Vault Vines',family:'chip',symbol:'🏦',color:'#c9a227',accent:'#6b3a1f',hp:148.2,dmg:7.84,cd:1.7,range:146,ability:'shield',role:'TANK',dr:0.12,unlockLevel:40,desc:'Wraps the cabinet in vault-wood.',n:48};
HR.TOWER_ORDER.push('chip_07');
HR.TOWERS['chip_08']={id:'chip_08',name:'Wager Wisp',family:'chip',symbol:'👻',color:'#c9a227',accent:'#6b3a1f',hp:108.0,dmg:12.22,cd:0.95,range:204,ability:'steal',role:'SUSTAIN',steal:0.32,unlockLevel:41,desc:'Bets with other people\'s HP.',n:49};
HR.TOWER_ORDER.push('chip_08');
HR.TOWERS['chip_09']={id:'chip_09',name:'Mint Golem',family:'chip',symbol:'🗿',color:'#c9a227',accent:'#6b3a1f',hp:117.4,dmg:12.48,cd:0.99,range:196,ability:'gold',role:'ECONOMY',goldOnHit:0.08,unlockLevel:42,desc:'A walking coin press.',n:50};
HR.TOWER_ORDER.push('chip_09');
HR.TOWERS['felt_00']={id:'felt_00',name:'Felt Fern',family:'felt',symbol:'🌾',color:'#6b8f4e',accent:'#f4e9d0',hp:124.9,dmg:9.0,cd:1.75,range:157,ability:'buff',role:'SUPPORT',buff:0.14,unlockLevel:43,desc:'Soft felt, hard buffs.',n:51};
HR.TOWER_ORDER.push('felt_00');
HR.TOWERS['felt_01']={id:'felt_01',name:'Clover Croupier',family:'felt',symbol:'🍀',color:'#6b8f4e',accent:'#f4e9d0',hp:110.0,dmg:14.4,cd:0.97,range:200,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:44,desc:'Four leaves, four neighbors.',n:52};
HR.TOWER_ORDER.push('felt_01');
HR.TOWERS['felt_02']={id:'felt_02',name:'Moss Marker',family:'felt',symbol:'🟢',color:'#6b8f4e',accent:'#f4e9d0',hp:126.9,dmg:8.48,cd:1.91,range:148,ability:'regen',role:'SUPPORT',regen:4,unlockLevel:45,desc:'Grows over wounds.',n:53};
HR.TOWER_ORDER.push('felt_02');
HR.TOWERS['felt_03']={id:'felt_03',name:'Table Bloom',family:'felt',symbol:'🌸',color:'#6b8f4e',accent:'#f4e9d0',hp:116.1,dmg:9.18,cd:1.7,range:150,ability:'buff',role:'SUPPORT',buff:0.14,unlockLevel:46,desc:'The table flowers for friends.',n:54};
HR.TOWER_ORDER.push('felt_03');
HR.TOWERS['felt_04']={id:'felt_04',name:'Kindred Kettle',family:'felt',symbol:'🫖',color:'#6b8f4e',accent:'#f4e9d0',hp:134.7,dmg:7.84,cd:1.69,range:157,ability:'regen',role:'SUPPORT',regen:4,unlockLevel:47,desc:'Pours warmth into allies.',n:55};
HR.TOWER_ORDER.push('felt_04');
HR.TOWERS['felt_05']={id:'felt_05',name:'Soft Ante',family:'felt',symbol:'🤍',color:'#6b8f4e',accent:'#f4e9d0',hp:123.5,dmg:8.46,cd:1.75,range:160,ability:'buff',role:'SUPPORT',buff:0.14,unlockLevel:48,desc:'Gentle start, fierce middle.',n:56};
HR.TOWER_ORDER.push('felt_05');
HR.TOWERS['felt_06']={id:'felt_06',name:'Nurse of Nines',family:'felt',symbol:'9️⃣',color:'#6b8f4e',accent:'#f4e9d0',hp:128.4,dmg:8.32,cd:1.75,range:152,ability:'regen',role:'SUPPORT',regen:4,unlockLevel:49,desc:'Nines are lucky if you\'re bleeding.',n:57};
HR.TOWER_ORDER.push('felt_06');
HR.TOWERS['felt_07']={id:'felt_07',name:'Harmony Hand',family:'felt',symbol:'🤝',color:'#6b8f4e',accent:'#f4e9d0',hp:119.5,dmg:7.0,cd:0.53,range:140,ability:'aura',role:'SUPPORT',aura:8,unlockLevel:50,desc:'A quiet circle of harm to foes.',n:58};
HR.TOWER_ORDER.push('felt_07');
HR.TOWERS['felt_08']={id:'felt_08',name:'Grove Dealer',family:'felt',symbol:'🌳',color:'#6b8f4e',accent:'#f4e9d0',hp:127.9,dmg:8.64,cd:1.7,range:153,ability:'buff',role:'SUPPORT',buff:0.14,unlockLevel:51,desc:'Deals from the grove.',n:59};
HR.TOWER_ORDER.push('felt_08');
HR.TOWERS['felt_09']={id:'felt_09',name:'Paladin of Pairs',family:'felt',symbol:'🛡️',color:'#6b8f4e',accent:'#f4e9d0',hp:153.6,dmg:8.48,cd:1.5,range:146,ability:'shield',role:'TANK',dr:0.12,unlockLevel:52,desc:'Pairs stand together.',n:60};
HR.TOWER_ORDER.push('felt_09');
HR.TOWERS['ember_00']={id:'ember_00',name:'Hot Streak',family:'ember',symbol:'🔥',color:'#d35400',accent:'#2c1308',hp:100.0,dmg:14.28,cd:0.93,range:209,ability:'burn',role:'DPS',burn:6,burnT:2.2,unlockLevel:53,desc:'Don\'t let it cool.',n:61};
HR.TOWER_ORDER.push('ember_00');
HR.TOWERS['ember_01']={id:'ember_01',name:'Ember Ante',family:'ember',symbol:'✨',color:'#d35400',accent:'#2c1308',hp:97.6,dmg:13.72,cd:0.87,range:206,ability:'burn',role:'DPS',burn:6,burnT:2.2,unlockLevel:54,desc:'Ante in sparks.',n:62};
HR.TOWER_ORDER.push('ember_01');
HR.TOWERS['ember_02']={id:'ember_02',name:'Blaze Bet',family:'ember',symbol:'💥',color:'#d35400',accent:'#2c1308',hp:121.9,dmg:18.8,cd:1.48,range:178,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:55,desc:'All-in, on fire.',n:63};
HR.TOWER_ORDER.push('ember_02');
HR.TOWERS['ember_03']={id:'ember_03',name:'Cinder Stack',family:'ember',symbol:'🧱',color:'#d35400',accent:'#2c1308',hp:103.6,dmg:14.56,cd:0.9,range:200,ability:'burn',role:'DPS',burn:6,burnT:2.2,unlockLevel:56,desc:'Stacks of slow burn.',n:64};
HR.TOWER_ORDER.push('ember_03');
HR.TOWERS['ember_04']={id:'ember_04',name:'Magma Marker',family:'ember',symbol:'🟠',color:'#d35400',accent:'#2c1308',hp:101.2,dmg:14.0,cd:0.85,range:197,ability:'burn',role:'DPS',burn:6,burnT:2.2,unlockLevel:57,desc:'Marks that smolder.',n:65};
HR.TOWER_ORDER.push('ember_04');
HR.TOWERS['ember_05']={id:'ember_05',name:'Pyre Pair',family:'ember',symbol:'🕯️',color:'#d35400',accent:'#2c1308',hp:102.8,dmg:9.6,cd:0.72,range:194,ability:'split',role:'DPS',split:2,unlockLevel:58,desc:'Two little pyres.',n:66};
HR.TOWER_ORDER.push('ember_05');
HR.TOWERS['ember_06']={id:'ember_06',name:'Branding Iron',family:'ember',symbol:'♨️',color:'#d35400',accent:'#2c1308',hp:94.5,dmg:29.68,cd:1.21,range:251,ability:'execute',role:'SNIPE',execute:0.18,unlockLevel:59,desc:'Brands the dying.',n:67};
HR.TOWER_ORDER.push('ember_06');
HR.TOWERS['ember_07']={id:'ember_07',name:'Redline Reel',family:'ember',symbol:'📈',color:'#d35400',accent:'#2c1308',hp:113.2,dmg:6.63,cd:0.36,range:216,ability:'rapid',role:'DPS',multi:3,unlockLevel:60,desc:'Spins until it smokes.',n:68};
HR.TOWER_ORDER.push('ember_07');
HR.TOWERS['ember_08']={id:'ember_08',name:'Inferno Index',family:'ember',symbol:'📑',color:'#d35400',accent:'#2c1308',hp:131.1,dmg:19.6,cd:1.4,range:178,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:61,desc:'Indexes everyone in range.',n:69};
HR.TOWER_ORDER.push('ember_08');
HR.TOWERS['ember_09']={id:'ember_09',name:'Coal Croupier',family:'ember',symbol:'🖤',color:'#d35400',accent:'#2c1308',hp:100.0,dmg:13.16,cd:0.85,range:200,ability:'burn',role:'DPS',burn:6,burnT:2.2,unlockLevel:62,desc:'Deals in heat.',n:70};
HR.TOWER_ORDER.push('ember_09');
HR.TOWERS['mist_00']={id:'mist_00',name:'Mist Marker',family:'mist',symbol:'🌫️',color:'#7aa7c7',accent:'#e8f4ff',hp:115.2,dmg:11.44,cd:1.13,range:192,ability:'slow',role:'CONTROL',slow:0.35,slowT:1.4,unlockLevel:63,desc:'A fog you can aim.',n:71};
HR.TOWER_ORDER.push('mist_00');
HR.TOWERS['mist_01']={id:'mist_01',name:'Fog Fold',family:'mist',symbol:'📁',color:'#7aa7c7',accent:'#e8f4ff',hp:112.3,dmg:11.0,cd:1.07,range:189,ability:'slow',role:'CONTROL',slow:0.35,slowT:1.4,unlockLevel:64,desc:'Folds the lane shut.',n:72};
HR.TOWER_ORDER.push('mist_01');
HR.TOWERS['mist_02']={id:'mist_02',name:'Haze Hopper',family:'mist',symbol:'🐇',color:'#7aa7c7',accent:'#e8f4ff',hp:118.1,dmg:8.64,cd:1.59,range:178,ability:'trap',role:'CONTROL',trapT:2.5,slow:0.5,unlockLevel:65,desc:'Hops a trap into the gutter.',n:73};
HR.TOWER_ORDER.push('mist_02');
HR.TOWERS['mist_03']={id:'mist_03',name:'Chill Chip',family:'mist',symbol:'🧊',color:'#7aa7c7',accent:'#e8f4ff',hp:117.4,dmg:13.78,cd:1.35,range:191,ability:'freeze',role:'CONTROL',stun:0.22,stunDur:0.9,unlockLevel:66,desc:'A chip that bites.',n:74};
HR.TOWER_ORDER.push('mist_03');
HR.TOWERS['mist_04']={id:'mist_04',name:'Drift Dealer',family:'mist',symbol:'🌬️',color:'#7aa7c7',accent:'#e8f4ff',hp:116.6,dmg:11.22,cd:1.03,range:198,ability:'slow',role:'CONTROL',slow:0.35,slowT:1.4,unlockLevel:67,desc:'Deals from downwind.',n:75};
HR.TOWER_ORDER.push('mist_04');
HR.TOWERS['mist_05']={id:'mist_05',name:'Silence Stake',family:'mist',symbol:'🔇',color:'#7aa7c7',accent:'#e8f4ff',hp:111.8,dmg:12.74,cd:1.39,range:185,ability:'freeze',role:'CONTROL',stun:0.22,stunDur:0.9,unlockLevel:68,desc:'No calls, no steps.',n:76};
HR.TOWER_ORDER.push('mist_05');
HR.TOWERS['mist_06']={id:'mist_06',name:'Veil Viper',family:'mist',symbol:'🐍',color:'#7aa7c7',accent:'#e8f4ff',hp:113.2,dmg:9.4,cd:0.97,range:187,ability:'poison',role:'CONTROL',poison:5,poisonT:3,unlockLevel:69,desc:'A veil with teeth.',n:77};
HR.TOWER_ORDER.push('mist_06');
HR.TOWERS['mist_07']={id:'mist_07',name:'Frost Bet',family:'mist',symbol:'❄️',color:'#7aa7c7',accent:'#e8f4ff',hp:118.8,dmg:13.52,cd:1.43,range:179,ability:'freeze',role:'CONTROL',stun:0.22,stunDur:0.9,unlockLevel:70,desc:'Freeze the line, collect.',n:78};
HR.TOWER_ORDER.push('mist_07');
HR.TOWERS['mist_08']={id:'mist_08',name:'Echo Odds',family:'mist',symbol:'📢',color:'#7aa7c7',accent:'#e8f4ff',hp:100.0,dmg:15.0,cd:0.95,range:230,ability:'chain',role:'DPS',chain:2,unlockLevel:71,desc:'Hits echo to the next.',n:79};
HR.TOWER_ORDER.push('mist_08');
HR.TOWERS['mist_09']={id:'mist_09',name:'Phantom Payline',family:'mist',symbol:'👻',color:'#7aa7c7',accent:'#e8f4ff',hp:103.5,dmg:15.36,cd:0.8,range:237,ability:'pierce',role:'DPS',pierce:1,unlockLevel:72,desc:'A payline they walk through, sadly.',n:80};
HR.TOWER_ORDER.push('mist_09');
HR.TOWERS['iron_00']={id:'iron_00',name:'Iron Ante',family:'iron',symbol:'⛓️',color:'#7d8a99',accent:'#d9e0e8',hp:142.8,dmg:8.48,cd:1.65,range:152,ability:'shield',role:'TANK',dr:0.12,unlockLevel:73,desc:'Pays in plate.',n:81};
HR.TOWER_ORDER.push('iron_00');
HR.TOWERS['iron_01']={id:'iron_01',name:'Shield Stack',family:'iron',symbol:'🛡️',color:'#7d8a99',accent:'#d9e0e8',hp:155.4,dmg:8.16,cd:1.55,range:150,ability:'shield',role:'TANK',dr:0.12,unlockLevel:74,desc:'Chips become pavise.',n:82};
HR.TOWER_ORDER.push('iron_01');
HR.TOWERS['iron_02']={id:'iron_02',name:'Rampart Reel',family:'iron',symbol:'🏰',color:'#7d8a99',accent:'#d9e0e8',hp:151.8,dmg:7.84,cd:1.7,range:148,ability:'shield',role:'TANK',dr:0.12,unlockLevel:75,desc:'The reel is a wall.',n:83};
HR.TOWER_ORDER.push('iron_02');
HR.TOWERS['iron_03']={id:'iron_03',name:'Bulwark Bet',family:'iron',symbol:'🧱',color:'#7d8a99',accent:'#d9e0e8',hp:148.2,dmg:7.52,cd:1.6,range:146,ability:'shield',role:'TANK',dr:0.12,unlockLevel:76,desc:'Bet that they bounce.',n:84};
HR.TOWER_ORDER.push('iron_03');
HR.TOWERS['iron_04']={id:'iron_04',name:'Plate Pair',family:'iron',symbol:'🪙',color:'#7d8a99',accent:'#d9e0e8',hp:125.3,dmg:8.32,cd:1.69,range:157,ability:'regen',role:'SUPPORT',regen:4,unlockLevel:77,desc:'Two plates, one heartbeat.',n:85};
HR.TOWER_ORDER.push('iron_04');
HR.TOWERS['iron_05']={id:'iron_05',name:'Guard of Gold',family:'iron',symbol:'🥇',color:'#7d8a99',accent:'#d9e0e8',hp:130.0,dmg:7.0,cd:0.52,range:144,ability:'aura',role:'SUPPORT',aura:8,unlockLevel:78,desc:'Golden guard-aura.',n:86};
HR.TOWER_ORDER.push('iron_05');
HR.TOWERS['iron_06']={id:'iron_06',name:'Fortress Felt',family:'iron',symbol:'🏯',color:'#7d8a99',accent:'#d9e0e8',hp:153.6,dmg:7.68,cd:1.55,range:152,ability:'shield',role:'TANK',dr:0.12,unlockLevel:79,desc:'Felt over stone.',n:87};
HR.TOWER_ORDER.push('iron_06');
HR.TOWERS['iron_07']={id:'iron_07',name:'Armor Ace',family:'iron',symbol:'🂡',color:'#7d8a99',accent:'#d9e0e8',hp:150.0,dmg:8.48,cd:1.7,range:150,ability:'shield',role:'TANK',dr:0.12,unlockLevel:80,desc:'Ace in the hole, armored.',n:88};
HR.TOWER_ORDER.push('iron_07');
HR.TOWERS['iron_08']={id:'iron_08',name:'Bastion Bell',family:'iron',symbol:'🔔',color:'#7d8a99',accent:'#d9e0e8',hp:124.9,dmg:20.4,cd:1.4,range:172,ability:'aoe',role:'CONTROL',aoe:68,stun:0.12,stunDur:0.8,unlockLevel:81,desc:'Bell rings, foes flinch.',n:89};
HR.TOWER_ORDER.push('iron_08');
HR.TOWERS['iron_09']={id:'iron_09',name:'Titan Token',family:'iron',symbol:'🗿',color:'#7d8a99',accent:'#d9e0e8',hp:142.8,dmg:7.84,cd:1.5,range:146,ability:'shield',role:'TANK',dr:0.12,unlockLevel:82,desc:'A token the size of a door.',n:90};
HR.TOWER_ORDER.push('iron_09');
HR.TOWERS['star_00']={id:'star_00',name:'Star Ante',family:'star',symbol:'⭐',color:'#e8c547',accent:'#3b2a1a',hp:114.0,dmg:14.1,cd:1.03,range:209,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:83,desc:'Wish on the ante.',n:91};
HR.TOWER_ORDER.push('star_00');
HR.TOWERS['star_01']={id:'star_01',name:'Comet Chip',family:'star',symbol:'☄️',color:'#e8c547',accent:'#3b2a1a',hp:107.3,dmg:16.64,cd:0.82,range:237,ability:'pierce',role:'DPS',pierce:1,unlockLevel:84,desc:'A chip with a tail.',n:92};
HR.TOWER_ORDER.push('star_01');
HR.TOWERS['star_02']={id:'star_02',name:'Lunar Line',family:'star',symbol:'🌙',color:'#e8c547',accent:'#3b2a1a',hp:116.6,dmg:11.0,cd:1.17,range:198,ability:'slow',role:'CONTROL',slow:0.35,slowT:1.4,unlockLevel:85,desc:'Moon-slow the tracks.',n:93};
HR.TOWER_ORDER.push('star_02');
HR.TOWERS['star_03']={id:'star_03',name:'Solar Seven',family:'star',symbol:'☀️',color:'#e8c547',accent:'#3b2a1a',hp:104.1,dmg:6.24,cd:0.34,range:210,ability:'rapid',role:'DPS',multi:3,unlockLevel:86,desc:'Seven suns, seven shots.',n:94};
HR.TOWER_ORDER.push('star_03');
HR.TOWERS['star_04']={id:'star_04',name:'Wishbone Wheel',family:'star',symbol:'🦴',color:'#e8c547',accent:'#3b2a1a',hp:115.3,dmg:15.9,cd:0.94,range:197,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:87,desc:'Snap it, win it.',n:95};
HR.TOWER_ORDER.push('star_04');
HR.TOWERS['star_05']={id:'star_05',name:'Myth Marker',family:'star',symbol:'📜',color:'#e8c547',accent:'#3b2a1a',hp:98.3,dmg:36.72,cd:1.15,range:257,ability:'snipe',role:'SNIPE',markBonus:1.55,unlockLevel:88,desc:'Marks of old stories.',n:96};
HR.TOWER_ORDER.push('star_05');
HR.TOWERS['star_06']={id:'star_06',name:'Fate Fern',family:'star',symbol:'🌿',color:'#e8c547',accent:'#3b2a1a',hp:122.0,dmg:8.82,cd:1.65,range:162,ability:'buff',role:'SUPPORT',buff:0.14,unlockLevel:89,desc:'Fate grows in the gutter.',n:97};
HR.TOWER_ORDER.push('star_06');
HR.TOWERS['star_07']={id:'star_07',name:'Aurora Ace',family:'star',symbol:'🌈',color:'#e8c547',accent:'#3b2a1a',hp:97.6,dmg:14.1,cd:1.01,range:227,ability:'chain',role:'DPS',chain:2,unlockLevel:90,desc:'Color jumps the lanes.',n:98};
HR.TOWER_ORDER.push('star_07');
HR.TOWERS['star_08']={id:'star_08',name:'Eclipse Edge',family:'star',symbol:'🌑',color:'#e8c547',accent:'#3b2a1a',hp:93.3,dmg:29.12,cd:1.25,range:244,ability:'execute',role:'SNIPE',execute:0.18,unlockLevel:91,desc:'Light goes out for them.',n:99};
HR.TOWER_ORDER.push('star_08');
HR.TOWERS['star_09']={id:'star_09',name:'Hi',family:'star',symbol:'👋',color:'#e8c547',accent:'#3b2a1a',hp:114.0,dmg:15.0,cd:0.94,range:200,ability:'luck',role:'FORTUNE',luck:0.08,unlockLevel:92,desc:'Say hi to the roller. The table answers.',n:100};
HR.TOWER_ORDER.push('star_09');

HR.STARTER_TOWERS = HR.TOWER_ORDER.slice(0, 9);

HR.abilityName = {
  rapid:'Rapid Fire', aoe:'Sweep', snipe:'Pinpoint', crit:'Loaded Dice', gold:'Chip Rain',
  buff:'Rally', burn:'Kindling', slow:'Mire', shield:'Pavise', luck:'Fortune',
  pierce:'Throughline', split:'Split Bet', trap:'Gutter Trap', freeze:'Cold Call',
  execute:'All In', steal:'The Rake', regen:'Mending', bounce:'Skip', aura:'Presence',
  chain:'Echo', poison:'Bad Beat'
};

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

HR.treeFor = function (towerId) {
  const t = HR.TOWERS[towerId];
  if (!t) return { nodes: [], edges: [] };
  const h = hash(towerId);
  const ab = t.ability;
  const branchA = ['Edge', 'Wager', 'Strike'];
  const branchB = ['Ward', 'Fortune', 'Table'];
  const aName = branchA[h % 3];
  const bName = branchB[(h >> 3) % 3];
  const d1 = 0.08 + (h % 5) * 0.01;
  const d2 = 0.12 + ((h >> 2) % 5) * 0.01;
  const h1 = 0.08 + ((h >> 4) % 4) * 0.01;
  const c1 = 0.06 + ((h >> 6) % 4) * 0.01;
  const nodes = [
    { id: 'root', name: 'Attune', x: 50, y: 86, req: [], cost: 1, desc: '+6% damage, +4% HP', mods: { dmg: 0.06, hp: 0.04 } },
    { id: 'a1', name: aName + ' I', x: 24, y: 70, req: ['root'], cost: 1, desc: '+' + Math.round(d1*100) + '% damage', mods: { dmg: d1 } },
    { id: 'b1', name: bName + ' I', x: 76, y: 70, req: ['root'], cost: 1, desc: '+' + Math.round(h1*100) + '% HP', mods: { hp: h1 } },
    { id: 'a2', name: aName + ' II', x: 18, y: 54, req: ['a1'], cost: 1, desc: '-' + Math.round(c1*100) + '% cooldown', mods: { cd: -c1 } },
    { id: 'b2', name: bName + ' II', x: 82, y: 54, req: ['b1'], cost: 1, desc: '+12% range', mods: { range: 0.12 } },
    { id: 'a3', name: 'Track Sense', x: 30, y: 38, req: ['a2'], cost: 1, desc: '+1 track of aggro reach', mods: { trackReach: 1 } },
    { id: 'b3', name: 'Cabinet Blood', x: 70, y: 38, req: ['b2'], cost: 1, desc: 'Spin heals 8% HP', mods: { spinHeal: 0.08 } },
    { id: 'a4', name: HR.abilityName[ab] + ' +', x: 24, y: 22, req: ['a3'], cost: 2, desc: 'Empower the signature trick', mods: { sig: 0.35 } },
    { id: 'b4', name: 'Hot Hand', x: 76, y: 22, req: ['b3'], cost: 2, desc: 'In-match upgrades 15% cheaper', mods: { cheap: 0.15 } },
    { id: 'cap', name: t.name + ' Mastery', x: 50, y: 8, req: ['a4', 'b4'], cost: 3, desc: 'Capstone: +18% all stats, unique flourish', mods: { dmg: 0.18, hp: 0.18, cd: -0.08, cap: true } },
  ];
  const edges = [
    ['root','a1'],['root','b1'],['a1','a2'],['b1','b2'],['a2','a3'],['b2','b3'],['a3','a4'],['b3','b4'],['a4','cap'],['b4','cap']
  ];
  return { nodes, edges };
};

HR.talentMods = function (towerId, unlocked) {
  const tree = HR.treeFor(towerId);
  const mods = { dmg: 1, hp: 1, cd: 1, range: 1, sig: 0, trackReach: 0, spinHeal: 0, cheap: 0, cap: false, dr: 0 };
  tree.nodes.forEach((n) => {
    if (!unlocked || !unlocked[n.id]) return;
    const m = n.mods || {};
    if (m.dmg) mods.dmg += m.dmg;
    if (m.hp) mods.hp += m.hp;
    if (m.cd) mods.cd *= (1 + m.cd);
    if (m.range) mods.range += m.range;
    if (m.sig) mods.sig += m.sig;
    if (m.trackReach) mods.trackReach += m.trackReach;
    if (m.spinHeal) mods.spinHeal += m.spinHeal;
    if (m.cheap) mods.cheap += m.cheap;
    if (m.cap) mods.cap = true;
    if (m.dr) mods.dr += m.dr;
  });
  return mods;
};

HR.towerStats = function (typeId, matchLevel, skin, talentUnlocked) {
  const t = HR.TOWERS[typeId];
  const skinObj = (HR.LOG_SKINS && HR.LOG_SKINS[skin]) || { dmg: 1, hp: 1 };
  const tm = HR.talentMods(typeId, talentUnlocked);
  const dmgM = HR.upgradeMult(matchLevel, HR.UPGRADE_DMG) * skinObj.dmg * tm.dmg;
  const hpM = HR.upgradeMult(matchLevel, HR.UPGRADE_HP) * skinObj.hp * tm.hp;
  return {
    hp: Math.round(t.hp * hpM),
    dmg: t.dmg * dmgM,
    cd: Math.max(0.12, t.cd * tm.cd),
    range: t.range * tm.range,
    mods: tm,
  };
};

})(window);
