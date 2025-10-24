

import React, { useState } from 'react';
import { useLanguage, SearchResultItem, Page, ProviderSearchResult, isProviderSearchResult } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  results: (SearchResultItem | ProviderSearchResult)[] | null;
  error: string | null;
  onNavigate: (page: Page) => void;
}

const ProviderResultCard: React.FC<{ item: ProviderSearchResult }> = ({ item }) => {
    const ActionButton: React.FC<{ href: string; children: React.ReactNode, isExternal?: boolean }> = ({ href, children, isExternal = false }) => (
        <a 
            href={href} 
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : ''}
            className="flex-1 text-center py-2 px-3 bg-gray-700/60 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
            {children}
        </a>
    );

    return (
        <div className="w-full text-left bg-gray-800/70 p-4 rounded-lg border border-white/10">
            <h3 className="font-bold text-rose-300">{item.name}</h3>
            {item.specialty && <p className="text-sm font-medium text-rose-200/90 -mt-1">{item.specialty}</p>}
            <p className="text-sm text-gray-400 mt-2">{item.description}</p>
            <p className="text-xs text-gray-500 mt-3 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                <span>{item.address}</span>
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <ActionButton href={`tel:${item.phone}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    <span>Call</span>
                </ActionButton>
                <ActionButton href={item.website} isExternal={true}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                    <span>Website</span>
                </ActionButton>
                <ActionButton href={`https://wa.me/${item.whatsapp?.replace(/[^0-9]/g, '')}`} isExternal={true}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                    <span>WhatsApp</span>
                </ActionButton>
            </div>
        </div>
    );
};

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  isLoading,
  results,
  error,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };
  
  const hasResults = results && results.length > 0;
  const noResultsFound = results && results.length === 0;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className="w-full max-w-2xl mt-12 sm:mt-20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h1 id="search-modal-title" className="text-xl font-bold text-white">{t('searchModal.title')}</h1>
            <button onClick={onClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white" aria-label="Close search">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-800 border border-white/20 rounded-lg p-2 shadow-lg">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('searchModal.placeholder')}
            className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 text-lg focus:outline-none"
            autoFocus
          />
          <button type="submit" disabled={isLoading} className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors disabled:bg-gray-500">
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
            ) : t('searchModal.searchButton')}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-300">
            {!isLoading && !results && !error && (
                <div className="animate-fade-in">
                    <h2 className="font-semibold mb-3">{t('searchModal.suggestionsTitle')}</h2>
                    <div className="flex flex-wrap gap-2">
                        {t('searchModal.suggestionQueries').map((suggestion: string, index: number) => (
                            <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="px-3 py-1.5 bg-gray-700/80 hover:bg-gray-600 rounded-full transition-colors">
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="mt-8 max-h-[50vh] overflow-y-auto pr-2">
            {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
            
            {hasResults && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="font-semibold text-white">{t('searchModal.resultsTitle')}</h2>
                    {results.map((item, index) => {
                        if (isProviderSearchResult(item)) {
                            return <ProviderResultCard key={item.id || index} item={item} />;
                        }
                        // It's a SearchResultItem
                        return (
                             <button
                                key={index}
                                onClick={() => onNavigate(item.targetPage)}
                                className="w-full text-left bg-gray-800/70 p-4 rounded-lg border border-transparent hover:border-rose-500 hover:bg-gray-800 transition-all group"
                            >
                                <h3 className="font-bold text-rose-300 group-hover:underline">{item.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {noResultsFound && (
                <div className="text-center p-8 text-gray-500 bg-gray-800/50 rounded-lg">
                    <p>{t('searchModal.noResults')}</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default SearchModal;