
export interface NewsSource {
  title: string;
  uri: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  country: string;
  impactScore: number; // 1-10
  timestamp: string;
  sources: NewsSource[];
  imageUrl?: string;
}

export type Language = 'en' | 'pt';

export interface SearchFilters {
  theme: string;
  country: string;
  impact: string;
  query: string;
  language: Language;
}

export enum NewsImpact {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  ALL = 'All'
}

export const THEMES = [
  'All', 'Politics', 'Technology', 'Economy', 'Health', 'Environment', 'Science', 'Culture', 'Sports', 'Security'
];

export const COUNTRIES = [
  'Local', 'Global', 'USA', 'China', 'India', 'Brazil', 'United Kingdom', 'France', 'Germany', 'Japan', 'Australia', 'Nigeria', 'Egypt', 'Mexico'
];
