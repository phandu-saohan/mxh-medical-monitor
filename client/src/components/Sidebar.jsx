import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  FileVideo,
  Hash,
  Users2,
  BarChart3,
  Settings,
  ShieldCheck,
  Bot,
  Building2,
  ShieldAlert,
  Video
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, violationCount = 0, onOpenCrawler }) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'violations', label: 'Danh sách vi phạm', icon: AlertOctagon, badge: violationCount },
    { id: 'radar', label: 'Radar Cơ Sở & Sổ Đen', icon: ShieldAlert },
    { id: 'tiktok', label: 'Giám sát TikTok & KOLs', icon: Video },
    { id: 'tracked', label: 'Bài viết / Video đã theo dõi', icon: FileVideo },
    { id: 'keywords', label: 'Theo dõi từ khóa', icon: Hash },
    { id: 'accounts', label: 'Tài khoản/Trang giám sát', icon: Users2 },
    { id: 'licenses', label: 'Tra cứu GPHĐ Thẩm mỹ', icon: Building2 },
    { id: 'reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#111928] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-64px)] border-r border-slate-800">
      {/* Menu List */}
      <nav className="p-4 space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Crawler Launcher Button in Sidebar */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onOpenCrawler}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-indigo-900/30 hover:brightness-110 transition-all border border-blue-500/30"
          >
            <div className="flex items-center space-x-3">
              <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Rà Soát Facebook (B1-B4)</span>
            </div>
            <span className="text-[10px] bg-blue-500/40 text-blue-100 px-1.5 py-0.5 rounded-sm">Playwright</span>
          </button>
        </div>
      </nav>

      {/* Community Protection Banner Card at Bottom */}
      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl p-4 border border-slate-700/60 shadow-lg text-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">
            Bảo vệ sức khỏe cộng đồng
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Phát hiện sớm — Ngăn chặn kịp thời — Vì một môi trường mạng an toàn
          </p>
        </div>
      </div>
    </aside>
  );
}
