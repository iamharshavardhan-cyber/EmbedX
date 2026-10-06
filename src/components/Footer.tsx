import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040406] border-t border-[#1a1a24] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF2D2D] animate-pulse"></span>
          <span className="text-xs font-black tracking-widest text-white uppercase">EMBEDX PCB WORKSHOP 2026</span>
        </div>
        <p className="text-sm text-gray-500">
          EMBEDX · Crew of EmbedX · Government Institute of Electronics, Secunderabad
        </p>
      </div>
    </footer>
  );
};
