import { Room, type Client } from '@colyseus/core';
import { Schema, MapSchema, type } from '@colyseus/schema';

/* Authoritative 1v1 High Roller room.
 * Clients send input only: rotate, place, upgrade, ability.
 * Combat, minions, chips, and win conditions run here. */

export class TowerState extends Schema {
  @type('string') id = '';
  @type('string') type = 'slot';
  @type('number') hp = 100;
  @type('number') maxHp = 100;
  @type('number') level = 1;
  @type('number') slot = 0;
  @type('number') log = 0;
  @type('boolean') alive = true;
}

export class MinionState extends Schema {
  @type('string') id = '';
  @type('number') owner = 0;
  @type('number') lane = 0;
  @type('number') x = 0;
  @type('number') y = 0;
  @type('number') hp = 50;
}

export class PlayerState extends Schema {
  @type('string') sessionId = '';
  @type('string') userId = '';
  @type('string') username = 'Guest';
  @type('number') chips = 150;
  @type('number') rank = 0;
  @type('number') spinCd = 0;
  @type('number') ddCd = 0;
  @type('number') doubleT = 0;
  @type('number') damage = 0;
  @type({ map: TowerState }) towers = new MapSchema<TowerState>();
}

export class MatchState extends Schema {
  @type('number') timeLeft = 300;
  @type('number') countdown = 3;
  @type('boolean') started = false;
  @type('boolean') over = false;
  @type('string') winnerId = '';
  @type('number') logCount = 1;
  @type('number') slotCount = 3;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: MinionState }) minions = new MapSchema<MinionState>();
}

type Input =
  | { kind: 'rotate'; log: number }
  | { kind: 'place'; log: number; slot: number; type: string }
  | { kind: 'upgrade'; type: string }
  | { kind: 'ability'; name: 'spin' | 'double' | 'emote' };

export class HighRollerRoom extends Room<{ state: MatchState }> {
  maxClients = 2;
  patchRate = 50; // 20 Hz
  private simulationActive = false;
  private spawnAcc = 0;
  private simHz = 20;

  onCreate() {
    this.setState(new MatchState());
    this.setFixedTimestep((step) => {
      if (this.simulationActive) this.simulate(step.dt);
    }, this.simHz);
    this.onMessage('input', (client, data: Input) => this.handleInput(client, data));
    this.onMessage('ready', (client) => {
      const p = this.state.players.get(client.sessionId);
      if (p) p.username = p.username || 'Guest';
      if (this.clients.length === 2 && !this.state.started) this.beginCountdown();
    });
  }

  onJoin(client: Client, options: { userId?: string; username?: string; rank?: number }) {
    const p = new PlayerState();
    p.sessionId = client.sessionId;
    p.userId = options?.userId || client.sessionId;
    p.username = options?.username || 'Guest';
    p.rank = options?.rank || 0;
    // starter towers
    ['slot', 'roulette', 'cards'].forEach((type, i) => {
      const t = new TowerState();
      t.id = client.sessionId + '-0-' + i;
      t.type = type;
      t.slot = i;
      t.log = 0;
      p.towers.set(t.id, t);
    });
    this.state.players.set(client.sessionId, p);
    if (this.clients.length === 2) this.beginCountdown();
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    if (!this.state.over && this.state.started) {
      this.state.over = true;
      const remaining = Array.from(this.state.players.keys())[0];
      this.state.winnerId = remaining || '';
      this.broadcast('over', { winnerId: this.state.winnerId, reason: 'disconnect' });
    }
  }

  private beginCountdown() {
    if (this.state.started || this.simulationActive) return;
    this.clock.setTimeout(() => {
      this.state.countdown = 0;
      this.state.started = true;
      this.simulationActive = true;
    }, 3000);
  }

  private simulate(dt: number) {
    if (this.state.over) return;
    this.state.timeLeft = Math.max(0, this.state.timeLeft - dt);
    this.spawnAcc += dt;

    this.state.players.forEach((p) => {
      p.spinCd = Math.max(0, p.spinCd - dt);
      p.ddCd = Math.max(0, p.ddCd - dt);
      p.doubleT = Math.max(0, p.doubleT - dt);
    });

    const elapsed = 300 - this.state.timeLeft;
    if (elapsed > 100 && this.state.logCount < 2) {
      this.state.logCount = 2; this.state.slotCount = 4;
    }
    if (elapsed > 200 && this.state.logCount < 3) {
      this.state.logCount = 3; this.state.slotCount = 6;
    }

    if (this.spawnAcc >= 3) {
      this.spawnAcc = 0;
      this.spawnMinions();
    }

    this.stepMinions(dt);
    this.stepCombat(dt);

    if (this.state.timeLeft <= 0) this.finish('timer');
  }

