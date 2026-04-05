export class AudioAnnouncer {
  private static instance: AudioAnnouncer;
  private synth: SpeechSynthesis;
  private isMuted: boolean = false;
  private lastSpokenText: string = "";
  
  private constructor() {
    this.synth = window.speechSynthesis;
  }
  
  public static getInstance(): AudioAnnouncer {
    if (!AudioAnnouncer.instance) {
      AudioAnnouncer.instance = new AudioAnnouncer();
    }
    return AudioAnnouncer.instance;
  }
  
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.cancel();
  }

  public cancel() {
    this.synth.cancel();
  }

  public init() {
    // Trigger empty speech to unlock audio context on some browsers after user interaction
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    this.synth.speak(utterance);
  }

  public speak(fullText: string, level: number) {
    if (this.isMuted) return;

    let toSpeak = fullText;
    
    if (level === 2) {
      toSpeak = fullText.split(',')[0]; // Just the last name
    } else if (level >= 3) {
      toSpeak = fullText.charAt(0).toUpperCase();
    }

    if (toSpeak === this.lastSpokenText) return;
    
    this.cancel(); // Stop current speech immediately
    this.lastSpokenText = toSpeak;

    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.rate = Math.min(2.5, 1 + level * 0.3); // Speak faster at higher levels
    this.synth.speak(utterance);
  }
}
