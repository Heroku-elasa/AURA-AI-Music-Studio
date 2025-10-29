

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { marked } from 'marked';
import MusicIdeaForm from './GeneratorForm';
import MusicAnalysisDisplay from './ReportDisplay';
// Note: Renamed component for clarity, file remains the same.
import ProducerFinder from './LawyerFinder';
import ResearchRequestModal from './GrantFinder';
import { 
    useLanguage, 
    MusicIdeaDetails, 
    ComprehensiveMusicResult, 
    GeneratedSongElement, 
    ProducerProfile, 
    SavedProject,
    CostAnalysisResult,
} from '../types';
import { generateComprehensiveMusicAnalysis, calculateProductionCosts } from '../services/geminiService';
// FIX: Use GoogleGenAI instead of deprecated GoogleGenerativeAI
import { GoogleGenAI } from '@google/genai';


interface MusicGenerationPageProps {
    handleApiError: (err: unknown) => string;
    isQuotaExhausted: boolean;
    onSaveProject: (project: SavedProject) => void;
    projectToRestore: SavedProject | null;
    setProjectToRestore: (project: SavedProject | null) => void;
}

const MusicGenerationPage: React.FC<MusicGenerationPageProps> = ({ 
    handleApiError, 
    isQuotaExhausted, 
    onSaveProject,
    projectToRestore,
    setProjectToRestore
}) => {
    const { language, t } = useLanguage();
    // FIX: Use GoogleGenAI instead of deprecated GoogleGenerativeAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    // FIX: Use recommended 'gemini-2.5-flash' model
    const model = 'gemini-2.5-flash';

    // Form State
    const [idea, setIdea] = useState('');
    const [ideaDetails, setIdeaDetails] = useState<MusicIdeaDetails>({
        referenceArtists: '',
        specificInstruments: '',
        targetLength: '',
        daw: '',
        existingIdeas: ''
    });

    // Analysis State
    const [analysisResult, setAnalysisResult] = useState<ComprehensiveMusicResult | null>(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Summary State
    const [productionBrief, setProductionBrief] = useState('');
    const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
    const [briefError, setBriefError] = useState<string | null>(null);
    
    // Cost Analysis State
    const [costAnalysis, setCostAnalysis] = useState<CostAnalysisResult | null>(null);
    const [isCalculatingCosts, setIsCalculatingCosts] = useState(false);
    const [costsError, setCostsError] = useState<string | null>(null);

    // Producer Finder State
    const [allProducers, setAllProducers] = useState<ProducerProfile[]>([]);
    const [savedProducers, setSavedProducers] = useState<ProducerProfile[]>([]);
    const [triggerProducerSearch, setTriggerProducerSearch] = useState(false);

    // Research Modal State
    const [researchTopic, setResearchTopic] = useState('');
    const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
    
    useEffect(() => {
        if (projectToRestore) {
            setIdea(projectToRestore.idea);
            setIdeaDetails(projectToRestore.ideaDetails);
            setAnalysisResult(projectToRestore.comprehensiveResult);
            setProjectToRestore(null);
        }
    }, [projectToRestore, setProjectToRestore]);


    const handleAnalyze = async () => {
        setIsLoadingAnalysis(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        setCostAnalysis(null);
        setCostsError(null);

        try {
            const result = await generateComprehensiveMusicAnalysis(idea, ideaDetails, language);
            setAnalysisResult(result);
        } catch (err) {
            setAnalysisError(handleApiError(err));
        } finally {
            setIsLoadingAnalysis(false);
        }
    };
    
    const handleGetDeeperAnalysis = useCallback(async (elementName: string) => {
        if (!analysisResult) return;
        
        const updateElementState = (updater: (c: GeneratedSongElement) => GeneratedSongElement) => {
            setAnalysisResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    productionConsultation: {
                        ...prev.productionConsultation,
                        suggestedSongElements: prev.productionConsultation.suggestedSongElements.map(c => 
                            c.name === elementName ? updater(c) : c
                        ),
                    }
                };
            });
        };

        updateElementState(c => ({ ...c, isLoadingDetails: true, detailsError: null }));

        const prompt = `Provide a more detailed, easy-to-understand explanation for the musical concept "${elementName}" for a musician. Include its purpose, common usage, and examples. Format the response as a simple markdown string. The language must be ${language}.`;
        
        try {
            // FIX: Use modern `ai.models.generateContent` API
            const response = await ai.models.generateContent({ model, contents: prompt });
            const htmlDetails = await marked.parse(response.text);
            updateElementState(c => ({ ...c, details: htmlDetails, isLoadingDetails: false }));
        } catch (err) {
            const errorMsg = handleApiError(err);
            updateElementState(c => ({ ...c, detailsError: errorMsg, isLoadingDetails: false }));
        }
    }, [analysisResult, handleApiError, language, model, ai.models]);

    const handleGetAcademicAnalysis = useCallback(async (elementName: string) => {
        if (!analysisResult) return;

         const updateElementState = (updater: (c: GeneratedSongElement) => GeneratedSongElement) => {
             setAnalysisResult(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    productionConsultation: {
                        ...prev.productionConsultation,
                        suggestedSongElements: prev.productionConsultation.suggestedSongElements.map(c => 
                            c.name === elementName ? updater(c) : c
                        ),
                    }
                };
            });
        };

        updateElementState(c => ({ ...c, isLoadingFurtherReading: true, furtherReadingError: null }));

        const prompt = `Provide a concise, academic-style summary for the music theory concept "${elementName}", mentioning its historical context and theoretical underpinnings. Use Google Search to find sources. Format as markdown, including a list of source links at the end. The language must be ${language}.`;
        
        try {
            // FIX: Use modern `ai.models.generateContent` API
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
            
            let academicText = response.text;
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (sources && sources.length > 0) {
                academicText += "\n\n**Sources:**\n";
                sources.forEach(source => {
                    if (source.web) {
                       academicText += `\n- [${source.web.title}](${source.web.uri})`;
                    }
                });
            }
            const htmlFurtherReading = await marked.parse(academicText);
            updateElementState(c => ({ ...c, furtherReading: htmlFurtherReading, isLoadingFurtherReading: false }));
        } catch (err) {
            const errorMsg = handleApiError(err);
            updateElementState(c => ({ ...c, furtherReadingError: errorMsg, isLoadingFurtherReading: false }));
        }
    }, [analysisResult, handleApiError, language, model, ai.models]);
    
    const handleGenerateBrief = async () => {
        if (!analysisResult) return;
        setIsGeneratingBrief(true);
        setBriefError(null);
        
        const prompt = `
        Based on this AI music analysis, create a concise production brief for a producer.
        Format it as clean HTML with simple tags like <h3>, <p>, and <ul>. Do not include <html> or <body> tags. The language must be ${language}.
        Analysis Data: ${JSON.stringify(analysisResult)}
        User Idea: ${idea}
        `;
        
        try {
            // FIX: Use modern `ai.models.generateContent` API
            const response = await ai.models.generateContent({ model, contents: prompt });
            setProductionBrief(response.text);
        } catch(err) {
            setBriefError(handleApiError(err));
        } finally {
            setIsGeneratingBrief(false);
        }
    };

    const handleCalculateCosts = async () => {
        if (!analysisResult?.productionConsultation?.productionTips) return;
        setIsCalculatingCosts(true);
        setCostsError(null);
        try {
            const result = await calculateProductionCosts(analysisResult, idea, language);
            setCostAnalysis(result);
        } catch (err) {
            setCostsError(handleApiError(err));
        } finally {
            setIsCalculatingCosts(false);
        }
    };

    const handleFindProducers = () => {
        setTriggerProducerSearch(true);
        document.getElementById('producer-finder')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRequestFeature = (topic: string) => {
        setResearchTopic(topic);
        setIsResearchModalOpen(true);
    };

    const handleSaveCurrentProject = () => {
        const name = prompt("Enter a name for this project:", `Project ${new Date().toLocaleDateString()}`);
        if (name && analysisResult) {
            const newProject: SavedProject = {
                id: crypto.randomUUID(),
                name,
                timestamp: Date.now(),
                idea,
                ideaDetails,
                comprehensiveResult: analysisResult,
            };
            onSaveProject(newProject);
        }
    };
    
    const memoizedProducerFinder = useMemo(() => (
      <ProducerFinder
        savedSpecialists={savedProducers}
        onSaveProvider={p => setSavedProducers(prev => [...prev, p])}
        onRemoveProvider={p => setSavedProducers(prev => prev.filter(sp => sp.id !== p.id))}
        onClearAllSaved={() => setSavedProducers([])}
        onNoteChange={(index, note) => {
            const updated = [...savedProducers];
            if(updated[index]) {
                updated[index].notes = note;
                setSavedProducers(updated);
            }
        }}
        handleApiError={handleApiError}
        isQuotaExhausted={isQuotaExhausted}
        allSpecialists={allProducers}
        onSpecialistsFound={setAllProducers}
        onClearAllDbProviders={() => setAllProducers([])}
        triggerSearch={triggerProducerSearch}
        onSearchTriggered={() => setTriggerProducerSearch(false)}
        onRequestResearch={handleRequestFeature}
        consultationResult={analysisResult ? analysisResult.productionConsultation : null}
        symptoms={idea}
      />
    ), [savedProducers, handleApiError, isQuotaExhausted, allProducers, triggerProducerSearch, analysisResult, idea]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('musicGeneration.title')}</h1>
                <p className="mt-4 text-lg text-gray-300">{t('musicGeneration.subtitle')}</p>
            </div>
            
            <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
                 <div className="lg:col-span-2 grid grid-cols-1 gap-8">
                    <MusicIdeaForm 
                        isLoading={isLoadingAnalysis}
                        isQuotaExhausted={isQuotaExhausted}
                        onAnalyze={handleAnalyze}
                        symptoms={idea}
                        setSymptoms={setIdea}
                        symptomDetails={ideaDetails}
                        setSymptomDetails={setIdeaDetails}
                    />
                    
                    <div className="bg-gray-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-white/10">
                        <MusicAnalysisDisplay 
                            isLoading={isLoadingAnalysis}
                            error={analysisError}
                            analysis={analysisResult}
                            onGetDeeperAnalysis={handleGetDeeperAnalysis}
                            onGetAcademicAnalysis={handleGetAcademicAnalysis}
                            onGenerateSummary={handleGenerateBrief}
                            doctorSummary={productionBrief}
                            isGeneratingSummary={isGeneratingBrief}
                            doctorSummaryError={briefError}
                            onFindSpecialists={handleFindProducers}
                            onRequestResearch={handleRequestFeature}
                            onCalculateCosts={handleCalculateCosts}
                            isCalculatingCosts={isCalculatingCosts}
                            costAnalysis={costAnalysis}
                            costsError={costsError}
                        />
                    </div>
                     {analysisResult && (
                        <div className="text-center">
                            <button
                                onClick={handleSaveCurrentProject}
                                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-all text-lg shadow-lg"
                            >
                                {t('musicGeneration.saveButton')}
                            </button>
                        </div>
                     )}
                 </div>
            </div>

            {memoizedProducerFinder}

            <ResearchRequestModal 
                isOpen={isResearchModalOpen}
                onClose={() => setIsResearchModalOpen(false)}
                topic={researchTopic}
            />
        </div>
    );
};

export default MusicGenerationPage;