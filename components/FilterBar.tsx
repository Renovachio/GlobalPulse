
import React from 'react';
import { SearchFilters, THEMES, COUNTRIES, NewsImpact, Language } from '../types';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  loading: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onSearch, loading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const setLanguage = (lang: Language) => {
    onFilterChange({ ...filters, language: lang });
  };

  const getThemeColor = (theme: string) => {
    const t = theme.toLowerCase();
    if (t === 'all') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (t.includes('politic')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (t.includes('tech')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (t.includes('econ')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (t.includes('health')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (t.includes('env')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (t.includes('sci')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (t.includes('cult')) return 'bg-pink-100 text-pink-700 border-pink-200';
    if (t.includes('sport')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (t.includes('sec')) return 'bg-slate-700 text-white border-slate-800';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getCountryColor = (country: string) => {
    if (country === 'Local') return 'bg-indigo-600 text-white border-indigo-700';
    if (country === 'Global') return 'bg-slate-800 text-white border-slate-900';
    return 'bg-white text-slate-700 border-slate-300';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case NewsImpact.HIGH: return 'bg-red-600 text-white border-red-700';
      case NewsImpact.MEDIUM: return 'bg-orange-500 text-white border-orange-600';
      case NewsImpact.LOW: return 'bg-sky-500 text-white border-sky-600';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-10 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleChange}
          placeholder="Search topics, events, or keywords..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 font-medium"
        />
        <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap gap-2 items-end">
        <div className="flex flex-col gap-1 min-w-[80px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Language</span>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setLanguage('en')}
              className={`flex-1 py-1 px-2 text-xs font-bold rounded-md transition-all ${filters.language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('pt')}
              className={`flex-1 py-1 px-2 text-xs font-bold rounded-md transition-all ${filters.language === 'pt' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              PT
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Theme</span>
          <select
            name="theme"
            value={filters.theme}
            onChange={handleChange}
            className={`border-2 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer appearance-none ${getThemeColor(filters.theme)}`}
          >
            {THEMES.map(t => <option key={t} value={t} className="bg-white text-slate-800">{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[110px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Region</span>
          <select
            name="country"
            value={filters.country}
            onChange={handleChange}
            className={`border-2 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer appearance-none ${getCountryColor(filters.country)}`}
          >
            {COUNTRIES.map(c => <option key={c} value={c} className="bg-white text-slate-800">{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[110px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Impact</span>
          <select
            name="impact"
            value={filters.impact}
            onChange={handleChange}
            className={`border-2 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer appearance-none ${getImpactColor(filters.impact)}`}
          >
            <option value={NewsImpact.ALL} className="bg-white text-slate-800">Any Impact</option>
            <option value={NewsImpact.LOW} className="bg-white text-slate-800">Low Impact</option>
            <option value={NewsImpact.MEDIUM} className="bg-white text-slate-800">Medium Impact</option>
            <option value={NewsImpact.HIGH} className="bg-white text-slate-800">High Impact</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1 lg:pt-5 pt-0">
        <button
          onClick={onSearch}
          disabled={loading}
          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Pulse
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
