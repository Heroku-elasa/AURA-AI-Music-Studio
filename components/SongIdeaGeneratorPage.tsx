import React, { useState } from 'react';
import { useLanguage, SongIdeaResult } from '../types';
import * as geminiService from '../services/geminiService';

interface SongIdeaGeneratorPageProps {
    handleApiError: (err: unknown) => string;
}

const SongIdeaGeneratorPage: React.FC<SongIdeaGeneratorPageProps> = ({ handleApiError }) => {
    const { language, t } = useLanguage();
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<SongIdeaResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const ideaResult = await geminiService.generateSongIdea(description, language);
            setResult(ideaResult);
        } catch (err) {
            const msg = handleApiError(err);
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setDescription(suggestion);
    };

    const ResultDisplay = ({ result }: { result: SongIdeaResult }) => (
        <div className="animate-fade-in bg-gray-800/30 p-6 sm:p-8 rounded-lg mt-8 border border-white/10 space-y-8">
            <h2 className="text-3xl font-bold text-white text-center">{t('songIdeaGenerator.analysisTitle')}</h2>
            
            <section>
                <h3 className="text-xl font-semibold text-rose-300 mb-4">{t('songIdeaGenerator.keyCharacteristics')}</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-xs text-gray-400">Key</div>
                        <div className="font-bold text-lg text-white">{result.keyCharacteristics.key}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Tempo</div>
                        <div className="font-bold text-lg text-white">{result.keyCharacteristics.tempo}</div>
                    </div>
                    <div className="sm:col-span-1">
                        <div className="text-xs text-gray-400">Mood</div>
                        <div className="font-bold text-lg text-white">{result.keyCharacteristics.mood.join(', ')}</div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-rose-300 mb-4">{t('songIdeaGenerator.recommendedIngredients')}</h3>
                <div className="flex flex-wrap gap-3">
                    {result.recommendedInstruments.map((item, i) => <span key={i} className="px-3 py-1.5 bg-green-900/50 text-green-300 text-sm font-medium rounded-full">{item}</span>)}
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-semibold text-rose-300 mb-4">{t('songIdeaGenerator.ingredientsToAvoid')}</h3>
                <div className="flex flex-wrap gap-3">
                    {result.instrumentsToAvoid.map((item, i) => <span key={i} className="px-3 py-1.5 bg-red-900/50 text-red-300 text-sm font-medium rounded-full">{item}</span>)}
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-rose-300 mb-4">{t('songIdeaGenerator.actionableSuggestions')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 bg-gray-900/50 p-4 rounded-lg">
                    {result.productionSuggestions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </section>
        </div>
    );

    return (
        <section className="py-16 sm:py-24 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('songIdeaGenerator.title')}</h1>
                    <p className="mt-4 text-lg text-gray-300">{t('songIdeaGenerator.subtitle')}</p>
                </div>

                <div className="mt-12 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10 space-y-6">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">{t('songIdeaGenerator.descriptionLabel')}</label>
                            <textarea
                                id="description"
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white"
                                placeholder={t('songIdeaGenerator.descriptionPlaceholder')}
                            />
                        </div>

                        <div className="pt-2">
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">{t('songIdeaGenerator.suggestionsTitle')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {t('songIdeaGenerator.suggestions').map((suggestion: string, index: number) => (
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
                                {isLoading ? t('songIdeaGenerator.analyzing') : t('songIdeaGenerator.buttonText')}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400"></div>
                            <p className="mt-4 text-gray-400">{t('songIdeaGenerator.analyzing')}</p>
                        </div>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                    {!isLoading && !result && !error && (
                        <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg">
                            <p>{t('songIdeaGenerator.placeholder')}</p>
                        </div>
                    )}
                    {result && <ResultDisplay result={result} />}
                </div>
            </div>
        </section>
    );
};

export default SongIdeaGeneratorPage;