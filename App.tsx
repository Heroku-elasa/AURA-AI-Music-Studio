
import React, { useState, useEffect } from 'react';
import SiteHeader from './components/Header';
import HomePage from './components/Hero';
import MyProjectsPage from './components/ReportGenerator';
import SiteFooter from './components/Footer';
import QuotaErrorModal from './components/QuotaErrorModal';
import ChangelogModal from './components/GoogleBabaModal';
import LoginModal from './components/LoginModal';
import LiveTutorPage from './components/LiveTutorPage';
import MusicTrendsPage from './components/NewsSummarizer';
import OurProducersPage from './components/StartupShowcase';
import CollaborationLabelPage from './components/InvestmentPage';
import InstrumentFinderPage from './components/InstrumentFinderPage';
import MusicGenerationPage from './components/FeminineFirstDatingPage';
import StudioSetupPage from './components/FranchisePage';
import MusicSheetGeneratorPage from './components/MusicSheetGeneratorPage';
import SongIdeaGeneratorPage from './components/SongIdeaGeneratorPage';
import SearchModal from './components/SearchModal';
import { Page, SavedProject, ProviderSearchResult, SearchResultItem, useLanguage } from './types';
import { useToast } from './components/Toast';
import { initDB, saveConsultation as saveDb, getAllSavedConsultations, deleteConsultation as deleteDb } from './services/dbService';
import { performSemanticSearch, findLocalProviders, classifySearchQuery } from './services/geminiService';

