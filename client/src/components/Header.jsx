import React from 'react';
import { Search, Bell, Shield, ChevronDown, Radio } from 'lucide-react';

export default function Header({ searchKeyword, setSearchKeyword, onOpenCrawler, crawlerStatus }) {
  const currentDate = '06/10/2025';
  const currentTime = '10:24 AM';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3 min-w-[280px]">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Shield className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Giám Sát Nội Dung Y Tế
          </h1>
          <p className="text-[11px] font-medium text-slate-400">
            Mạng xã hội • Thẩm mỹ • An toàn sức khỏe
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            name="searchKeyword"
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm theo từ khóa, tài khoản, nội dung, link..."
            aria-label="Tìm kiếm theo từ khóa, tài khoản, nội dung, link"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center space-x-5">
        {/* Crawler Status Pill */}
        <button
          onClick={onOpenCrawler}
          className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
        >
          <Radio className={`w-3.5 h-3.5 ${crawlerStatus?.isRunning ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
          <span>{crawlerStatus?.isRunning ? 'Đang quét tự động...' : 'Bộ Rà Soát Tự Động (B1-B4)'}</span>
        </button>

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <div className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </div>
          <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-200"></div>

        {/* User Badge */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
            alt="Nguyễn Văn A"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
              Nguyễn Văn A
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Giám sát viên
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
        </div>

        {/* Date / Time */}
        <div className="text-right hidden xl:block pl-2 text-xs font-medium text-slate-500">
          <div>{currentDate}</div>
          <div className="text-slate-400 text-[11px]">{currentTime}</div>
        </div>
      </div>
    </header>
  );
}
