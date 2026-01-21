
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class LiveSession {
  private ai: any;
  private session: any;
  private inputAudioContext?: AudioContext;
  private outputAudioContext?: AudioContext;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private onTranscription?: (text: string, role: 'user' | 'model') => void;

  constructor(onTranscription?: (text: string, role: 'user' | 'model') => void) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.onTranscription = onTranscription;
  }

  async start() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = this.inputAudioContext!.createMediaStreamSource(stream);
          const scriptProcessor = this.inputAudioContext!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then((s: any) => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(this.inputAudioContext!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            this.onTranscription?.(message.serverContent.outputTranscription.text, 'model');
          } else if (message.serverContent?.inputTranscription) {
            this.onTranscription?.(message.serverContent.inputTranscription.text, 'user');
          }

          const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext!.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64), this.outputAudioContext!, 24000, 1);
            const source = this.outputAudioContext!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext!.destination);
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.sources.add(source);
          }
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      }
    });

    this.session = await sessionPromise;
  }

  stop() {
    this.session?.close();
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    this.sources.forEach(s => s.stop());
  }
}
