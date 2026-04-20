export class AudioAnnouncer {
  private static instance: AudioAnnouncer;
  private synth: SpeechSynthesis;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  
  private lastSpokenPrefix: string = "";
  private lastSpeakTime: number = 0;
  private activeVoice: SpeechSynthesisVoice | null = null;
  
  private constructor() {
    this.synth = window.speechSynthesis;
    
    // Attempt to eagerly cache a voice. Without an explicit voice, some OSs stay mute!
    const populateVoices = () => {
       const voices = this.synth.getVoices();
       if (voices.length > 0) {
          this.activeVoice = voices.find(v => v.name.includes('Premium') || v.name.includes('Google') || v.lang.startsWith('en')) || voices[0];
       }
    };
    populateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
       this.synth.onvoiceschanged = populateVoices;
    }
  }
  
  public static getInstance(): AudioAnnouncer {
    if (!AudioAnnouncer.instance) {
      AudioAnnouncer.instance = new AudioAnnouncer();
    }
    return AudioAnnouncer.instance;
  }

  public init() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(console.error);
      }

      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance("System Online");
      if (this.activeVoice) utterance.voice = this.activeVoice;
      utterance.volume = 1.0;
      this.synth.speak(utterance);

      this.lastSpokenPrefix = "System Online";
      this.lastSpeakTime = performance.now();
    } catch(e) {
      console.error("Audio Initialization Error", e);
    }
  }

  public playTick(char?: string) {
    if (this.isMuted || !this.audioCtx) return;
    
    // Strictly prevent illegal resumes
    if (this.audioCtx.state === 'suspended') return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = 'sine';
      let freq = 800;
      if (char) {
        const code = char.toUpperCase().charCodeAt(0);
        if (code >= 65 && code <= 90) { // A-Z
          freq = 800 + (code - 65) * (800 / 25);
        }
      }

      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime); // Very loud
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch(e) {}
  }

  public cancel() {
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }
  }

  public speak(itemText: string, rate: number = 1.0, spellOut: boolean = false, force: boolean = false): boolean {
    if (this.isMuted) return false;

    const now = performance.now();
    
    const dynamicThrottle = spellOut ? 100 : 350;
    if (!force && (now - this.lastSpeakTime < dynamicThrottle)) return false;

    let toSpeak = itemText;
    if (spellOut) {
       // Space out letters so the AI says "C A" rather than pronouncing "Ca" as "Kah"
       toSpeak = itemText.toUpperCase().split('').join(' ');
    }

    if (!force && this.lastSpokenPrefix === toSpeak && !spellOut) return false;

    this.cancel(); 
    this.lastSpokenPrefix = toSpeak;
    this.lastSpeakTime = now;

    try {
      const utterance = new SpeechSynthesisUtterance(toSpeak);
      if (this.activeVoice) utterance.voice = this.activeVoice;
      utterance.rate = Math.min(Math.max(rate, 0.8), 2.5); 
      utterance.volume = 1.0;
      this.synth.speak(utterance);
      return true;
    } catch(e) {
      return false;
    }
  }
}
