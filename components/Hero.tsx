import React, { useState } from 'react';
import { useLanguage, Page } from '../types';

interface HomePageProps {
    setPage: (page: Page) => void;
}

const Icon: React.FC<{ name: string, className?: string }> = ({ name, className = "h-12 w-12 text-rose-400 mb-4" }) => {
    // FIX: Replaced beauty-themed icons with music-themed icons
    switch (name) {
        case 'idea':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
        case 'melody':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg>;
        case 'lyrics':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
        case 'chords':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7h2a2 2 0 100-4H7a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 100-4H9z" /></svg>;
        case 'drums':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'mastering':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
        case 'remix':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
        case 'sheet_music':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'art':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'collab':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        default:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v11.494m-9-5.494h18" /></svg>;
    }
};

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const { language, setLanguage, t } = useLanguage();
  const services: { icon: string, title: string, description: string, targetPage: Page }[] = t('hero.services');
  const homePageAdditions = t('hero.homePageAdditions');
  const aiExplanation = t('hero.aiExplanation');
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);


  return (
    <div className="animate-fade-in bg-gray-900 text-white">
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
          src="https://cdn.pixabay.com/video/2022/09/20/129188-751915934_large.mp4"
          poster="https://cdn.pixabay.com/photo/2017/08/30/17/23/fantasy-2697968_1280.jpg"
        />
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div className="z-20 p-4 space-y-6">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
            dangerouslySetInnerHTML={{ __html: t('hero.title') }}
          />
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('hero.subtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage('music_generation')}
                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all text-lg shadow-lg hover:shadow-rose-500/40 transform duration-300 hover:scale-110 hover:-translate-y-1 animate-pulse-glow"
              >
                {t('hero.button1')}
              </button>
              <button
                onClick={() => setPage('our_producers')}
                className="px-8 py-4 bg-transparent border-2 border-white/70 text-white font-bold rounded-lg hover:bg-white/10 hover:border-white transition-all text-lg transform duration-300 hover:scale-105 hover:-translate-y-1"
              >
                {t('hero.button2')}
              </button>
          </div>
        </div>
        <div className="absolute bottom-8 z-20 flex items-center justify-center space-x-2 sm:space-x-4 bg-gray-900/50 backdrop-blur-sm p-2 rounded-full shadow-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                language === 'en' ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('fa')}
              className={`px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                language === 'fa' ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              فارسی
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                language === 'ar' ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              العربية
            </button>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {t('hero.servicesTitle')}
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                    {t('hero.servicesSubtitle')}
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                    <button 
                        key={index} 
                        onClick={() => setPage(service.targetPage || 'music_generation')}
                        className="bg-gray-800/50 p-8 rounded-lg border border-white/10 text-left transition-all duration-300 hover:border-rose-400/50 hover:bg-gray-800 hover:-translate-y-2 group"
                    >
                        <Icon name={service.icon} />
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">{service.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                    </button>
                ))}
            </div>
        </div>
      </section>
      
      {/* AI Explanation Section */}
      <section className="py-20 sm:py-28 bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {aiExplanation.title}
            </h2>
            <p className="mt-4 text-lg text-gray-300">
                {aiExplanation.subtitle}
            </p>
          </div>
          <div className="mt-16 max-w-4xl mx-auto space-y-4">
            {aiExplanation.points.map((point: {title: string, description: string}, index: number) => (
              <div key={index} className="border border-white/10 rounded-lg overflow-hidden transition-all duration-300 bg-gray-900/30">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-900/50 transition-colors"
                  aria-expanded={openAccordion === index}
                  aria-controls={`accordion-content-${index}`}
                >
                  <h3 className="text-lg font-semibold text-white">{point.title}</h3>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 text-rose-400 transition-transform duration-300 transform ${openAccordion === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  id={`accordion-content-${index}`}
                  className={`transition-all duration-500 ease-in-out grid ${openAccordion === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 bg-gray-800/50 text-gray-300 border-t border-white/10">
                      <p className="leading-relaxed">{point.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {homePageAdditions.testimonialsTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              {homePageAdditions.testimonialsSubtitle}
            </p>
          </div>
          <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {homePageAdditions.testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-gray-800/50 p-8 rounded-lg border border-white/10 text-center relative overflow-hidden flex flex-col">
                <svg className="absolute top-0 left-0 h-24 w-24 text-rose-500/10 transform -translate-x-4 -translate-y-4 rtl:right-0 rtl:left-auto rtl:translate-x-4" stroke="currentColor" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-9.609l.017.017v3.316h-2.54c-2.883 0-4.444 2.118-4.444 4.542v9.122h-2zM.017 21v-7.391c0-5.704 3.731-9.57 8.983-9.609l.017.017v3.316h-2.54c-2.883 0-4.444 2.118-4.444 4.542v9.122h-2z"></path></svg>
                <div className="flex-grow z-10">
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </div>
                <div className="mt-6 z-10">
                  <p className="font-bold text-white text-lg">{testimonial.name}</p>
                  <p className="text-sm text-rose-300">{testimonial.treatment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctor Section */}
      <section className="py-20 sm:py-28 bg-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-gray-800/50 rounded-lg shadow-lg border border-white/10 p-8 sm:p-12 overflow-hidden">
            <div className="relative h-96 md:h-full rounded-lg overflow-hidden order-1 md:order-2">
                <img 
                    src="https://images.unsplash.com/photo-1580894742597-87bc8789db3d?q=80&w=1000&auto=format&fit=crop" 
                    alt={homePageAdditions.featuredDoctor.name}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 via-transparent to-transparent md:bg-gradient-to-l md:from-gray-800/80"></div>
            </div>
            <div className="relative z-10 order-2 md:order-1">
              <h3 className="text-base font-semibold uppercase tracking-wider text-rose-300">{homePageAdditions.featuredDoctorTitle}</h3>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">{homePageAdditions.featuredDoctor.name}</h2>
              <p className="mt-1 text-lg text-rose-200/90">{homePageAdditions.featuredDoctor.specialty}</p>
              <p className="mt-4 text-gray-400 leading-relaxed">{homePageAdditions.featuredDoctor.bio}</p>
              <div className="mt-8">
                <button 
                  // FIX: Updated page key to 'our_producers'
                  onClick={() => setPage('our_producers')} 
                  className="px-8 py-3 bg-gray-700/50 border border-gray-500 text-white font-semibold rounded-md hover:bg-gray-700 transition-all text-lg transform duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  {homePageAdditions.featuredDoctorButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;