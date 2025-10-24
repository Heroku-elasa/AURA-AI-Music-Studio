import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../types';
import * as geminiService from '../services/geminiService';

declare const ABCJS: any; // Declare the global abcjs object

interface MusicSheetGeneratorPageProps {
    handleApiError: (err: unknown) => string;
}

const MusicSheetGeneratorPage: React.FC<MusicSheetGeneratorPageProps> = ({ handleApiError }) => {
    const { language, t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [abcNotation, setAbcNotation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const sheetMusicRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (abcNotation && sheetMusicRef.current) {
            // Clear previous render to avoid duplicates
            sheetMusicRef.current.innerHTML = ''; 
            try {
                ABCJS.renderAbc(sheetMusicRef.current, abcNotation, {
                    responsive: "resize",
                    padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    staffwidth: sheetMusicRef.current.clientWidth > 0 ? sheetMusicRef.current.clientWidth : 740,
                });
            } catch (e) {
                console.error("Error rendering ABC notation:", e);
                setError(t('musicSheetGenerator.error'));
            }
        }
    }, [abcNotation, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setAbcNotation(null);

        try {
            const result = await geminiService.generateAbcNotation(prompt, language);
            setAbcNotation(result);
        } catch (err) {
            const msg = handleApiError(err);
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
    };

    const handleCopy = () => {
        if (abcNotation) {
            navigator.clipboard.writeText(abcNotation).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        }
    };

    return (
        <section className="py-16 sm:py-24 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('musicSheetGenerator.title')}</h1>
                    <p className="mt-4 text-lg text-gray-300">{t('musicSheetGenerator.subtitle')}</p>
                </div>

                <div className="mt-12 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10 space-y-6">
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">{t('musicSheetGenerator.promptLabel')}</label>
                            <textarea
                                id="prompt"
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white"
                                placeholder={t('musicSheetGenerator.promptPlaceholder')}
                            />
                        </div>

                        <div className="pt-2">
                            <div className="flex flex-wrap gap-2">
                                {t('musicSheetGenerator.suggestions').map((suggestion: string, index: number) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1.5 bg-gray-700/80 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? t('musicSheetGenerator.generating') : t('musicSheetGenerator.buttonText')}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400"></div>
                            <p className="mt-4 text-gray-400">{t('musicSheetGenerator.generating')}</p>
                        </div>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                    {!isLoading && !abcNotation && !error && (
                        <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg">
                            <p>{t('musicSheetGenerator.placeholder')}</p>
                        </div>
                    )}
                    {abcNotation && (
                        <div className="animate-fade-in bg-gray-800/30 p-6 sm:p-8 rounded-lg mt-8 border border-white/10 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">{t('musicSheetGenerator.resultsTitle')}</h2>
                                <div ref={sheetMusicRef} className="bg-white p-4 rounded-md overflow-x-auto"></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-300">{t('musicSheetGenerator.abcNotationTitle')}</h3>
                                    <button onClick={handleCopy} className="text-sm font-semibold px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                                        {copySuccess ? t('musicSheetGenerator.copySuccess') : t('musicSheetGenerator.copyButton')}
                                    </button>
                                </div>
                                <pre className="bg-gray-900/50 p-4 rounded-md text-gray-300 text-sm overflow-x-auto">
                                    <code>{abcNotation}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MusicSheetGeneratorPage;
