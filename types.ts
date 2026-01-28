
export interface MarketIndicator {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  date: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'earnings' | 'macro' | 'fed';
  impact: 'high' | 'medium' | 'low';
}

export interface Company {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  description: string;
}

export interface AIAnalysis {
  overview: string;
  keyTakeaways: string[];
  riskFactor: number; // 0-100
  recommendedAction: string;
}

export enum NavigationTab {
  DASHBOARD = 'dashboard',
  ANALYST = 'analyst',
  NEWS = 'news',
  CALENDAR = 'calendar',
  WATCHLIST = 'watchlist'
}
