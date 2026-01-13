import { EffectParams } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private stopCallback: (() => void) | null = null;

  constructor() {
    // Lazy initialization in init()
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      
      this.analyser.fftSize = 2048;
      this.masterGain.gain.value = 0.4;
    }
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // Generate pentatonic scale frequencies starting at C4
  private getPentatonicScale(rootFreq: number = 261.63): number[] {
    // Pentatonic Major: Root, M2, M3, P5, M6
    const ratios = [1, 9/8, 5/4, 3/2, 5/3, 2];
    return ratios.map(r => rootFreq * r);
  }

  // Create a distortion curve
  private makeDistortionCurve(amount: number) {
    // Standard distortion curve
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    
    const x_val = amount * 100; 

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + x_val) * x * 20 * deg) / (Math.PI + x_val * Math.abs(x));
    }
    return curve;
  }

  public async playToneSequence(params: EffectParams, onComplete?: () => void) {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    
    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    const now = this.ctx!.currentTime;
    const notes = this.getPentatonicScale();
    const noteDuration = 0.3;
    const release = 0.5;

    // --- Build Effect Chain ---
    
    // 1. Source voices (pre-effects)
    const sourceBus = this.ctx!.createGain();

    // 2. Distortion
    const distortionNode = this.ctx!.createWaveShaper();
    if (params.distortion > 0.01) {
       distortionNode.curve = this.makeDistortionCurve(params.distortion * 8); 
       distortionNode.oversample = '4x';
    } else {
       distortionNode.curve = null;
    }

    // 3. Tremolo (Amplitude Modulation)
    const tremoloGain = this.ctx!.createGain();
    let tremoloOsc: OscillatorNode | null = null;
    let tremoloDepthGain: GainNode | null = null;
    
    if (params.tremoloDepth > 0) {
        tremoloOsc = this.ctx!.createOscillator();
        tremoloOsc.type = 'sine';
        tremoloOsc.frequency.value = 5; // 5Hz wobble
        
        tremoloDepthGain = this.ctx!.createGain();
        tremoloDepthGain.gain.value = params.tremoloDepth * 0.8; // Depth

        // Tremolo routing: LFO -> Depth -> GainNode.gain
        // We set base gain to 1 - (depth/2) to keep average volume consistent-ish
        tremoloGain.gain.value = 1 - (params.tremoloDepth * 0.4);
        tremoloOsc.connect(tremoloDepthGain);
        tremoloDepthGain.connect(tremoloGain.gain);
        
        tremoloOsc.start(now);
    }

    // 4. Delay
    const delayNode = this.ctx!.createDelay();
    const delayFeedback = this.ctx!.createGain();
    const delayDry = this.ctx!.createGain();
    const delayWet = this.ctx!.createGain();
    
    delayNode.delayTime.value = params.delayTime * 0.6; // Max 0.6s
    delayFeedback.gain.value = params.delayFeedback * 0.7; // Max 0.7 feedback
    
    const useDelay = params.delayTime > 0.01;

    // --- Wiring ---
    
    let currentNode: AudioNode = sourceBus;

    // Distortion
    currentNode.connect(distortionNode);
    currentNode = distortionNode;

    // Tremolo
    currentNode.connect(tremoloGain);
    currentNode = tremoloGain;

    // Delay Logic
    if (useDelay) {
        const delayIn = currentNode;
        const delayOut = this.ctx!.createGain();

        // Dry path
        delayIn.connect(delayDry);
        delayDry.connect(delayOut);
        
        // Wet path
        delayIn.connect(delayNode);
        delayNode.connect(delayFeedback);
        delayFeedback.connect(delayNode); // Feedback loop
        delayNode.connect(delayWet);
        delayWet.connect(delayOut);

        delayDry.gain.value = 1; 
        delayWet.gain.value = 0.5; 

        currentNode = delayOut;
    }

    currentNode.connect(this.masterGain!);

    // --- Vibrato LFO (Global) ---
    let vibratoOsc: OscillatorNode | null = null;
    let vibratoGain: GainNode | null = null;
    if (params.vibratoDepth > 0) {
        vibratoOsc = this.ctx!.createOscillator();
        vibratoOsc.frequency.value = 6; // 6Hz vibrato
        vibratoGain = this.ctx!.createGain();
        vibratoGain.gain.value = params.vibratoDepth * 30; // +/- 30 cents at max
        vibratoOsc.connect(vibratoGain);
        vibratoOsc.start(now);
    }

    // --- Play Notes ---
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        
        // Use Triangle for richer harmonics (better for effects)
        osc.type = 'triangle'; 
        osc.frequency.value = freq;
        
        // Connect Vibrato if active
        if (vibratoGain) {
            vibratoGain.connect(osc.detune);
        }
        
        const startTime = now + (i * noteDuration);
        const endTime = startTime + noteDuration;

        oscGain.gain.setValueAtTime(0, startTime);
        oscGain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
        oscGain.gain.exponentialRampToValueAtTime(0.001, endTime + release); // Release

        osc.connect(oscGain);
        oscGain.connect(sourceBus);

        osc.start(startTime);
        osc.stop(endTime + release);

        oscillators.push(osc);
        gains.push(oscGain);
    });

    // Cleanup function
    const totalDuration = (notes.length * noteDuration) + release + (useDelay ? 2.0 : 0);
    
    const timeoutId = setTimeout(() => {
        this.isPlaying = false;
        if (tremoloOsc) tremoloOsc.stop();
        if (vibratoOsc) vibratoOsc.stop();
        if (onComplete) onComplete();
    }, totalDuration * 1000);

    this.stopCallback = () => {
        clearTimeout(timeoutId);
        oscillators.forEach(o => {
            try { o.stop(); } catch(e) {}
        });
        if (tremoloOsc) try { tremoloOsc.stop(); } catch(e) {}
        if (vibratoOsc) try { vibratoOsc.stop(); } catch(e) {}
        
        this.isPlaying = false;
        if (onComplete) onComplete();
    };
  }

  public stop() {
    if (this.stopCallback) {
        this.stopCallback();
        this.stopCallback = null;
    }
  }
}

export const audioService = new AudioEngine();