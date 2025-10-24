

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Page } from '../types';

interface SiteHeaderProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    isAuthenticated: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onSearchClick: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ currentPage, setPage, isAuthenticated, onLoginClick, onLogoutClick, onSearchClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handlePageChange = (page: Page) => {
      setPage(page);
      setIsMobileMenuOpen(false);
      window.scrollTo(0, 0);
  }
  
  // FIX: Updated navLinks to use correct page keys and translation keys for the music theme
  const navLinks = [
    { key: 'home', text: t('header.home'), action: () => handlePageChange('home') },
    { key: 'song_idea_generator', text: t('header.songIdeaGenerator'), action: () => handlePageChange('song_idea_generator') },
    { key: 'music_generation', text: t('header.musicGeneration'), action: () => handlePageChange('music_generation') },
    { key: 'music_sheet_generator', text: t('header.musicSheetGenerator'), action: () => handlePageChange('music_sheet_generator') },
    { key: 'instrument_finder', text: t('header.instrumentFinder'), action: () => handlePageChange('instrument_finder') },
    { key: 'ai_tutor', text: t('header.aiTutor'), action: () => handlePageChange('ai_tutor') },
    { key: 'music_trends', text: t('header.musicTrends'), action: () => handlePageChange('music_trends') },
    { key: 'our_producers', text: t('header.ourProducers'), action: () => handlePageChange('our_producers') },
    { key: 'collaboration', text: t('header.collaboration'), action: () => handlePageChange('collaboration') },
    { key: 'my_projects', text: t('header.myProjects'), action: () => handlePageChange('my_projects') },
  ];

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button onClick={() => setPage('home')} className="flex-shrink-0 flex items-center space-x-2 rtl:space-x-reverse transform transition-transform hover:scale-105">
               <svg className="h-8 w-8 text-rose-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a.75.75 0 01.75.75v.255a.25.25 0 00.5 0V2.75A.75.75 0 0112 2h.25a.25.25 0 000-.5H12a.75.75 0 01-.75-.75V.5a.25.25 0 00-.5 0v.25A.75.75 0 0110 2zM8 4.25a.25.25 0 00-.5 0V5a.75.75 0 01-1.5 0V4.25a.25.25 0 00-.5 0V5A.75.75 0 014 5h-.25a.25.25 0 000 .5H4A.75.75 0 014.75 6v.25a.25.25 0 00.5 0V6A.75.75 0 016 5.25h.25a.25.25 0 000-.5H6A.75.75 0 015.25 4V3.75a.25.25 0 00-.5 0V4c0 .414.336.75.75.75h.5a.75.75 0 01.75-.75V3.75a.25.25 0 00-.5 0v.5zM12.25 6a.25.25 0 00.5 0V5.75A.75.75 0 0114 5h.25a.25.25 0 000-.5H14a.75.75 0 01-.75-.75V3.5a.25.25 0 00-.5 0v.25A.75.75 0 0112 4.5h-.25a.25.25 0 000 .5h.25A.75.75 0 0112.75 6z" />
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V10zm1.5 0V8.75a.75.75 0 00-1.5 0V10a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 000-1.5H6a.75.75 0 000 1.5h.75zm1.5 0a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01zM10 8.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm1.5.75a.75.75 0 00-.75-.75h-.01a.75.75 0 000 1.5h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM15.25 10a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0V10zM3 15a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-.01zm1.5 0V13.75a.75.75 0 00-1.5 0V15a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 000-1.5H6a.75.75 0 000 1.5h.75zm1.5 0a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01zM10 13.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5.75a.75.75 0 00-.75-.75h-.01a.75.75 0 000 1.5h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zm2.25.75a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01z" clipRule="evenodd" />
               </svg>
              <span className="font-bold text-xl text-white">AURA</span>
            </button>
            <nav className="hidden md:flex md:ml-10 md:space-x-4 lg:space-x-8">
              {navLinks.map(link => (
                  <button key={link.key} onClick={link.action} className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transform transition-all duration-200 hover:-translate-y-0.5 ${currentPage === link.key ? 'text-rose-300' : ''}`}>
                    {link.text}
                  </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={onSearchClick} className="flex items-center text-gray-300 hover:text-white transform transition-transform hover:scale-110" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <div className="relative" ref={langMenuRef}>
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center text-gray-300 hover:text-white transform transition-transform hover:scale-110" aria-label="Change language">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m4 13l4-4M19 9l-4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                {isLangMenuOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
                        <div className="p-1" role="none">
                            <button 
                                onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-4 py-2 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                role="menuitem"
                            >
                                English
                            </button>
                            <button 
                                onClick={() => { setLanguage('fa'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-4 py-2 text-sm rounded-md transition-colors ${language === 'fa' ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                role="menuitem"
                            >
                                فارسی (Persian)
                            </button>
                            <button 
                                onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-4 py-2 text-sm rounded-md transition-colors ${language === 'ar' ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                role="menuitem"
                            >
                                العربية (Arabic)
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="hidden sm:block">
                {isAuthenticated ? (
                    <button onClick={onLogoutClick} className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors text-sm">
                        {t('header.logout')}
                    </button>
                ) : (
                    <button onClick={onLoginClick} className="px-4 py-2 bg-gray-700/50 border border-gray-500 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors text-sm">
                        {t('header.login')}
                    </button>
                )}
            </div>

            <div className="flex md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map(link => (
                  <button key={link.key} onClick={link.action} className={`w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${currentPage === link.key ? 'bg-gray-900 text-white' : ''}`}>
                    {link.text}
                  </button>
              ))}
              <div className="pt-4 border-t border-gray-700">
                {isAuthenticated ? (
                     <button onClick={() => { onLogoutClick(); setIsMobileMenuOpen(false); }} className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                        {t('header.logout')}
                    </button>
                ) : (
                    <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                        {t('header.login')}
                    </button>
                )}
              </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;