
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { useLanguage, Source } from '../types';
import { ai } from '../services/geminiService';

// Audio helper functions from guidelines
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
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

function createBlob(data: Float32Array): GenAI_Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

interface LiveTutorPageProps {
    handleApiError: (err: unknown) => string;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
type TranscriptionPart = { speaker: 'user' | 'model'; text: string; };

const LiveTutorPage: React.FC<LiveTutorPageProps> = ({ handleApiError }) => {
    const { language, t } = useLanguage();
    
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [transcription, setTranscription] = useState<TranscriptionPart[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const outputAudioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    
    const cleanup = useCallback(() => {
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        
        if (inputAudioContextRef.current?.state !== 'closed') {
            inputAudioContextRef.current?.close().catch(console.error);
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
            outputAudioContextRef.current?.close().catch(console.error);
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        
        outputAudioSourcesRef.current.forEach(source => source.stop());
        outputAudioSourcesRef.current.clear();
        
        sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
        
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        mediaStreamRef.current = null;
        sessionPromiseRef.current = null;
    }, []);

    const startConversation = async () => {
        setConnectionState('connecting');
        setTranscription([]);
        setSources([]);
        nextStartTimeRef.current = 0;

        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        let currentInput = '';
                        let currentOutput = '';
                        
                        if (message.serverContent?.inputTranscription) {
                            currentInput = message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutput = message.serverContent.outputTranscription.text;
                        }

                        setTranscription(prev => {
                            const newHistory = [...prev];
                            let last = newHistory[newHistory.length - 1];

                            if (currentInput) {
                                if (last?.speaker === 'user') {
                                    last.text += currentInput;
                                } else {
                                    newHistory.push({ speaker: 'user', text: currentInput });
                                }
                            }
                            
                            last = newHistory[newHistory.length - 1];
                            if (currentOutput) {
                                if (last?.speaker === 'model') {
                                    last.text += currentOutput;
                                } else {
                                    newHistory.push({ speaker: 'model', text: currentOutput });
                                }
                            }
                            return newHistory;
                        });

                        const newSources = (message.serverContent?.modelTurn as any)?.groundingMetadata?.groundingChunks?.map((c: any) => c.web && { uri: c.web.uri, title: c.web.title }).filter(Boolean) as Source[];
                        if (newSources?.length) {
                             setSources(prev => {
                                const existingUris = new Set(prev.map(s => s.uri));
                                const uniqueNewSources = newSources.filter(s => !existingUris.has(s.uri));
                                return [...prev, ...uniqueNewSources];
                             });
                        }
                        
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64EncodedAudioString) {
                            const outputCtx = outputAudioContextRef.current;
                            if (outputCtx) {
                                nextStartTimeRef.current = Math.max(
                                    nextStartTimeRef.current,
                                    outputCtx.currentTime,
                                );
                                const audioBuffer = await decodeAudioData(
                                    decode(base64EncodedAudioString),
                                    outputCtx,
                                    24000,
                                    1,
                                );
                                const sourceNode = outputCtx.createBufferSource();
                                sourceNode.buffer = audioBuffer;
                                sourceNode.connect(outputCtx.destination);
                                sourceNode.addEventListener('ended', () => {
                                    outputAudioSourcesRef.current.delete(sourceNode);
                                });
                                sourceNode.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                outputAudioSourcesRef.current.add(sourceNode);
                            }
                        }
                        
                        if (message.serverContent?.interrupted) {
                            outputAudioSourcesRef.current.forEach(s => s.stop());
                            outputAudioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API Error:', e);
                        handleApiError(new Error(e.message || 'An unknown error occurred with the live connection.'));
                        setConnectionState('error');
                        cleanup();
                    },
                    onclose: () => {
                        setConnectionState('disconnected');
                        cleanup();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ googleSearch: {} }],
                    systemInstruction: `You are AURA, an AI Music Tutor. Provide helpful and concise information about music theory, production, and history. When asked about current trends or specific facts, use Google Search to provide up-to-date information. Your responses will be spoken, so keep them conversational. Language: ${language}`,
                }
            });
        } catch (err) {
            handleApiError(err);
            setConnectionState('error');
            cleanup();
        }
    };

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
        }
        cleanup();
        setConnectionState('idle');
    }, [cleanup]);
    
    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const buttonState = {
        idle: { text: "Start Conversation", icon: <MicIcon />, action: startConversation, className: "bg-rose-600 hover:bg-rose-700" },
        connecting: { text: "Connecting...", icon: <SpinnerIcon />, action: () => {}, className: "bg-gray-500 cursor-not-allowed" },
        connected: { text: "Stop Conversation", icon: <StopIcon />, action: stopConversation, className: "bg-red-600 hover:bg-red-700 animate-pulse-glow" },
        disconnected: { text: "Start Again", icon: <MicIcon />, action: startConversation, className: "bg-rose-600 hover:bg-rose-700" },
        error: { text: "Error. Try Again", icon: <MicIcon />, action: startConversation, className: "bg-yellow-600 hover:bg-yellow-700" },
    }[connectionState];

    return (
        <section id="ai-tutor" className="py-16 sm:py-24 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('aiTutor.title')}</h1>
                    <p className="mt-4 text-lg text-gray-300">{t('aiTutor.subtitle')}</p>
                </div>

                <div className="mt-12 bg-gray-800/50 rounded-lg shadow-2xl backdrop-blur-sm border border-white/10 flex flex-col min-h-[60vh] max-h-[700px]">
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {transcription.length === 0 && connectionState !== 'connecting' && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Click "Start Conversation" to begin
                            </div>
                        )}
                        {transcription.map((part, index) => (
                             <div key={index} className={`flex items-start gap-3 ${part.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-lg p-3 rounded-2xl ${part.speaker === 'user' ? 'bg-rose-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    <p className="text-sm">{part.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {sources.length > 0 && (
                        <div className="p-4 border-t border-white/10">
                            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Sources</h3>
                            <div className="flex flex-wrap gap-2">
                                {sources.map((source, i) => (
                                    <a href={source.uri} key={i} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 hover:text-white">
                                        {source.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="p-6 border-t border-white/10">
                         <button onClick={buttonState.action} disabled={connectionState === 'connecting'} className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-bold text-white transition-all duration-300 transform hover:scale-105 ${buttonState.className}`}>
                            {buttonState.icon}
                            <span>{buttonState.text}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm5 10.5a.5.5 0 01.5.5v.5a3.5 3.5 0 01-7 0v-.5a.5.5 0 01.5-.5h6zM5 8a1 1 0 011-1h1V6a1 1 0 112 0v1h1a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default LiveTutorPage;
