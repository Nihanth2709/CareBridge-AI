// Comprehensive Audio & Microphone Utilities for CareBridge AI

export interface AudioRecordingSession {
  stop: () => Promise<{ base64: string; mimeType: string }>;
  cancel: () => void;
}

export function playReminderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523.25, now);
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    // Audio context fallback
  }
}

export function playBeep(isStart: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isStart ? 440 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(isStart ? 880 : 440, now + 0.12);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Ignore
  }
}

// Convert Blob to Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      const base64Data = res.split(',')[1] || res;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Start Native MediaRecorder safely
export async function startAudioRecording(
  onVolumeChange?: (volume: number) => void
): Promise<AudioRecordingSession> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error('Microphone recording is not supported in this browser or iframe environment.');
  }

  // Explicitly prompt for mic permission
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  playBeep(true);

  // Set up volume analyzer
  let audioCtx: AudioContext | null = null;
  let animFrameId: number | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        if (onVolumeChange) {
          onVolumeChange(Math.min(100, Math.round((avg / 128) * 100)));
        }
        animFrameId = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    }
  } catch (e) {
    console.warn('Volume analyser not available:', e);
  }

  // Determine supported mimeType
  let mimeType = 'audio/webm';
  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    }
  }

  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.start(100);

  const cleanup = () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.close();
      } catch (e) {}
    }
    stream.getTracks().forEach((track) => track.stop());
  };

  return {
    stop: () => {
      return new Promise((resolve) => {
        let resolved = false;
        const finish = async () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          playBeep(false);
          try {
            const finalBlob = new Blob(chunks, { type: mimeType });
            const base64 = chunks.length > 0 ? await blobToBase64(finalBlob) : '';
            resolve({
              base64,
              mimeType: mimeType.split(';')[0],
            });
          } catch (e) {
            resolve({ base64: '', mimeType: 'audio/webm' });
          }
        };

        mediaRecorder.onstop = finish;

        // Fallback safety timeout if onstop doesn't fire
        setTimeout(finish, 2000);

        if (mediaRecorder.state !== 'inactive') {
          try {
            if (typeof (mediaRecorder as any).requestData === 'function') {
              (mediaRecorder as any).requestData();
            }
          } catch (e) {}
          try {
            mediaRecorder.stop();
          } catch (e) {
            finish();
          }
        } else {
          finish();
        }
      });
    },
    cancel: () => {
      cleanup();
      try {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      } catch (e) {}
    },
  };
}

// Fallback / Hybrid Web Speech Recognition supporting Telugu, Hindi, Tamil & English
export function setupSpeechRecognition(
  lang: 'en' | 'hi' | 'te' | 'ta',
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    // Accurate BCP-47 language tags for Telugu, Hindi, Tamil & English (India)
    const langMap = {
      te: 'te-IN', // Telugu (India)
      hi: 'hi-IN', // Hindi (India)
      ta: 'ta-IN', // Tamil (India)
      en: 'en-IN', // English (India)
    };
    recognition.lang = langMap[lang] || 'en-IN';

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }
      if (fullTranscript.trim()) {
        onResult(fullTranscript, isFinal);
      }
    };

    if (onError) {
      recognition.onerror = (event: any) => {
        // Ignore benign no-speech timeout
        if (event.error === 'no-speech') {
          return;
        }
        onError(event);
      };
    }

    if (onEnd) {
      recognition.onend = onEnd;
    }

    return recognition;
  } catch (err) {
    console.warn('SpeechRecognition creation failed:', err);
    return null;
  }
}

// Check if Speech Recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
}
