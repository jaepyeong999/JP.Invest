
import React from 'react';
import { MarketIndicator } from '../types';

interface MarketCardProps {
  indicator: MarketIndicator;
}

const MarketCard: React.FC<MarketCardProps> = ({ indicator }) => {
  const isUp = indicator.change >= 0;
  
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{indicator.name}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(indicator.change).toFixed(2)}%
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900">
        {indicator.value}
      </div>
      <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} 
          style={{ width: `${Math.min(Math.abs(indicator.change) * 20, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MarketCard;
