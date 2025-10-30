import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage, MarketTrendsResult, InDepthAnalysis, SWOTAnalysis, QuickSummary, MarketAnalysisMode, Source } from '../types';
import * as geminiService from '../services/geminiService';

// Audio helper functions
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


interface MusicTrendsPageProps {
    handleApiError: (err: unknown) => string;
}

const parseMarketAnalysis = (text: string, sources: Source[], mode: MarketAnalysisMode): MarketTrendsResult => {
    const getSectionContent = (header: string): string => {
        const regex = new RegExp(`(?:##|###) ${header}\\n([\\s\\S]*?)(?=\\n##|\\n###|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

    const getBulletedList = (header: string): string[] => {
        const content = getSectionContent(header);
        return content.split('\n').map(s => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
    };

    const getSuggestedQueries = (): string[] => {
        const regex = /(?:##|###) (?:Suggested Queries|Related Topics)\s*([\s\\S]*)/i;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1].split('\n').map(q => q.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
        }
        return [];
    };

    const suggestedQueries = getSuggestedQueries();

    switch (mode) {
        case 'in-depth':
            const trendsContent = getSectionContent('Emerging Trends');
            const emergingTrends = trendsContent.split('\n').map(line => {
                const match = line.match(/\*\*(.*?):\*\*\s*(.*)/);
                if (match) {
                    return { name: match[1].trim(), description: match[2].trim() };
                }
                return null;
            }).filter((t): t is { name: string; description: string } => t !== null);

            return {
                type: 'in-depth',
                keyInsights: getBulletedList('Key Insights'),
                detailedSummary: getSectionContent('Detailed Summary'),
                emergingTrends,
                opportunities: getBulletedList('Opportunities'),
                risks: getBulletedList('Risks'),
                sources,
                suggestedQueries,
            };
        case 'swot':
            return {
                type: 'swot',
                strengths: getBulletedList('Strengths'),
                weaknesses: getBulletedList('Weaknesses'),
                opportunities: getBulletedList('Opportunities'),
                threats: getBulletedList('Threats'),
                sources,
                suggestedQueries,
            };
        case 'quick':
        default:
             const summaryMatch = text.match(/([\s\\S]*?)(?=\n(?:##|###) (?:Suggested Queries|Related Topics)|$)/);
            return {
                type: 'quick',
                summary: summaryMatch ? summaryMatch[0].trim().replace(/^##\s*Summary\s*\n/i, '') : text.trim(),
                sources,
                suggestedQueries,
            };
    }
};

const MusicTrendsPage: React.FC<MusicTrendsPageProps> = ({ handleApiError }) => {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<MarketTrendsResult | null>(null);
    const [mode, setMode] = useState<MarketAnalysisMode>('quick');
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    // TTS State
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);


    const loadingMessages = useMemo(() => [
        t('musicTrends.loading.scanning'),
        t('musicTrends.loading.synthesizing'),
        t('musicTrends.loading.extracting'),
        t('musicTrends.loading.compiling'),
    ], [t]);

    useEffect(() => {
        if (isLoading) {
            setLoadingMessageIndex(0);
            const interval = setInterval(() => {
                setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [isLoading, loadingMessages]);


    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
        setIsPlayingAudio(false);

        try {
            const { text, sources } = await geminiService.generateMarketAnalysis(searchQuery, language, mode);
            const parsedResult = parseMarketAnalysis(text, sources, mode);
            setResult(parsedResult);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const getResultText = (analysisResult: MarketTrendsResult | null): string => {
        if (!analysisResult) return '';
        switch(analysisResult.type) {
            case 'quick': return analysisResult.summary;
            case 'in-depth': return [
                `**${t('musicTrends.results.keyInsights')}**\n${analysisResult.keyInsights.join('\n- ')}`,
                `**${t('musicTrends.results.detailedSummary')}**\n${analysisResult.detailedSummary}`,
                `**${t('musicTrends.results.emergingTrends')}**\n${analysisResult.emergingTrends.map(t => `${t.name}: ${t.description}`).join('\n')}`,
                `**${t('musicTrends.results.opportunities')}**\n${analysisResult.opportunities.join('\n- ')}`,
                `**${t('musicTrends.results.risks')}**\n${analysisResult.risks.join('\n- ')}`,
            ].join('\n\n');
            case 'swot': return [
                `**${t('musicTrends.results.strengths')}**\n${analysisResult.strengths.join('\n- ')}`,
                `**${t('musicTrends.results.weaknesses')}**\n${analysisResult.weaknesses.join('\n- ')}`,
                `**${t('musicTrends.results.opportunities')}**\n${analysisResult.opportunities.join('\n- ')}`,
                `**${t('musicTrends.results.threats')}**\n${analysisResult.threats.join('\n- ')}`,
            ].join('\n\n');
            default: return '';
        }
    }

    const handlePlayAudio = async () => {
        if (isPlayingAudio) {
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            setIsPlayingAudio(false);
            return;
        }

        const textToSpeak = getResultText(result);
        if (!textToSpeak) return;

        setIsGeneratingAudio(true);
        try {
            const audioB64 = await geminiService.generateSpeech(textToSpeak);
            
            // Nested try-catch for audio processing specific errors
            try {
                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                
                const audioCtx = audioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(audioB64), audioCtx, 24000, 1);
                
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    setIsPlayingAudio(false);
                    audioSourceRef.current = null;
                };
                source.start();
                audioSourceRef.current = source;
                setIsPlayingAudio(true);
            } catch (audioError) {
                console.error("Audio processing error:", audioError);
                handleApiError(new Error("Could not play the audio. The data from the API might be invalid or corrupted."));
                setIsPlayingAudio(false); // Ensure state is reset
            }

        } catch (err) { // Catches errors from geminiService.generateSpeech
            handleApiError(err);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleSuggestedQuery = (suggestedQuery: string) => {
        setQuery(suggestedQuery);
        handleSearch(suggestedQuery);
    };
    
    const InDepthResult: React.FC<{ analysis: InDepthAnalysis }> = ({ analysis }) => {
        const [openSection, setOpenSection] = useState<string>('keyInsights');

        const sections = [
            { id: 'keyInsights', title: t('musicTrends.results.keyInsights'), content: <ul className="list-disc list-inside space-y-2 text-gray-300">{analysis.keyInsights.map((item, i) => <li key={i}>{item}</li>)}</ul>, hasContent: analysis.keyInsights.length > 0 },
            { id: 'detailedSummary', title: t('musicTrends.results.detailedSummary'), content: <p className="text-gray-300 whitespace-pre-wrap">{analysis.detailedSummary}</p>, hasContent: !!analysis.detailedSummary },
            { id: 'emergingTrends', title: t('musicTrends.results.emergingTrends'), content: <div className="space-y-3">{analysis.emergingTrends.map(t => <p key={t.name}><strong>{t.name}:</strong> {t.description}</p>)}</div>, hasContent: analysis.emergingTrends.length > 0 },
            { id: 'opportunities', title: t('musicTrends.results.opportunities'), content: <ul className="list-disc list-inside space-y-2 text-gray-300">{analysis.opportunities.map((item, i) => <li key={i}>{item}</li>)}</ul>, hasContent: analysis.opportunities.length > 0 },
            { id: 'risks', title: t('musicTrends.results.risks'), content: <ul className="list-disc list-inside space-y-2 text-gray-300">{analysis.risks.map((item, i) => <li key={i}>{item}</li>)}</ul>, hasContent: analysis.risks.length > 0 },
        ].filter(s => s.hasContent);
    
        return (
            <div className="space-y-3">
            {sections.map(section => (
                <div key={section.id} className="border border-white/10 rounded-lg overflow-hidden transition-all duration-300 bg-gray-900/30">
                    <button 
                      onClick={() => setOpenSection(openSection === section.id ? '' : section.id)}
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-900/50 transition-colors"
                      aria-expanded={openSection === section.id}
                    >
                      <h3 className="font-semibold text-rose-300">{section.title}</h3>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 transform ${openSection === section.id ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`transition-all duration-500 ease-in-out grid ${openSection === section.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-4 border-t border-white/10 text-sm">
                          {section.content}
                        </div>
                      </div>
                    </div>
                </div>
            ))}
            </div>
        );
    };

    const SWOTResult: React.FC<{ analysis: SWOTAnalysis }> = ({ analysis }) => {
        const swotItems = [
            { title: t('musicTrends.results.strengths'), items: analysis.strengths, color: 'green' },
            { title: t('musicTrends.results.weaknesses'), items: analysis.weaknesses, color: 'yellow' },
            { title: t('musicTrends.results.opportunities'), items: analysis.opportunities, color: 'blue' },
            { title: t('musicTrends.results.threats'), items: analysis.threats, color: 'red' },
        ];

        const colorClasses: { [key: string]: string } = {
            green: 'border-green-500/50 text-green-300',
            yellow: 'border-yellow-500/50 text-yellow-300',
            blue: 'border-blue-500/50 text-blue-300',
            red: 'border-red-500/50 text-red-300',
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {swotItems.map(section => (
                    section.items.length > 0 &&
                    <div key={section.title} className={`bg-gray-900/50 p-6 rounded-lg border-t-4 ${colorClasses[section.color]}`}>
                        <h3 className={`text-xl font-semibold mb-3 ${colorClasses[section.color]}`}>{section.title}</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                            {section.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };
    
     const Sources: React.FC<{ sources: Source[] }> = ({ sources }) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2-2H6a2 2 0 01-2-2V5zm3 1a1 1 0 000 2h6a1 1 0 100-2H7zM7 9a1 1 0 100 2h6a1 1 0 100-2H7zm4 3a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" /></svg>
                {t('musicTrends.sources')}
            </h3>
            <div className="space-y-2 text-sm">
            {sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg border border-transparent hover:border-white/10 transition-all group">
                    <p className="font-semibold text-rose-300 group-hover:underline truncate" title={source.title || 'Untitled Source'}>{source.title || 'Untitled Source'}</p>
                    <p className="text-gray-400 text-xs truncate mt-1">{source.uri}</p>
                </a>
            ))}
            </div>
        </div>
    );
    
    const SuggestedQueries: React.FC<{ queries: string[] }> = ({ queries }) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 011.414-1.414L10 14.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {t('musicTrends.relatedTopics')}
            </h3>
            <div className="flex flex-wrap gap-3">
            {queries.map((q, index) => (
                <button key={index} onClick={() => handleSuggestedQuery(q)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 text-gray-200 text-sm font-medium rounded-full hover:bg-gray-600 hover:text-white transition-all transform hover:scale-105">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    <span>{q}</span>
                </button>
            ))}
            </div>
        </div>
    );

    const DecorativeGraph = () => (
        <svg className="absolute top-0 right-0 h-48 w-48 text-rose-500/5 -z-10 transform translate-x-1/3 -translate-y-1/3" stroke="currentColor" fill="none" viewBox="0 0 100 100">
            <circle cx="20" cy="20" r="2" strokeWidth="1" />
            <circle cx="80" cy="20" r="2" strokeWidth="1" />
            <circle cx="50" cy="50" r="3" strokeWidth="1" fill="currentColor" />
            <circle cx="20" cy="80" r="2" strokeWidth="1" />
            <circle cx="80" cy="80" r="2" strokeWidth="1" />
            <path d="M20 20 L50 50 L80 20" strokeDasharray="2 2" strokeWidth="0.5" />
            <path d="M20 80 L50 50 L80 80" strokeDasharray="2 2" strokeWidth="0.5" />
            <path d="M20 20 L20 80" strokeDasharray="2 2" strokeWidth="0.5" />
            <path d="M80 20 L80 80" strokeDasharray="2 2" strokeWidth="0.5" />
        </svg>
    );

    return (
        <section id="music-trends" className="py-16 sm:py-24 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('musicTrends.title')}</h1>
                    <p className="mt-4 text-lg text-gray-300">{t('musicTrends.subtitle')}</p>
                </div>

                <div className="mt-12 max-w-2xl mx-auto space-y-4">
                    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-800/50 rounded-lg border border-white/10">
                        {(['quick', 'in-depth', 'swot'] as MarketAnalysisMode[]).map(m => (
                            <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === m ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                {t(`musicTrends.analysisModes.${m}`)}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex items-center bg-gray-800/50 border border-white/10 rounded-lg shadow-md p-2">
                        <input
                            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('musicTrends.searchPlaceholder')}
                            className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-2 focus:outline-none"
                        />
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors disabled:bg-gray-500">
                            {isLoading ? t('musicTrends.searching') : t('musicTrends.searchButton')}
                        </button>
                    </form>
                    <div className="pt-2">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2 text-center">{t('musicTrends.suggestionsTitle')}</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {t('musicTrends.suggestions').map((suggestion: string, index: number) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSuggestedQuery(suggestion)}
                                    className="px-3 py-1.5 bg-gray-700/80 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="mt-12">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400"></div>
                            <p className="mt-4 text-gray-400 transition-opacity duration-500" key={loadingMessageIndex}>
                                {loadingMessages[loadingMessageIndex]}
                            </p>
                        </div>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                    {!isLoading && !result && !error && (
                        <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg">
                            <p>{t('musicTrends.placeholder')}</p>
                        </div>
                    )}
                    {result && (
                        <div className="animate-fade-in bg-gray-800/30 p-6 sm:p-8 rounded-lg mt-8 border border-white/10 space-y-10 relative overflow-hidden">
                             <div className="absolute top-4 right-4 z-10">
                                <button onClick={handlePlayAudio} disabled={isGeneratingAudio} className="p-2 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors disabled:opacity-50" aria-label="Read analysis aloud">
                                    {isGeneratingAudio ? (
                                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : isPlayingAudio ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                    )}
                                </button>
                            </div>
                            <DecorativeGraph />
                            {result.type === 'quick' && 
                                <div className="prose prose-invert prose-sm max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: (result as QuickSummary).summary.replace(/\n/g, '<br />') }} />
                            }
                            {result.type === 'in-depth' && <InDepthResult analysis={result as InDepthAnalysis} />}
                            {result.type === 'swot' && <SWOTResult analysis={result as SWOTAnalysis} />}
                            
                            {(result.sources && result.sources.length > 0) && <Sources sources={result.sources} />}
                            {(result.suggestedQueries && result.suggestedQueries.length > 0) && <SuggestedQueries queries={result.suggestedQueries} />}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MusicTrendsPage;