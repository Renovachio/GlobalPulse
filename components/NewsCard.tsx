
import React from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const getImpactColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-700 border-red-200';
    if (score >= 4) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('politic')) return 'bg-purple-600';
    if (cat.includes('tech')) return 'bg-blue-600';
    if (cat.includes('econ') || cat.includes('market')) return 'bg-emerald-600';
    if (cat.includes('health')) return 'bg-rose-600';
    if (cat.includes('science')) return 'bg-cyan-600';
    return 'bg-slate-700';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col">
      {news.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={news.imageUrl} 
            alt={news.title}
            onError={(e) => {
              // Hide image on load error
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`${getCategoryColor(news.category)} text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider shadow-sm`}>
              {news.category}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 pb-0">
          <span className={`${getCategoryColor(news.category)} text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider inline-block mb-2 shadow-sm`}>
            {news.category}
          </span>
        </div>
      )}

      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getImpactColor(news.impactScore)}`}>
            Impact Score: {news.impactScore}/10
          </div>
          <span className="text-xs text-slate-400">
            {formatDate(news.timestamp)}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 hover:text-blue-600 transition-colors">
          <a href={news.sources[0]?.uri} target="_blank" rel="noopener noreferrer">
            {news.title}
          </a>
        </h3>
        
        <p className="text-slate-600 text-sm mb-5 line-clamp-3">
          {news.summary}
        </p>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-2 mb-2 w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Origin: {news.country}</span>
          </div>
          {news.sources.map((source, i) => (
            <a
              key={i}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              {source.title.length > 20 ? 'Source Link' : source.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
