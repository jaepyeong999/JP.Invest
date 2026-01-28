
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Newspaper, 
  Calendar, 
  LayoutDashboard,
  Search,
  Bell,
  ArrowRight,
  Zap,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Menu,
  X,
  Star,
  Plus,
  Trash2,
  Building2,
  Loader2
} from 'lucide-react';
import { NavigationTab, MarketIndicator, NewsItem, CalendarEvent, Company } from './types';
import MarketCard from './components/MarketCard';
import { getMacroSummary, getMarketAnalysis, getLatestEconomicNews, getCalendarEvents, searchCompanies } from './services/geminiService';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

const chartData = [
  { name: '09:00', value: 5240 },
  { name: '10:00', value: 5265 },
  { name: '11:00', value: 5245 },
  { name: '12:00', value: 5280 },
  { name: '13:00', value: 5310 },
  { name: '14:00', value: 5305 },
  { name: '15:00', value: 5325 },
  { name: '16:00', value: 5342 },
];

const indicators: MarketIndicator[] = [
  { name: 'S&P 500', value: '5,342.12', change: 1.25, trend: 'up' },
  { name: '나스닥 100', value: '18,672.44', change: 1.84, trend: 'up' },
  { name: '원/달러 환율', value: '1,372.50', change: -0.15, trend: 'down' },
  { name: '금 (온스)', value: '$2,345.20', change: 0.42, trend: 'up' },
  { name: '비트코인', value: '$67,420', change: -2.10, trend: 'down' },
  { name: 'WTI 유가', value: '$78.45', change: 0.85, trend: 'up' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DASHBOARD);
  const [macroSummary, setMacroSummary] = useState<string>("시장 요약을 불러오는 중...");
  const [query, setQuery] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stock Search & Watchlist States
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [isSearchingStocks, setIsSearchingStocks] = useState(false);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [watchlist, setWatchlist] = useState<Company[]>(() => {
    const saved = localStorage.getItem('jp_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jp_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const summary = await getMacroSummary();
        setMacroSummary(summary);
      } catch (e) { console.error(e); }
      
      setIsLoadingNews(true);
      try {
        const news = await getLatestEconomicNews();
        setNewsList(news);
      } catch (e) { console.error(e); }
      setIsLoadingNews(false);

      setIsLoadingCalendar(true);
      try {
        const events = await getCalendarEvents();
        setCalendarEvents(events);
      } catch (e) { console.error(e); }
      setIsLoadingCalendar(false);
    };
    fetchInitial();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsAnalyzing(true);
    try {
      const result = await getMarketAnalysis(query);
      setAiAnalysis(result);
      setActiveTab(NavigationTab.ANALYST);
    } catch (error) {
      setAiAnalysis("분석에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStockSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockSearchQuery) return;
    setIsSearchingStocks(true);
    try {
      const results = await searchCompanies(stockSearchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingStocks(false);
    }
  };

  const toggleWatchlist = (company: Company) => {
    const exists = watchlist.find(c => c.ticker === company.ticker);
    if (exists) {
      setWatchlist(prev => prev.filter(c => c.ticker !== company.ticker));
    } else {
      setWatchlist(prev => [...prev, company]);
    }
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: NavigationTab, icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] text-slate-900">
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-950 text-slate-300 border-r border-slate-900 flex flex-col fixed inset-y-0 z-50 transition-transform md:sticky md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-7 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-xl">
              <TrendingUp className="text-white w-5 h-5" strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">JP.Invest</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 mt-4">
          <NavButton tab={NavigationTab.DASHBOARD} icon={LayoutDashboard} label="대시보드" />
          <NavButton tab={NavigationTab.ANALYST} icon={MessageSquare} label="AI 분석가" />
          <NavButton tab={NavigationTab.NEWS} icon={Newspaper} label="시장 뉴스" />
          <NavButton tab={NavigationTab.CALENDAR} icon={Calendar} label="경제 캘린더" />
          <NavButton tab={NavigationTab.WATCHLIST} icon={Star} label="내 감시목록" />
        </nav>

        <div className="p-5 border-t border-white/5">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h4 className="font-black text-sm mb-1">PRO 인텔리전스</h4>
              <p className="text-[11px] text-indigo-100/80 mb-4 leading-relaxed font-medium">실시간 섹터 심화 인사이트를 무제한으로 이용하세요.</p>
              <button className="w-full py-2.5 bg-white text-indigo-800 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all shadow-md active:scale-95">
                프리미엄 가입
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-10">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 px-6 py-4 md:px-10">
          <div className="flex justify-between items-center gap-6 max-w-7xl mx-auto">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4 flex-1 max-w-2xl hidden md:flex">
              <form onSubmit={handleAnalyze} className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="JP.Invest AI에게 시장 트렌드에 대해 질문하세요..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm transition-all outline-none font-medium"
                />
              </form>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:shadow-sm">
                <Bell size={20} />
              </button>
              <div className="h-8 w-px bg-slate-100 mx-2"></div>
              <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg font-black text-sm">
                  JP
                </div>
                <div className="text-left hidden lg:block">
                   <p className="text-[13px] font-black text-slate-900 leading-none mb-1">JP Investor</p>
                   <p className="text-[10px] font-bold text-slate-400 leading-none">Standard Plan</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
          {/* Market Pulse Banner */}
          <div className="mb-12 p-6 bg-[#0f172a] rounded-[2.5rem] text-white shadow-2xl flex items-center gap-6 relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
            <div className="bg-indigo-500 p-3.5 rounded-2xl shadow-lg animate-pulse relative z-10">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1 overflow-hidden relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">JP.Invest 마켓 펄스</p>
              </div>
              <p className="text-xl font-extrabold truncate leading-tight tracking-tight">
                {macroSummary}
              </p>
            </div>
            <button 
              onClick={() => setActiveTab(NavigationTab.ANALYST)}
              className="hidden lg:flex items-center gap-2 text-xs font-black bg-white/10 hover:bg-white/20 px-5 py-3 rounded-2xl transition-all border border-white/10 backdrop-blur-md whitespace-nowrap z-10 relative group"
            >
              전문가 리포트 보기 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {activeTab === NavigationTab.DASHBOARD && (
            <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {indicators.map((ind, idx) => (
                  <MarketCard key={idx} indicator={ind} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">S&P 500 퍼포먼스</h2>
                      <p className="text-sm font-bold text-slate-400 mt-1.5">실시간 시장 유동성 및 가격 분석</p>
                    </div>
                    <div className="flex bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100">
                       {['1D', '1W', '1M', '1Y'].map(period => (
                         <button key={period} className={`px-5 py-2 rounded-2xl text-[11px] font-black transition-all ${period === '1D' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                           {period}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="h-[380px] -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                        <YAxis hide domain={['dataMin - 15', 'dataMax + 15']} />
                        <Tooltip 
                          contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', background: '#ffffff'}}
                          itemStyle={{color: '#6366f1', fontWeight: '900', fontSize: '15px'}}
                          cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                  <h2 className="text-2xl font-black mb-8 tracking-tight">섹터 포커스</h2>
                  <div className="space-y-6 flex-1">
                    {[
                      { label: '기술', color: 'indigo', title: 'AI 하드웨어 수요 폭증', desc: '차세대 칩 생산량 확대 전망에 따른 반도체 섹터 강세 지속.' },
                      { label: '에너지', color: 'emerald', title: '전략적 비축유 재고 감소', desc: '지정학적 긴장 속 유가 변동성 확대 및 공급망 리스크 주시.' },
                      { label: '소비재', color: 'rose', title: '가계 실질 소득 변화', desc: '인플레이션 둔화 조짐 속 소비 심리 회복 및 실적 개선 기대.' }
                    ].map((sector, i) => (
                      <div key={i} className="group p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all cursor-pointer">
                        <p className={`text-[10px] font-black text-${sector.color}-600 mb-2.5 uppercase tracking-wider`}>{sector.label}</p>
                        <p className="text-[15px] font-black text-slate-900 mb-2 leading-tight">{sector.title}</p>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium line-clamp-2">{sector.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 py-4 bg-slate-950 text-white text-xs font-black rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    전체 분석 리포트
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === NavigationTab.NEWS && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-rose-500 text-white text-[11px] font-black rounded-[0.5rem] tracking-wider animate-pulse uppercase">LIVE</span>
                    <h2 className="text-4xl font-black text-slate-950 tracking-tighter">시장 실시간 뉴스</h2>
                  </div>
                  <p className="text-slate-500 font-bold text-base">지난 3일간 블룸버그 및 주요 외신에서 가장 많이 조회된 뉴스</p>
                </div>
                <div className="flex bg-white border border-slate-100 p-2 rounded-[1.5rem] shadow-sm">
                   {['전체', '주식', '원자재', '환율', '크립토'].map((cat, i) => (
                     <button key={cat} className={`px-6 py-2.5 rounded-2xl text-[13px] font-black transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}>
                       {cat}
                     </button>
                   ))}
                </div>
              </div>

              {isLoadingNews ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-5 animate-pulse h-[380px]">
                      <div className="aspect-[16/10] bg-slate-100 rounded-[1.75rem] mb-6"></div>
                      <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                      <div className="h-3 bg-slate-100 rounded-full w-full mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded-full w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {newsList.map((news) => (
                    <div key={news.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-[420px]">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img 
                          src={news.imageUrl} 
                          alt={news.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4">
                           <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-slate-900 shadow-xl border border-white/20 uppercase">{news.source}</span>
                        </div>
                      </div>
                      <div className="p-7 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="text-[11px] font-bold text-slate-400">{news.date}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-950 mb-3 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-6 font-medium">
                          {news.summary}
                        </p>
                        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                           <button className="text-[11px] font-black text-indigo-600 flex items-center gap-1.5 group/btn">
                             전체 읽기 <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                           </button>
                           <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                              <span className="text-[10px] font-black text-slate-400">조회수 급증</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === NavigationTab.ANALYST && (
            <div className="animate-in slide-in-from-bottom-4 duration-1000">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 p-20 opacity-[0.03] text-indigo-900">
                    <MessageSquare size={240} />
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 relative z-10">
                    <div className="bg-gradient-to-tr from-indigo-600 to-blue-700 p-5 rounded-[2rem] text-white shadow-2xl">
                      <MessageSquare size={32} />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-950 tracking-tighter">JP.Invest AI 분석가</h2>
                      <p className="text-slate-500 font-bold text-lg mt-1">제미나이 3 Pro 기반의 투자 전략 엔진</p>
                    </div>
                  </div>

                  {!aiAnalysis && !isAnalyzing && (
                    <div className="text-center py-20 relative z-10">
                      <div className="bg-slate-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                        <Search className="text-indigo-300" size={48} />
                      </div>
                      <h3 className="text-2xl font-black mb-4 tracking-tight">전략적 의사결정을 위한 최고의 통찰력</h3>
                      <p className="text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed text-base font-medium">
                        기업 펀더멘탈, 거시 경제 시나리오, 혹은 자산 배분 전략에 대해 JP.Invest의 AI에게 직접 물어보세요.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        {[
                          "엔비디아 Blackwell 플랫폼 출시의 시장 지배력 분석",
                          "고금리 장기화가 테크 기업 밸류에이션에 미치는 시나리오",
                          "신흥국 통화 변동성과 미 국채 금리의 상관관계",
                          "비트코인 반감기 이후의 기관 자금 유입 전망"
                        ].map((q, idx) => (
                          <button key={idx} onClick={() => setQuery(q)} className="p-6 text-sm font-black text-left bg-white hover:bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-[2rem] shadow-sm transition-all flex items-center justify-between group">
                            <span className="line-clamp-1">"{q}"</span>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="py-28 flex flex-col items-center justify-center relative z-10">
                      <div className="relative mb-10">
                        <div className="w-24 h-24 border-[6px] border-slate-50 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap size={36} className="text-indigo-600 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-slate-950 tracking-tight">AI가 전문 분석 보고서를 생성 중입니다</p>
                      <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest">REAL-TIME DATA PROCESSING...</p>
                    </div>
                  )}

                  {aiAnalysis && !isAnalyzing && (
                    <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-8 border-b border-slate-100 gap-6">
                        <div>
                          <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">ANALYSIS REPORT</p>
                          <h4 className="text-2xl font-black text-slate-950 leading-tight">질문: {query}</h4>
                        </div>
                        <button onClick={() => { setAiAnalysis(""); setQuery(""); }} className="px-7 py-3 bg-slate-950 text-white text-[13px] font-black rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all">새로운 분석 시작</button>
                      </div>
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <div className="whitespace-pre-wrap font-bold text-base md:text-lg">
                          {aiAnalysis}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === NavigationTab.CALENDAR && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-12">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-950 tracking-tighter">글로벌 경제 캘린더</h2>
                  <p className="text-slate-500 font-bold text-lg mt-1">기업 실적 및 거시 지표 핵심 일정</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2.5 px-4 py-2 bg-rose-50 border border-rose-100 rounded-2xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse"></div>
                      <span className="text-xs font-black text-rose-700 uppercase">HIGH IMPACT</span>
                   </div>
                </div>
              </div>

              {isLoadingCalendar ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-28 bg-white rounded-[2rem] border border-slate-100 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {calendarEvents.length > 0 ? (
                     calendarEvents.map((event) => (
                      <div key={event.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex items-start gap-5 relative overflow-hidden">
                        <div className={`p-4 rounded-[1.5rem] relative z-10 ${
                          event.type === 'earnings' ? 'bg-blue-50 text-blue-600' :
                          event.type === 'fed' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {event.type === 'earnings' ? <TrendingUp size={28}/> :
                           event.type === 'fed' ? <AlertCircle size={28}/> : <Calendar size={28}/>}
                        </div>
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">{event.date}</span>
                             {event.impact === 'high' && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse"></span>}
                          </div>
                          <h4 className="text-base font-black text-slate-950 group-hover:text-indigo-600 transition-colors leading-tight mb-3">{event.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-500">
                              {event.type === 'earnings' ? '실적 발표' : event.type === 'fed' ? '연준/통화' : '매크로 지표'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-100 group-hover:text-indigo-300 transition-colors mt-1" size={24} />
                      </div>
                    ))
                   ) : (
                    <div className="col-span-full py-28 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar size={40} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-black text-lg">현재 예정된 데이터가 없습니다.</p>
                    </div>
                   )}
                </div>
              )}
            </div>
          )}

          {activeTab === NavigationTab.WATCHLIST && (
            <div className="animate-in slide-in-from-bottom-4 duration-1000 space-y-12">
               <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-950 tracking-tighter">종목 탐색 및 감시목록</h2>
                  <p className="text-slate-500 font-bold text-lg mt-1">미국 상장사 검색 및 개인화된 포트폴리오 관리</p>
                </div>
                <div className="w-full max-w-md">
                   <form onSubmit={handleStockSearch} className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                     <input 
                       type="text" 
                       value={stockSearchQuery}
                       onChange={(e) => setStockSearchQuery(e.target.value)}
                       placeholder="기업명 또는 티커 검색 (예: Apple, NVDA)" 
                       className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-[2rem] text-sm font-bold shadow-sm outline-none transition-all"
                     />
                     {isSearchingStocks && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 animate-spin" size={20} />}
                   </form>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-2">
                       <Building2 className="text-indigo-600" /> 검색 결과
                    </h3>
                    <button onClick={() => setSearchResults([])} className="text-slate-400 hover:text-rose-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((company) => {
                      const isWatched = watchlist.some(c => c.ticker === company.ticker);
                      return (
                        <div key={company.ticker} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group">
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{company.ticker}</p>
                               <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{company.name}</h4>
                             </div>
                             <button 
                               onClick={() => toggleWatchlist(company)}
                               className={`p-2.5 rounded-xl transition-all shadow-sm ${isWatched ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 hover:text-indigo-600'}`}
                             >
                               {isWatched ? <Star size={20} fill="currentColor" /> : <Plus size={20} />}
                             </button>
                           </div>
                           <div className="flex items-center gap-2 mb-4">
                             <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{company.sector}</span>
                             <span className="font-black text-indigo-600 text-sm">{company.price}</span>
                           </div>
                           <p className="text-[12px] text-slate-500 leading-relaxed font-medium line-clamp-2">{company.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Watchlist Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Star className="text-amber-400 fill-amber-400" />
                  <h3 className="text-2xl font-black tracking-tight">나의 감시목록</h3>
                </div>

                {watchlist.length === 0 ? (
                  <div className="bg-white p-20 rounded-[3rem] border border-slate-100 border-dashed text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Star className="text-slate-200" size={32} />
                    </div>
                    <p className="text-slate-400 font-black text-lg mb-2">아직 추가된 기업이 없습니다.</p>
                    <p className="text-slate-400 font-bold text-sm">관심 있는 기업을 검색하여 감시목록을 만들어보세요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {watchlist.map((company) => (
                      <div key={company.ticker} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 transition-transform duration-1000">
                          <Building2 size={80} />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black tracking-widest uppercase mb-2 inline-block">
                              {company.ticker}
                            </span>
                            <h4 className="text-xl font-black text-slate-900 leading-tight">{company.name}</h4>
                          </div>
                          <button 
                            onClick={() => toggleWatchlist(company)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">현재가 (예상)</p>
                              <p className="text-lg font-black text-indigo-600">{company.price}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">섹터</p>
                              <p className="text-[11px] font-black text-slate-600">{company.sector}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Promotion */}
              <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                       <h3 className="text-3xl font-black mb-3 tracking-tighter">실시간 데이터 연동 준비</h3>
                       <p className="text-indigo-300 font-bold text-lg opacity-80">개인별 즐겨찾기 목록에 대한 실시간 시세 알림이 곧 시작됩니다.</p>
                    </div>
                    <button className="px-10 py-5 bg-indigo-600 text-white font-black rounded-[2rem] hover:bg-indigo-500 hover:shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 transition-all whitespace-nowrap text-base">알림 미리 신청</button>
                 </div>
                 <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-8 py-5 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.08)]">
        {[
          { tab: NavigationTab.DASHBOARD, icon: LayoutDashboard },
          { tab: NavigationTab.ANALYST, icon: MessageSquare },
          { tab: NavigationTab.NEWS, icon: Newspaper },
          { tab: NavigationTab.CALENDAR, icon: Calendar },
          { tab: NavigationTab.WATCHLIST, icon: Star }
        ].map(({ tab, icon: Icon }) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`p-3.5 rounded-[1.25rem] transition-all ${activeTab === tab ? 'text-indigo-600 bg-indigo-50 shadow-inner' : 'text-slate-300'}`}
          >
            <Icon size={24} strokeWidth={2.5} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
