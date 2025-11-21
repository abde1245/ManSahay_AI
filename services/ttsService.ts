
class TTSService {
    private synth: SpeechSynthesis | null = null;
    private voice: SpeechSynthesisVoice | null = null;
    private enabled: boolean = false;
  
    constructor() {
      if (typeof window !== 'undefined') {
        this.synth = window.speechSynthesis;
        // Try to load voices immediately
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = this.loadVoice.bind(this);
        }
        this.loadVoice();
      }
    }
  
    private loadVoice() {
      if (!this.synth) return;
      const voices = this.synth.getVoices();
      // Prefer a natural sounding English voice
      this.voice = voices.find(v => v.name.includes('Google US English')) || 
                   voices.find(v => v.name.includes('Samantha')) || 
                   voices.find(v => v.lang === 'en-US') || 
                   voices[0];
    }
  
    public setEnabled(state: boolean) {
      this.enabled = state;
      if (!state && this.synth) {
        this.synth.cancel();
      }
    }
  
    public isEnabled(): boolean {
      return this.enabled;
    }
  
    public speak(text: string) {
      if (!this.enabled || !this.synth || !this.voice) return;
  
      // Stop any current speech
      this.synth.cancel();
  
      // Clean text (remove Markdown like **bold** or links)
      const cleanText = text.replace(/[*#_\[\]]/g, '');
  
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = this.voice;
      utterance.rate = 0.95; // Slightly slower for calming effect
      utterance.pitch = 1;
      
      this.synth.speak(utterance);
    }
  
    public stop() {
      if (this.synth) {
        this.synth.cancel();
      }
    }
  }
  
  export const ttsService = new TTSService();
