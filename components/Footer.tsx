import React from 'react';
import { useLanguage } from '../types';

const SiteFooter: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer id="footer" className="bg-black/20 backdrop-blur-sm text-gray-400 border-t border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                           <svg className="h-8 w-8 text-rose-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 2a.75.75 0 01.75.75v.255a.25.25 0 00.5 0V2.75A.75.75 0 0112 2h.25a.25.25 0 000-.5H12a.75.75 0 01-.75-.75V.5a.25.25 0 00-.5 0v.25A.75.75 0 0110 2zM8 4.25a.25.25 0 00-.5 0V5a.75.75 0 01-1.5 0V4.25a.25.25 0 00-.5 0V5A.75.75 0 014 5h-.25a.25.25 0 000 .5H4A.75.75 0 014.75 6v.25a.25.25 0 00.5 0V6A.75.75 0 016 5.25h.25a.25.25 0 000-.5H6A.75.75 0 015.25 4V3.75a.25.25 0 00-.5 0V4c0 .414.336.75.75.75h.5a.75.75 0 01.75-.75V3.75a.25.25 0 00-.5 0v.5zM12.25 6a.25.25 0 00.5 0V5.75A.75.75 0 0114 5h.25a.25.25 0 000-.5H14a.75.75 0 01-.75-.75V3.5a.25.25 0 00-.5 0v.25A.75.75 0 0112 4.5h-.25a.25.25 0 000 .5h.25A.75.75 0 0112.75 6z" />
                              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V10zm1.5 0V8.75a.75.75 0 00-1.5 0V10a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 000-1.5H6a.75.75 0 000 1.5h.75zm1.5 0a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01zM10 8.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm1.5.75a.75.75 0 00-.75-.75h-.01a.75.75 0 000 1.5h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM15.25 10a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0V10zM3 15a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-.01zm1.5 0V13.75a.75.75 0 00-1.5 0V15a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 000-1.5H6a.75.75 0 000 1.5h.75zm1.5 0a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01zM10 13.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5.75a.75.75 0 00-.75-.75h-.01a.75.75 0 000 1.5h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zm2.25.75a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01z" clipRule="evenodd" />
                           </svg>
                            {/* FIX: Changed brand name from "Modern Clinic" to "AURA" */}
                            <span className="font-bold text-xl text-white">AURA</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm">{t('footer.description')}</p>
                    </div>
                    <div className="text-center md:text-right">
                         <p className="text-xs">{t('footer.copyright')}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;
