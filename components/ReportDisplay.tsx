

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ComprehensiveMusicResult, useLanguage, CostAnalysisResult, CostAnalysisItem } from '../types';
import TreatmentSummary from './DoctorSummarySheet';

interface AnalysisDisplayProps {
  analysis: ComprehensiveMusicResult | null;
  isLoading: boolean;
  error: string | null;
  onGetDeeperAnalysis: (conditionName: string) => void;
  onGetAcademicAnalysis: (conditionName: string) => void;
  onGenerateSummary: () => void;
  doctorSummary: string;
  isGeneratingSummary: boolean;
  doctorSummaryError: string | null;
  onFindSpecialists: (specialists: string[]) => void;
  onRequestResearch: (conditionName: string) => void;
  onCalculateCosts: () => void;
  isCalculatingCosts: boolean;
  costAnalysis: CostAnalysisResult | null;
  costsError: string | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  analysis, 
  isLoading, 
  error, 
  onGetDeeperAnalysis,
  onGetAcademicAnalysis,
  onGenerateSummary,
  doctorSummary,
  isGeneratingSummary,
  doctorSummaryError,
  onFindSpecialists,
  onRequestResearch,
  onCalculateCosts,
  isCalculatingCosts,
  costAnalysis,
  costsError,
}) => {
  const { language, t } = useLanguage();
  const [copySuccess, setCopySuccess] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const [expandedElement, setExpandedElement] = useState<string | null>(null);
  const [academicAnalysisElement, setAcademicAnalysisElement] = useState<string | null>(null);
  const [summaryStyle, setSummaryStyle] = useState<'dark' | 'light'>('dark');

  const productionConsultation = analysis?.productionConsultation;
  const songStructure = productionConsultation?.songStructure;

  const handleElementToggle = (elementName: string) => {
    const isCurrentlyExpanded = expandedElement === elementName;
    const targetElement = productionConsultation?.suggestedSongElements.find(c => c.name === elementName);

    setExpandedElement(isCurrentlyExpanded ? null : elementName);
    setAcademicAnalysisElement(null); // Close academic view when toggling details

    if (!isCurrentlyExpanded && targetElement && !targetElement.details && !targetElement.isLoadingDetails) {
        onGetDeeperAnalysis(elementName);
    }
  };

  const handleAcademicAnalysisToggle = (elementName: string) => {
      const isCurrentlyExpanded = academicAnalysisElement === elementName;
      const targetElement = productionConsultation?.suggestedSongElements.find(c => c.name === elementName);

      setAcademicAnalysisElement(isCurrentlyExpanded ? null : elementName);
      setExpandedElement(null); // Close details view when toggling academic

      if (!isCurrentlyExpanded && targetElement && !targetElement.furtherReading && !targetElement.isLoadingFurtherReading) {
          onGetAcademicAnalysis(elementName);
      }
  };

  const copySummaryToClipboard = useCallback(() => {
    if (summaryRef.current) {
        const textToCopy = summaryRef.current.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess(t('analysisDisplay.copySuccess'));
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }
  }, [t]);
    
  const renderCostTable = (items: CostAnalysisItem[]) => {
    if (items.length === 0) return null;
    const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
    
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-700/50 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-3 font-semibold text-gray-300">{t('analysisDisplay.tableHeaderItem')}</th>
                        <th className="p-3 font-semibold text-gray-300 text-right">{t('analysisDisplay.tableHeaderCost')}</th>
                        <th className="p-3 font-semibold text-gray-300 text-center">{t('analysisDisplay.tableHeaderUnit')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {items.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-800/60 transition-colors">
                            <td className="p-3 font-medium text-white">{item.name}</td>
                            <td className="p-3 text-right font-mono text-yellow-300">{item.estimatedCost.toLocaleString()}</td>
                            <td className="p-3 text-center text-gray-400">{item.unit}</td>
                        </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-gray-700/50 font-bold">
                    <tr>
                        <td className="p-3 text-white">{t('analysisDisplay.tableHeaderTotal')}</td>
                        <td className="p-3 text-right font-mono text-yellow-200">{totalCost.toLocaleString()} {t('analysisDisplay.currency')}</td>
                        <td />
                    </tr>
                </tfoot>
            </table>
        </div>
    );
  };

  const allLowRelevance = productionConsultation && productionConsultation.suggestedSongElements.length > 0 && productionConsultation.suggestedSongElements.every(c => c.relevance === 'Low');

  return (
    <div className="p-6 sm:p-8 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">{t('analysisDisplay.analysisTitle')}</h3>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400"></div>
          <span className={`${language === 'fa' ? 'mr-4' : 'ml-4'} text-gray-400`}>{t('analysisDisplay.generating')}</span>
        </div>
      )}

      {error && !error.includes('(Quota Exceeded)') && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

      {!isLoading && !analysis && !error && (
        <div className="text-center py-10 text-gray-500">
          <p>{t('analysisDisplay.placeholder1')}</p>
          <p className="text-sm">{t('analysisDisplay.placeholder2')}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-12 animate-fade-in">
        
          <section>
            <h3 className="text-2xl font-bold text-rose-300 mb-4 border-b-2 border-rose-800 pb-2 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg>
                {t('analysisDisplay.skinProfileTitle')}
            </h3>
            <div className="bg-gray-900/50 p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div><div className="text-xs text-gray-400">Key</div><div className="font-bold text-lg text-white">{analysis.songConcept.key}</div></div>
                    <div><div className="text-xs text-gray-400">Tempo</div><div className="font-bold text-lg text-white">{analysis.songConcept.tempo}</div></div>
                    <div className="col-span-2 md:col-span-1"><div className="text-xs text-gray-400">Mood</div><div className="font-bold text-lg text-white">{analysis.songConcept.mood.join(', ')}</div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2">{t('analysisDisplay.recommendedIngredients')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.songConcept.suggestedInstruments.map((item, i) => <span key={i} className="px-3 py-1 bg-green-900/50 text-green-300 text-xs font-medium rounded-full">{item}</span>)}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2">{t('analysisDisplay.ingredientsToAvoid')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.songConcept.instrumentsToAvoid.map((item, i) => <span key={i} className="px-3 py-1 bg-red-900/50 text-red-300 text-xs font-medium rounded-full">{item}</span>)}
                        </div>
                    </div>
                </div>
                 <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-gray-300 mb-2">{t('analysisDisplay.actionableSuggestions')}</h4>
                     <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                         {analysis.songConcept.productionSuggestions.map((item, i) => <li key={i}>{item}</li>)}
                     </ul>
                 </div>
            </div>
          </section>

          {productionConsultation && (
            <section className="space-y-8">
                <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300 text-sm" role="alert">
                    <p>{productionConsultation.disclaimer}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('analysisDisplay.specialistsTitle')}</h4>
                    <div className="flex flex-wrap gap-2">
                    {productionConsultation.recommendedProducers.map((trait, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-700 text-gray-200 text-sm rounded-full">{trait}</span>
                    ))}
                    </div>
                    {productionConsultation.recommendedProducers.length > 0 && (
                        <button
                        onClick={() => onFindSpecialists(productionConsultation.recommendedProducers)}
                        className="mt-4 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2"
                        >
                        <span>{t('analysisDisplay.findSpecialistsButton')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('analysisDisplay.conditionsTitle')}</h4>
                    {allLowRelevance && (
                        <div className="mb-4 p-4 bg-gray-700/50 border border-gray-600 text-gray-300 text-sm rounded-lg" role="alert">
                            <p>{t('analysisDisplay.lowConfidenceFallback')}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                    {productionConsultation.suggestedSongElements.map((element) => (
                        <div key={element.name} className="bg-gray-900/50 p-4 rounded-lg border border-white/10">
                        <h5 className="font-semibold text-white">{element.name}</h5>
                        <p className="text-sm text-gray-400 mt-1">{element.description}</p>
                        <p className="text-sm mt-3 text-cyan-300 bg-cyan-900/30 p-2 rounded-md">Guidance: {element.suggestedStep}</p>

                        <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap gap-2">
                            <button onClick={() => handleElementToggle(element.name)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                                {expandedElement === element.name ? t('analysisDisplay.hideDetails') : t('analysisDisplay.viewDetails')}
                            </button>
                            <button onClick={() => handleAcademicAnalysisToggle(element.name)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                                {academicAnalysisElement === element.name ? t('analysisDisplay.hideDetails') : t('analysisDisplay.academicAnalysisButton')}
                            </button>
                            {element.relevance === 'Low' && (
                                <button onClick={() => onRequestResearch(element.name)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-yellow-800/70 hover:bg-yellow-700 text-yellow-200 transition-colors">
                                    {t('analysisDisplay.requestResearchButton')}
                                </button>
                            )}
                        </div>
                        
                        {expandedElement === element.name && (
                            <div className="mt-4 p-4 bg-gray-900/70 rounded-md border border-white/10 animate-fade-in prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: element.details || '' }} />
                        )}
                        {academicAnalysisElement === element.name && (
                            <div className="mt-4 p-4 bg-gray-900/70 rounded-md border border-white/10 animate-fade-in prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: element.furtherReading || '' }} />
                        )}
                        </div>
                    ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">{t('analysisDisplay.treatmentSectionTitle')}</h3>
                     {songStructure && (
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('analysisDisplay.songStructureTitle')}</h4>
                            <div className="bg-gray-900/50 p-6 rounded-lg border border-white/10">
                                <h5 className="font-bold text-rose-300 text-lg">{songStructure.name}</h5>
                                <p className="text-sm text-gray-400 mt-1 mb-4">{songStructure.description}</p>
                                <div className="space-y-3 border-t border-white/10 pt-4">
                                    {songStructure.sections.map((section, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="bg-gray-700 text-white font-bold text-xs rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mr-3 mt-1 rtl:ml-3 rtl:mr-0">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{section.part}</p>
                                                <p className="text-sm text-gray-400">{section.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-200 mb-4">{t('analysisDisplay.treatmentSuggestionsTitle')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {productionConsultation.productionTips.map(tip => (
                                <div key={tip.title} className="bg-gray-900/50 p-5 rounded-lg border border-white/10 text-center">
                                    <div className="text-4xl mb-3">{tip.icon}</div>
                                    <h5 className="font-bold text-white mb-2">{tip.title}</h5>
                                    <p className="text-sm text-gray-400">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            
                <section className="pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">{t('analysisDisplay.costAnalysisTitle')}</h3>
                    {costAnalysis ? (
                        <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                        {renderCostTable(costAnalysis.productionCosts)}
                        </div>
                    ) : (
                        <button onClick={onCalculateCosts} disabled={isCalculatingCosts} className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 transition-colors">
                        {isCalculatingCosts ? t('analysisDisplay.calculatingCosts') : t('analysisDisplay.calculateCostsButton')}
                        </button>
                    )}
                    {costsError && <p className="text-red-400 text-sm mt-2">{costsError}</p>}
                </section>
                
                <div>
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('analysisDisplay.followUpTitle')}</h4>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-dashed border-white/20">
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                            {productionConsultation.songwritingQuestions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2 border-dashed border-rose-800">
                <section>
                    <h3 className="text-xl font-bold text-rose-300 mb-4 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        {t('analysisDisplay.makeupStyleTitle')}
                    </h3>
                    <div className="bg-gray-900/50 p-6 rounded-lg space-y-3 h-full">
                        <h4 className="font-bold text-lg text-white">{analysis.genreSuggestion.styleName}</h4>
                        <p className="text-sm text-gray-400">{analysis.genreSuggestion.description}</p>
                        <div className="pt-3 border-t border-white/10">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">{t('analysisDisplay.keyProducts')}</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {analysis.genreSuggestion.keyElements.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    </div>
                </section>
                 <section>
                    <h3 className="text-xl font-bold text-rose-300 mb-4 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 003.86.517l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318z" /></svg>
                        {t('analysisDisplay.homemadeMaskTitle')}
                    </h3>
                    <div className="bg-gray-900/50 p-6 rounded-lg space-y-3 h-full">
                        <h4 className="font-bold text-lg text-white">{analysis.melodyIdea.ideaName}</h4>
                        <p className="text-sm text-gray-400">{analysis.melodyIdea.description}</p>
                        <div className="pt-3 border-t border-white/10">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">{t('analysisDisplay.ingredients')}</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {analysis.melodyIdea.elements.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                         <div className="pt-3 border-t border-white/10">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">{t('analysisDisplay.instructions')}</h5>
                            <p className="text-sm whitespace-pre-line">{analysis.melodyIdea.instructions}</p>
                        </div>
                    </div>
                </section>
            </div>


          <div>
            <button
              onClick={onGenerateSummary}
              disabled={isGeneratingSummary}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingSummary ? t('analysisDisplay.generatingSummary') : t('analysisDisplay.prepareSummaryButton')}
            </button>
          </div>

          {(doctorSummary || doctorSummaryError) && (
             <div className="mt-6 animate-fade-in">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-200">{t('treatmentSummary.title')}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{t('treatmentSummary.style')}:</span>
                        <button
                            onClick={() => setSummaryStyle('dark')}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${summaryStyle === 'dark' ? 'bg-rose-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >{t('treatmentSummary.modernDark')}</button>
                        <button
                            onClick={() => setSummaryStyle('light')}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${summaryStyle === 'light' ? 'bg-rose-200 text-rose-900' : 'bg-gray-700 text-gray-300'}`}
                        >{t('treatmentSummary.classicLight')}</button>
                        <button
                            onClick={copySummaryToClipboard}
                            className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors ml-2"
                        >
                            {copySuccess || t('treatmentSummary.copyBio')}
                        </button>
                    </div>
                </div>
                {doctorSummaryError && <p className="text-sm text-red-400 p-3 bg-red-900/30 rounded-md">{doctorSummaryError}</p>}
                {doctorSummary && (
                    <div className="overflow-hidden">
                        <TreatmentSummary ref={summaryRef} summaryHtml={doctorSummary} styleMode={summaryStyle} />
                    </div>
                )}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;