  private spawnMinions() {
    const ids = Array.from(this.state.players.keys());
    ids.forEach((sid, owner) => {
      for (let lane = 0; lane < 2; lane++) {
        const m = new MinionState();
        m.id = 'm' + Date.now() + '-' + owner + '-' + lane + '-' + Math.random().toString(36).slice(2, 6);
        m.owner = owner;
        m.lane = lane;
        m.x = lane === 0 ? 70 : 1010;
        m.y = owner === 0 ? 2100 : 160;
        m.hp = 50;
        this.state.minions.set(m.id, m);
      }
    });
  }

  private stepMinions(dt: number) {
    const speed = 90;
    const toDelete: string[] = [];
    const players = Array.from(this.state.players.values());
    this.state.minions.forEach((m, id) => {
      const dir = m.owner === 0 ? -1 : 1;
      m.y += dir * speed * dt;
      const scored = (m.owner === 0 && m.y < 140) || (m.owner === 1 && m.y > 2140);
      if (scored) {
        const p = players[m.owner];
        if (p) p.chips += 10 * (p.doubleT > 0 ? 2 : 1);
        toDelete.push(id);
      } else if (m.hp <= 0) {
        toDelete.push(id);
      }
    });
    toDelete.forEach((id) => this.state.minions.delete(id));
  }

  private stepCombat(dt: number) {
    // Simplified authoritative combat: each living tower chips the nearest enemy minion.
    const players = Array.from(this.state.players.values());
    players.forEach((p, idx) => {
      p.towers.forEach((t) => {
        if (!t.alive) return;
        let best: MinionState | null = null;
        let bestD = 240;
        for (const m of this.state.minions.values()) {
          if (m.owner === idx) continue;
          const d = Math.abs(m.y - (idx === 0 ? 1600 : 740));
          if (d < bestD) { bestD = d; best = m; }
        }
        if (best) {
          const dmg = 12 * dt * t.level;
          best.hp -= dmg;
          p.damage += dmg;
        }
      });
    });
  }

  private handleInput(client: Client, data: Input) {
    const p = this.state.players.get(client.sessionId);
    if (!p || this.state.over || !this.state.started) return;
    if (data.kind === 'ability' && data.name === 'spin') {
      if (p.spinCd > 0 || p.chips < 50) return;
      p.chips -= 50;
      p.spinCd = 10;
      this.broadcast('fx', { type: 'spin', who: client.sessionId, log: 0 });
    } else if (data.kind === 'ability' && data.name === 'double') {
      if (p.ddCd > 0) return;
      p.doubleT = 5;
      p.ddCd = 20;
    } else if (data.kind === 'place') {
      if (p.chips < 80) return;
      p.chips -= 80;
      const t = new TowerState();
      t.id = client.sessionId + '-' + data.log + '-' + data.slot + '-' + Date.now();
      t.type = data.type;
      t.log = data.log;
      t.slot = data.slot;
      p.towers.set(t.id, t);
    } else if (data.kind === 'rotate') {
      this.broadcast('fx', { type: 'spin', who: client.sessionId, log: data.log });
    } else if (data.kind === 'upgrade') {
      // client still owns persistent upgrades via Supabase; match chips pay for in-hand bump
      const cost = 200;
      if (p.chips < cost) return;
      p.chips -= cost;
    }
  }

  private finish(reason: string) {
    this.state.over = true;
    const arr = Array.from(this.state.players.values());
    arr.sort((a, b) => b.chips - a.chips);
    this.state.winnerId = arr[0]?.sessionId || '';
    this.broadcast('over', {
      winnerId: this.state.winnerId,
      reason,
      chips: arr.map((p) => ({ id: p.sessionId, chips: p.chips, damage: p.damage })),
    });
    this.simulationActive = false;
    this.clock.setTimeout(() => this.disconnect(), 8000);
  }
}
