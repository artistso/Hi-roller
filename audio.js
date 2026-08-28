/* Hi Roller — loopable action music + cartoon SFX */
(function (g) {
  'use strict';
  const HR = g.HR;

  const AudioBus = {
    ctx: null,
    master: null,
    musicGain: null,
    sfxGain: null,
    unlocked: false,
    musicOn: false,
    mode: 'menu', // menu | battle
    _next: 0,
    _timer: 0,
    _nodes: [],

    unlock() {
      if (this.unlocked) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.22;
        this.musicGain.connect(this.master);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.master);
        this.unlocked = true;
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) {}
    },

    setMusic(on) {
      if (!this.unlocked) return;
      this.musicGain.gain.setTargetAtTime(on ? 0.22 : 0, this.ctx.currentTime, 0.2);
      if (on && !this.musicOn) this.startMusic(this.mode);
      if (!on) this.stopMusic();
    },
    setSfx(on) {
      if (!this.unlocked) return;
      this.sfxGain.gain.value = on ? 0.5 : 0;
    },
    setMode(mode) {
      if (this.mode === mode) return;
      this.mode = mode;
      if (this.musicOn) { this.stopMusic(); this.startMusic(mode); }
    },

    tone(freq, dur, type, gain, at, slide) {
      if (!this.unlocked) return;
      const t = this.ctx.currentTime + (at || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.sfxGain);
      o.start(t); o.stop(t + dur + 0.02);
    },
    noise(dur, gain, at, freq) {
      if (!this.unlocked) return;
      const t = this.ctx.currentTime + (at || 0);
      const n = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = freq || 1600;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(this.sfxGain);
      src.start(t); src.stop(t + dur);
    },

    chip() { this.tone(880, 0.06, 'triangle', 0.07); this.tone(1320, 0.07, 'sine', 0.05, 0.03); },
    click() { this.tone(480, 0.04, 'square', 0.035); },
    shot() { this.tone(620, 0.05, 'square', 0.045, 0, 170); this.noise(0.04, 0.035); },
    hit() { this.tone(170, 0.08, 'sawtooth', 0.06, 0, 70); },
    stun() { this.tone(980, 0.12, 'sine', 0.06); this.tone(1470, 0.14, 'sine', 0.04, 0.04); },
    spin() { this.noise(0.32, 0.07, 0, 2200); this.tone(180, 0.4, 'sine', 0.07, 0, 90); this.tone(540, 0.16, 'triangle', 0.05, 0.24); },
    crumble() { this.noise(0.32, 0.1); this.tone(90, 0.35, 'sawtooth', 0.08, 0, 40); },
    place() { this.tone(330, 0.1, 'triangle', 0.07); this.tone(495, 0.12, 'sine', 0.05, 0.05); },
    upgrade() { this.tone(523, 0.1, 'sine', 0.07); this.tone(659, 0.12, 'sine', 0.07, 0.08); this.tone(784, 0.16, 'sine', 0.09, 0.16); },
    win() { [523, 659, 784, 1046].forEach((n, i) => this.tone(n, 0.28, 'triangle', 0.09, i * 0.12)); },
    lose() { this.tone(392, 0.3, 'sine', 0.09, 0, 220); this.tone(311, 0.45, 'triangle', 0.07, 0.18, 140); },
    warn() { this.tone(740, 0.08, 'square', 0.05); this.tone(740, 0.08, 'square', 0.05, 0.12); },
    score() { this.chip(); this.tone(1174, 0.1, 'sine', 0.06, 0.05); },

    /* ---- loopable music ---- */
    startMusic(mode) {
      if (!this.unlocked) return;
      this.stopMusic();
      this.musicOn = true;
      this.mode = mode || this.mode || 'menu';
      this._next = this.ctx.currentTime + 0.05;
      this._loop();
    },

    _loop() {
      if (!this.musicOn || !this.unlocked) return;
      const ctx = this.ctx;
      const start = this._next;
      const battle = this.mode === 'battle';
      const bpm = battle ? 132 : 92;
      const beat = 60 / bpm;
      const bars = 8;
      const loop = beat * 4 * bars;

      const mk = (freq, t, dur, type, gain, dest) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(dest || this.musicGain);
        o.start(t); o.stop(t + dur + 0.02);
        this._nodes.push(o);
      };

      // Kick + snare from noise/sine
      for (let bar = 0; bar < bars; bar++) {
        for (let b = 0; b < 4; b++) {
          const t = start + (bar * 4 + b) * beat;
          if (b === 0 || (battle && b === 2)) {
            mk(90, t, 0.18, 'sine', battle ? 0.22 : 0.12);
            mk(55, t, 0.22, 'triangle', 0.1);
          }
          if (b === 1 || b === 3) {
            this._hat(t, battle ? 0.05 : 0.03);
          }
          if (battle && b === 1) this._hat(t + beat * 0.5, 0.03);
        }
      }

      // Bass ostinato (original folk-action, not a licensed melody)
      const bass = battle
        ? [146.83, 146.83, 130.81, 110, 146.83, 164.81, 130.81, 110]
        : [98, 98, 87.31, 82.41, 98, 110, 87.31, 73.42];
      bass.forEach((f, i) => {
        const t = start + i * beat * 4;
        mk(f, t, beat * 3.2, 'triangle', battle ? 0.14 : 0.1);
        mk(f * 0.5, t, beat * 3.2, 'sine', 0.08);
      });

      // Melody — mixolydian-ish adventure hook, 8 bars, loops cleanly back to tonic
      const scale = battle
        ? [293.66, 329.63, 349.23, 392, 440, 392, 349.23, 329.63, 293.66, 246.94, 261.63, 293.66, 349.23, 329.63, 293.66, 246.94]
        : [196, 220, 246.94, 261.63, 293.66, 261.63, 246.94, 220, 196, 174.61, 196, 220, 246.94, 220, 196, 174.61];
      scale.forEach((f, i) => {
        const t = start + i * beat * 2;
        mk(f, t, beat * 1.7, battle ? 'square' : 'sine', battle ? 0.045 : 0.07);
        if (!battle) mk(f * 2, t + 0.02, beat * 1.4, 'triangle', 0.025);
      });

      // Harmony pad (held, loopable)
      const padF = battle ? 196 : 130.81;
      mk(padF, start, loop - 0.05, 'sine', 0.04);
      mk(padF * 1.5, start, loop - 0.05, 'sine', 0.03);

      this._next = start + loop;
      const wait = Math.max(50, (this._next - ctx.currentTime - 0.15) * 1000);
      this._timer = setTimeout(() => this._loop(), wait);
    },

    _hat(t, gain) {
      if (!this.unlocked) return;
      const n = Math.floor(this.ctx.sampleRate * 0.05);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 5000;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      src.connect(f); f.connect(g); g.connect(this.musicGain);
      src.start(t); src.stop(t + 0.06);
      this._nodes.push(src);
    },

    stopMusic() {
      this.musicOn = false;
      clearTimeout(this._timer);
      this._nodes.forEach((n) => { try { n.stop && n.stop(); } catch (e) {} });
      this._nodes = [];
    },
  };

  HR.Audio = AudioBus;
})(window);
