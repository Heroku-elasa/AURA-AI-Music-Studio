
import React from 'react';
import { useLanguage, ProducerProfile } from '../types';

const OurProducersPage: React.FC = () => {
  const { t } = useLanguage();
  const producers: ProducerProfile[] = t('ourProducers.doctors');
  const headers: { [key: string]: string } = t('ourProducers.tableHeaders');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          {t('ourProducers.title')}
        </h1>
        <p className="mt-4 text-lg text-gray-300">{t('ourProducers.subtitle')}</p>
      </div>

      <div className="mt-16 max-w-6xl mx-auto">
        <div className="bg-gray-800/50 border border-white/10 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/60">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">{headers.name}</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">{headers.specialty}</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden md:table-cell">{headers.bio}</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">{headers.license}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900/30">
                {producers.map((producer) => (
                  <tr key={producer.name} className="hover:bg-gray-800/40 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{producer.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{producer.specialty}</td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-400 hidden md:table-cell">{producer.bio}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-400 font-semibold">{producer.licenseNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurProducersPage;