const App: React.FC = () => {
  const [currentPage, setPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // My Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [projectToRestore, setProjectToRestore] = useState<SavedProject | null>(null);

  // Instrument Finder State
  const [providerResults, setProviderResults] = useState<ProviderSearchResult[] | null>(null);
  const [isFindingProviders, setIsFindingProviders] = useState(false);
  
  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<(SearchResultItem | ProviderSearchResult)[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { addToast } = useToast();
  const { language, t } = useLanguage();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const projects = await getAllSavedConsultations();
        setSavedProjects(projects);
      } catch (error) {
        console.error("Failed to initialize DB:", error);
        addToast("Could not load saved projects.", "error");
      }
    };
    initialize();
  }, [addToast]);
  
  const handleApiError = (error: unknown): string => {
    let message = "An unexpected error occurred.";
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    if (message.includes('429') || message.includes('quota')) {
        setIsQuotaExhausted(true);
        message = "API quota exceeded. Please check your billing or try again later.";
    }
    
    addToast(message, 'error');
    return message;
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    addToast("You have been logged out.", "info");
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    addToast("Login successful!", "success");
  };
  
  const handleSaveProject = async (project: SavedProject) => {
    try {
        await saveDb(project);
        const updatedProjects = await getAllSavedConsultations();
        setSavedProjects(updatedProjects);
        addToast("Project saved successfully!", "success");
    } catch (error) {
        handleApiError(error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDb(id);
      const updatedProjects = savedProjects.filter(p => p.id !== id);
      setSavedProjects(updatedProjects);
      addToast("Project deleted successfully.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRestoreProject = (id: string) => {
      const project = savedProjects.find(p => p.id === id);
      if (project) {
          setProjectToRestore(project);
          setPage('music_generation');
          addToast(`Restored "${project.name}".`, 'info');
      }
  };
  
  const handleProviderSearch = async (
    searchMethod: 'geo' | 'text',
    query: string,
    searchType: 'stores' | 'studios'
  ) => {
      setIsFindingProviders(true);
      setProviderResults(null);
      try {
          let location: { lat: number; lon: number } | null = null;
          if (searchMethod === 'geo') {
              try {
                  location = await new Promise((resolve, reject) => {
                      navigator.geolocation.getCurrentPosition(
                          position => resolve({
                              lat: position.coords.latitude,
                              lon: position.coords.longitude
                          }),
                          error => {
                            console.error("Geolocation error:", error);
                            addToast(`Geolocation failed: ${error.message}. Searching without location.`, 'info');
                            resolve(null);
                          },
                          { timeout: 10000 }
                      );
                  });
              } catch (geoError) {
                  console.error("Geolocation promise error:", geoError);
                  addToast("Could not get your location.", "error");
              }
          }
          const results = await findLocalProviders(query, searchType, location, language);
          setProviderResults(results);
      } catch (err) {
          handleApiError(err);
      } finally {
          setIsFindingProviders(false);
      }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchResults(null);
    setSearchError(null);

    try {
      const classification = await classifySearchQuery(query, language);

      if (classification.type === 'provider_search' && classification.providerType !== 'none') {
        const providerResults = await findLocalProviders(classification.searchQuery, classification.providerType, null, language);
        setSearchResults(providerResults);
      } else {
        const services = t('hero.services');
        const producers = t('ourProducers.doctors');
        const pages = [
            { name: t('header.musicGeneration'), target: 'music_generation', description: t('musicGeneration.subtitle') },
            { name: t('header.instrumentFinder'), target: 'instrument_finder', description: t('instrumentFinder.subtitle') },
            { name: t('header.aiTutor'), target: 'ai_tutor', description: t('aiTutor.subtitle') },
            { name: t('header.musicTrends'), target: 'music_trends', description: t('musicTrends.subtitle') },
            { name: t('header.ourProducers'), target: 'our_producers', description: t('ourProducers.subtitle') },
            { name: t('header.collaboration'), target: 'collaboration', description: t('collaborationPage.goalText') },
            { name: t('header.myProjects'), target: 'my_projects', description: t('myProjectsPage.subtitle') },
        ];

        const searchIndex = `
          Services available at AURA Music Studio: ${JSON.stringify(services)}.
          Producers at AURA: ${JSON.stringify(producers)}.
          Website Pages: ${JSON.stringify(pages)}.
        `;

        const results = await performSemanticSearch(query, searchIndex, language);
        setSearchResults(results);
      }
    } catch (err) {
      const msg = handleApiError(err);
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigateFromSearch = (page: Page) => {
    setPage(page);
    setIsSearchModalOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'music_generation':
        return <MusicGenerationPage 
            handleApiError={handleApiError} 
            isQuotaExhausted={isQuotaExhausted}
            onSaveProject={handleSaveProject}
            projectToRestore={projectToRestore}
            setProjectToRestore={setProjectToRestore}
        />;
      case 'song_idea_generator':
        return <SongIdeaGeneratorPage handleApiError={handleApiError} />;
      case 'music_sheet_generator':
        return <MusicSheetGeneratorPage handleApiError={handleApiError} />;
      case 'instrument_finder':
        return <InstrumentFinderPage 
            onSearch={handleProviderSearch}
            isLoading={isFindingProviders}
            results={providerResults}
            isQuotaExhausted={isQuotaExhausted}
        />;
      case 'ai_tutor':
        return <LiveTutorPage 
            handleApiError={handleApiError}
        />;
      case 'music_trends':
        return <MusicTrendsPage handleApiError={handleApiError} />;
      case 'our_producers':
        return <OurProducersPage />;
      case 'collaboration':
        return <CollaborationLabelPage setPage={setPage} />;
      case 'studio_setup':
        return <StudioSetupPage setPage={setPage} />;
      case 'my_projects':
        return <MyProjectsPage 
            savedProjects={savedProjects} 
            onDelete={handleDeleteProject}
            onRestore={handleRestoreProject}
            setPage={setPage} 
        />;
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
      <div className="bg-gray-900 text-white font-sans">
        <SiteHeader
          currentPage={currentPage}
          setPage={setPage}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogoutClick={handleLogout}
          onSearchClick={() => setIsSearchModalOpen(true)}
        />
        <main>
            {renderPage()}
        </main>
        <SiteFooter />
        <QuotaErrorModal isOpen={isQuotaExhausted} onClose={() => setIsQuotaExhausted(false)} />
        <ChangelogModal isOpen={isChangelogModalOpen} onClose={() => setIsChangelogModalOpen(false)} />
        <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
            onLogin={handleLogin} 
        />
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSearch={handleSearch}
          isLoading={isSearching}
          results={searchResults}
          error={searchError}
          onNavigate={handleNavigateFromSearch}
        />
      </div>
  );
};

export default App;
