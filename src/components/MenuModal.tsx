
import React from 'react';
import {
  TreatmentPlan,
  useLanguage,
} from '../types';

interface ConsultationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TreatmentPlan | null;
  onSave: (plan: TreatmentPlan) => void;
  handleApiError: (error: unknown) => string;
}

const TreatmentItemDisplay: React.FC<{ items: { icon: string; name: string; description: string; }[], title: string }> = ({ items, title }) => (
  <div>
    <h4 className="text-xl font-bold text-rose-300 mb-4">{title}</h4>
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-start">
          <span className="text-3xl mr-4 rtl:ml-4 rtl:mr-0">{item.icon}</span>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ isOpen, onClose, plan, onSave }) => {
  const { t } = useLanguage();

  if (!isOpen || !plan) return null;

  const handleSave = () => {
    onSave(plan);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="text-center flex-grow">
            <h2 className="text-2xl font-bold text-rose-300 tracking-wider">{plan.planTitle}</h2>
            <p className="text-sm text-gray-400 mt-1">{plan.concernSummary}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="p-8 overflow-y-auto space-y-8">
          <section>
            <TreatmentItemDisplay items={plan.suggestedTreatments} title={t('consultationModal.treatments')} />
          </section>

          <section className="text-center space-y-4">
            <div>
                <h4 className="font-semibold text-gray-400">{t('consultationModal.disclaimerTitle')}</h4>
                <p className="text-xs text-gray-500">{plan.disclaimer}</p>
            </div>
            <button onClick={handleSave} className="px-6 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors">
              {t('consultationModal.savePlan')}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ConsultationDetailModal;
