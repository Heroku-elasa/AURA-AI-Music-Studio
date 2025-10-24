
import React, { useState, useEffect, useRef } from 'react';
import { MusicIdeaDetails, useLanguage } from '../types';
import { MUSICAL_IDEA_PROMPTS } from '../constants';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

interface MusicIdeaFormProps {
  onAnalyze: () => void;
  isLoading: boolean;
  symptoms: string; // Re-using prop name for simplicity, now represents musical idea
  setSymptoms: (value: React.SetStateAction<string>) => void;
  symptomDetails: MusicIdeaDetails; // Re-using prop name, now represents musical details
  setSymptomDetails: (value: React.SetStateAction<MusicIdeaDetails>) => void;
  isQuotaExhausted: boolean;
}

const MusicIdeaForm: React.FC<MusicIdeaFormProps> = ({ 
  onAnalyze, 
  isLoading, 
  symptoms: idea,
  setSymptoms: setIdea,
  symptomDetails: ideaDetails,
  setSymptomDetails: setIdeaDetails,
  isQuotaExhausted
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'fa' ? 'fa-IR' : 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setIdea(prev => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    }
    
    recognitionRef.current = recognition;
  }, [language, setIdea]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      alert(t('musicIdeaForm.validationError'));
      return;
    }
    onAnalyze();
  };
  
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIdeaDetails(d => ({ ...d, [name]: value }));
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-white">{t('musicIdeaForm.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="description" className={`block text-sm font-medium text-gray-300`}>{t('musicIdeaForm.symptomsLabel')}</label>
            <button
                type="button"
                onClick={toggleListening}
                title={isListening ? t('musicIdeaForm.voiceInputStop') : t('musicIdeaForm.voiceInputStart')}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/50 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                disabled={!recognitionRef.current}
            >
                {isListening ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                        <path d="M5.5 13a.5.5 0 01.5.5v1.5a4.5 4.5 0 009 0v-1.5a.5.5 0 011 0v1.5a5.5 5.5 0 01-11 0v-1.5a.5.5 0 01.5-.5z" />
                     </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm5 10.5a.5.5 0 01.5.5v.5a3.5 3.5 0 01-7 0v-.5a.5.5 0 01.5-.5h6zM5 8a1 1 0 011-1h1V6a1 1 0 112 0v1h1a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
          </div>
          <textarea
            id="description"
            rows={8}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white"
            placeholder={t('musicIdeaForm.symptomsPlaceholder')}
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-gray-400 mb-3">{t('musicIdeaForm.culturalPromptsTitle')}</h4>
          <div className="flex flex-wrap gap-2">
            {MUSICAL_IDEA_PROMPTS[language].map((prompt: string, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => setIdea(prompt)}
                className="px-3 py-1.5 bg-gray-700/80 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-600 hover:text-white transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">{t('musicIdeaForm.detailsTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            
            <div>
              <label htmlFor="referenceArtists" className="block text-sm font-medium text-gray-300">{t('musicIdeaForm.aggravatingFactors')}</label>
              <input type="text" name="referenceArtists" id="referenceArtists" value={ideaDetails.referenceArtists} onChange={handleDetailChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

            <div>
              <label htmlFor="specificInstruments" className="block text-sm font-medium text-gray-300">{t('musicIdeaForm.alleviatingFactors')}</label>
              <input type="text" name="specificInstruments" id="specificInstruments" value={ideaDetails.specificInstruments} onChange={handleDetailChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="targetLength" className="block text-sm font-medium text-gray-300">{t('musicIdeaForm.duration')}</label>
              <input type="text" name="targetLength" id="targetLength" value={ideaDetails.targetLength} onChange={handleDetailChange} placeholder={t('musicIdeaForm.durationPlaceholder')} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>
            
            <div>
                <label htmlFor="daw" className="block text-sm font-medium text-gray-300">{t('musicIdeaForm.previousTreatments')}</label>
                <input type="text" name="daw" id="daw" value={ideaDetails.daw} onChange={handleDetailChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

            <div>
                <label htmlFor="existingIdeas" className="block text-sm font-medium text-gray-300">{t('musicIdeaForm.medications')}</label>
                <input type="text" name="existingIdeas" id="existingIdeas" value={ideaDetails.existingIdeas} onChange={handleDetailChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || isQuotaExhausted}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t('songIdeaGenerator.analyzing') : isQuotaExhausted ? t('quotaErrorModal.title') : t('musicIdeaForm.buttonText')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MusicIdeaForm;
