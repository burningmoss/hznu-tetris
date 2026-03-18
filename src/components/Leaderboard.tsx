import React from 'react';
import { Trophy } from 'lucide-react';

interface Props {
  leaderboard: { name: string; score: number }[];
}

export const Leaderboard: React.FC<Props> = ({ leaderboard }) => {
  return (
    <div className="bg-[#1a1a1a] border border-[#006633]/30 rounded-xl p-6 w-full max-w-xs shadow-xl">
      <div className="flex items-center gap-2 mb-6 border-b border-[#006633]/20 pb-4">
        <Trophy className="text-yellow-500 w-5 h-5" />
        <h2 className="text-xl font-bold text-white tracking-tight italic">the rank list of hznuer</h2>
      </div>
      
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No records yet...</p>
        ) : (
          leaderboard.map((entry, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center group transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${index < 3 ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-gray-300 font-medium">{entry.name}</span>
              </div>
              <span className="text-sm font-mono text-[#006633] font-bold">
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 pt-4 border-t border-[#006633]/10">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          Python Course @ HZNU
        </p>
      </div>
    </div>
  );
};
