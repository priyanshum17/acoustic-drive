export class AudioAnnouncer {
  private static instance: AudioAnnouncer;
  private synth: SpeechSynthesis;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  
  private lastSpokenPrefix: string = "";
  private lastSpeakTime: number = 0;
  private throttleMs: number = 1500; 
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

  public playTick() {
    if (this.isMuted || !this.audioCtx) return;
    
    // Strictly prevent illegal resumes
    if (this.audioCtx.state === 'suspended') return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + 0.05);

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

  public speak(itemText: string, level: number) {
    if (this.isMuted) return;

    const now = performance.now();
    
    // Extremely strict hard-throttle (350ms). Browsers natively crash if you 
    // spam SpeechSynthesis.cancel() repeatedly on MacOS at higher speeds!
    if (now - this.lastSpeakTime < 350) return;

    let toSpeak = itemText;
    let isMajorBoundary = false;

    // Boundary tracking checks
    const currentFirstLetter = itemText.charAt(0).toUpperCase();
    let lastFirstLetter = "";
    if (this.lastSpokenPrefix.length > 0) {
      lastFirstLetter = this.lastSpokenPrefix.charAt(0).toUpperCase();
    }
    isMajorBoundary = lastFirstLetter !== currentFirstLetter;
    
    if (level === 2) {
      toSpeak = itemText.split(',')[0];
    } else if (level >= 3) {
      if (isMajorBoundary) {
         // Just natively say "C"
         toSpeak = currentFirstLetter;
      } else {
         // Space the letters so the AI says "C A" rather than pronouncing "Ca" as "Kah"
         const limit = Math.min(2, itemText.length);
         toSpeak = itemText.substring(0, limit).toUpperCase().split('').join(' ');
      }
    }

    // Orientation checking for Level 3+
    if (level >= 3 && !isMajorBoundary) {
       // Only announce orientation if staying securely within the same boundary for 1.5s
       if (now - this.lastSpeakTime < this.throttleMs) {
          return;
       }
    } else if (level < 3) {
       // Stop duplicate speaking of the same exact target
       if (this.lastSpokenPrefix === toSpeak) return;
    }

    this.cancel(); 
    this.lastSpokenPrefix = toSpeak;
    this.lastSpeakTime = now;

    try {
      const utterance = new SpeechSynthesisUtterance(toSpeak);
      if (this.activeVoice) utterance.voice = this.activeVoice;
      utterance.rate = 1.0; 
      utterance.volume = 1.0;
      this.synth.speak(utterance);
    } catch(e) {}
  }
}
