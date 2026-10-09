import React from 'react';
import { Users, ExternalLink, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AccountsView({ violations }) {
  // Aggregate unique pages and violation counts
  const pageMap = new Map();

  violations.forEach((v) => {
    if (!pageMap.has(v.author)) {
      pageMap.set(v.author, {
        author: v.author,
        handle: v.authorHandle,
        avatar: v.avatar,
        followers: v.followers,
        violationCount: 1,
        categories: new Set([v.category]),
        latestPostUrl: v.postUrl
      });
    } else {
      const existing = pageMap.get(v.author);
      existing.violationCount += 1;
      existing.categories.add(v.category);
    }
  });

  const pages = Array.from(pageMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Tài Khoản / Trang Thẩm Mỹ Trong Tầm Ngắm Giám Sát
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hồ sơ các Fanpage, Viện Thẩm Mỹ, Cơ sở Spa có tần suất đăng tải nội dung vi phạm nhiều lần.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pages.map((p, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start space-x-3.5">
              <img
                src={p.avatar}
                alt={p.author}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {p.author}
                </h4>
                <div className="text-xs text-blue-600 font-medium">
                  {p.handle}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {p.followers} followers
                </div>
              </div>

              <div className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-lg text-xs border border-red-200 shrink-0">
                {p.violationCount} vi phạm
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400">Các hành vi ghi nhận:</div>
              <div className="flex flex-wrap gap-1">
                {Array.from(p.categories).map((cat, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-amber-600 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mức độ cảnh báo: Cao</span>
              </span>
              <a
                href={p.latestPostUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>Xem trang FB</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
