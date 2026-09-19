// Web Audio API Synthesizer for PE Classroom AR Games
// Generates coach whistles, beeps, hits, and fanfare without external MP3 dependencies

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Coach Whistle sound with modulation
  playWhistle() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(2400, ctx.currentTime);
      // Frequency trill/wobble like a pea in a referee whistle
      osc1.frequency.setValueAtTime(2450, ctx.currentTime + 0.05);
      osc1.frequency.setValueAtTime(2380, ctx.currentTime + 0.1);
      osc1.frequency.setValueAtTime(2440, ctx.currentTime + 0.15);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2850, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.45);
      osc2.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio fallback silent
    }
  }

  // Countdown Beep (pitch: standard or high for GO!)
  playBeep(isGo: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = isGo ? 880 : 440;
      const duration = isGo ? 0.35 : 0.15;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }

  // Hit sound when touching an AR target
  playHit(combo: number = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Pitch goes slightly higher with combo
      const baseFreq = Math.min(520 + combo * 40, 1100);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio fallback silent
    }
  }

  // Correct answer / Bonus sound
  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.18, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.18);
      });
    } catch {
      // Audio fallback silent
    }
  }

  // Wrong / Hazard hit buzz
  playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Audio fallback silent
    }
  }

  // Level complete fanfare
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.15 },
        { f: 1046.5, d: 0.35 }
      ];
      let offset = ctx.currentTime;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, offset);
        gain.gain.setValueAtTime(0.22, offset);
        gain.gain.exponentialRampToValueAtTime(0.001, offset + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(offset);
        osc.stop(offset + n.d);
        offset += n.d * 0.85;
      });
    } catch {
      // Audio fallback silent
    }
  }

  // Voice announcement in Thai for PE class
  speakStudentCall(name: string, number?: string) {
    if (!this.enabled) return;
    this.playBeep(true);
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const phrase = number 
          ? `เชิญ ${name} เลขที่ ${number} ประจำจุดทดสอบครับ` 
          : `เชิญ ${name} ประจำจุดทดสอบครับ`;
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'th-TH';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        
        // Try to pick a Thai voice if available
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(v => v.lang.includes('th') || v.lang.includes('TH'));
        if (thaiVoice) {
          utterance.voice = thaiVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis failed or unsupported
      }
    }
  }
}

export const sound = new SoundEngine();
