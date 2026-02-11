
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem, SearchFilters, NewsImpact } from './types';
import { fetchNewsWithGemini } from './services/geminiService';
import FilterBar from './components/FilterBar';
import NewsCard from './components/NewsCard';
import ImpactVisualization from './components/ImpactVisualization';

const App: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    theme: 'All',
    country: 'Local', // Default to Local
    impact: NewsImpact.ALL,
    query: '',
    language: 'en' // Default to English
  });
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const calculateImpactData = (newsList: NewsItem[]) => {
    return [
      { name: 'Low (1-3)', count: newsList.filter(n => n.impactScore <= 3).length },
      { name: 'Med (4-7)', count: newsList.filter(n => n.impactScore > 3 && n.impactScore <= 7).length },
      { name: 'High (8-10)', count: newsList.filter(n => n.impactScore > 7).length },
    ];
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const [impactData, setImpactData] = useState<any[]>([]);

  const loadNews = useCallback(async (isInitial: boolean = false, currentCoords?: { latitude: number; longitude: number }) => {
    if (isInitial) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    try {
      const currentPage = isInitial ? 1 : page + 1;
      
      // Get titles of currently displayed news to help Gemini avoid them
      const currentHeadlines = news.map(n => n.title);
      
      const data = await fetchNewsWithGemini(filters, currentPage, currentCoords || coords, currentHeadlines);
      
      // Strict frontend filter to ensure no duplicates by title
      const existingTitles = new Set(news.map(n => n.title.toLowerCase().trim()));
      const filteredNewNews = data.news.filter(item => !existingTitles.has(item.title.toLowerCase().trim()));

      if (isInitial) {
        setNews(data.news);
        setImpactData(calculateImpactData(data.news));
      } else {
        if (filteredNewNews.length === 0 && data.news.length > 0) {
          // If Gemini returned only duplicates, we might want to try one more page or just stop
          console.warn("Gemini returned only duplicate headlines. Stopping pulse.");
          setHasMore(false);
        } else {
          setNews(prev => {
            const newList = [...prev, ...filteredNewNews];
            setImpactData(calculateImpactData(newList));
            return newList;
          });
          setPage(currentPage);
          setHasMore(data.news.length >= 5);
        }
      }
      
    } catch (err) {
      setError('Failed to fetch the latest news. Please try again in a moment.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, page, coords, news]);

  // Initial search or filter change
  const handleSearch = () => {
    // We clear news when a manual search/filter change happens to get a fresh start
    setNews([]);
    setPage(1);
    // Use a small timeout to allow state to start clearing if needed, though loadNews(true) handles it
    setTimeout(() => loadNews(true), 0);
  };

  // Re-fetch when language changes automatically for better UX
  useEffect(() => {
    if (news.length > 0) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.language]);

  // On mount, get location and trigger first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoords(loc);
          loadNews(true, loc);
        },
        (error) => {
          console.warn("Geolocation access denied:", error);
          loadNews(true);
        }
      );
    } else {
      loadNews(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          loadNews(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, loadNews]);

  return (
    <div className="min-h-screen pb-12">
      {/* Navbar / Header */}
      <header className="bg-white border-b border-slate-200 py-6 mb-8 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="bg-blue-600 text-white p-1.5 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              GlobalPulse
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Daily World News Aggregator</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filters.country === 'Local' && coords ? 'Local Pulse' : 'World Pulse'}
              </p>
              <p className="text-sm font-semibold text-slate-700">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3 space-y-8">
            <FilterBar 
              filters={filters} 
              onFilterChange={setFilters} 
              onSearch={handleSearch} 
              loading={loading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4">
                <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {loading && news.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse p-5 space-y-4">
                    <div className="bg-slate-200 h-48 rounded-xl w-full"></div>
                    <div className="bg-slate-200 h-6 rounded w-3/4"></div>
                    <div className="bg-slate-200 h-4 rounded w-full"></div>
                    <div className="bg-slate-200 h-4 rounded w-full"></div>
                    <div className="bg-slate-200 h-10 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {news.length > 0 ? (
                  <>
                    <div className="masonry-grid">
                      {news.map(item => (
                        <div key={item.id} className="masonry-item">
                          <NewsCard news={item} />
                        </div>
                      ))}
                    </div>
                    
                    <div ref={observerTarget} className="h-20 flex items-center justify-center">
                      {loadingMore && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Searching for new headlines...</p>
                        </div>
                      )}
                      {!hasMore && news.length > 0 && (
                        <p className="text-slate-400 text-sm italic">You've reached the end of the pulse for now.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No headlines found</h2>
                    <p className="text-slate-500">Try adjusting your filters or checking your location permissions.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-8 lg:sticky lg:top-24 h-fit">
            <ImpactVisualization data={impactData} />
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">Location Aware</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                {filters.country === 'Local' && coords 
                  ? "We've detected your location and are surfacing news from your region."
                  : "You're viewing news for " + (filters.country === 'Local' ? 'your local area' : filters.country) + "."}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold bg-white/10 p-3 rounded-xl">
                  <span className={`w-2 h-2 rounded-full ${coords ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                  {coords ? 'PRECISION LOCATION ACTIVE' : 'LOCATION DENIED - FALLBACK ACTIVE'}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['#ClimateAction', '#SpaceTech', '#MarketShift', '#ElectionDay', '#HealthCrisis', '#LocalUpdates'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, query: tag.replace('#', '') }));
                      setTimeout(handleSearch, 0);
                    }}
                    className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            Powered by Gemini AI. Search results are filtered to prevent duplicates and ensure real-time novelty.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
