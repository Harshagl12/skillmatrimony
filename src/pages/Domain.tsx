// =============================================
// PAGE 4: DOMAIN — Main Container
// 3 Sub-pages via Tabs:
//   1. Types of Domains (DomainExplorer)
//   2. Current Trends (CurrentTrends)
//   3. Know Your Domain (KnowYourDomain)
// =============================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  TrendingUp,
  Compass,
} from 'lucide-react';
import DomainExplorer from './domain/DomainExplorer';
import CurrentTrends from './domain/CurrentTrends';
import KnowYourDomain from './domain/KnowYourDomain';
import { trackEvent } from '../lib/analytics';

const TABS = [
  {
    id: 'explore',
    label: 'Types of Domains',
    icon: Layers,
    description: 'Browse branches & skill specializations',
    accent: 'violet'
  },
  {
    id: 'trends',
    label: 'Current Trends',
    icon: TrendingUp,
    description: 'Live technology trend dashboard',
    accent: 'emerald'
  },
  {
    id: 'know',
    label: 'Know Your Domain',
    icon: Compass,
    description: 'Interactive career mapping',
    accent: 'amber'
  },
];

const Domain = () => {
  const [activeTab, setActiveTab] = useState('explore');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    trackEvent('domain_tab_switch', { tab: tabId });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <header className="mb-10">
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Domain <span className="text-violet-500">Exploration</span>
        </h2>
        <p className="text-zinc-400">Discover your perfect career path — explore, learn, and map your future.</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-3 px-6 py-3.5 rounded-2xl font-medium transition-all relative overflow-hidden
                ${isActive
                  ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
                }
              `}
            >
              <tab.icon size={18} className={isActive ? 'text-white' : 'text-zinc-500'} />
              <div className="text-left">
                <span className="block text-sm font-bold">{tab.label}</span>
                <span className={`block text-[10px] ${isActive ? 'text-violet-200' : 'text-zinc-600'}`}>
                  {tab.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'explore' && <DomainExplorer />}
        {activeTab === 'trends' && <CurrentTrends />}
        {activeTab === 'know' && <KnowYourDomain />}
      </motion.div>
    </div>
  );
};

export default Domain;
