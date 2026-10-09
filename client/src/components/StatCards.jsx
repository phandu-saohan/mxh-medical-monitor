import React from 'react';
import { AlertTriangle, CheckCircle2, PlaySquare } from 'lucide-react';

export default function StatCards({ stats }) {
  const cards = [
    {
      title: 'Bài viết/Video vi phạm',
      value: stats?.totalViolations?.toLocaleString('vi-VN') || '156',
      change: '↑ 32% so với hôm qua',
      changeColor: 'text-red-500',
      icon: AlertTriangle,
      iconBg: 'bg-red-50 text-red-500',
      borderAccent: 'border-l-4 border-l-red-500'
    },
    {
      title: 'Tổng số nội dung đã quét',
      value: stats?.totalScanned?.toLocaleString('vi-VN') || '2.846',
      change: '↑ 18% so với hôm qua',
      changeColor: 'text-red-500',
      customIcon: (
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
          f
        </div>
      ),
      borderAccent: 'border-l-4 border-l-blue-600'
    },
    {
      title: 'Nội dung hợp lệ',
      value: stats?.totalValid?.toLocaleString('vi-VN') || '2.690',
      change: '↑ 16% so với hôm qua',
      changeColor: 'text-emerald-600',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderAccent: 'border-l-4 border-l-emerald-500'
    },
    {
      title: 'Video vi phạm',
      value: stats?.videoViolations?.toLocaleString('vi-VN') || '124',
      change: '↑ 28% so với hôm qua',
      changeColor: 'text-red-500',
      icon: PlaySquare,
      iconBg: 'bg-purple-50 text-purple-600',
      borderAccent: 'border-l-4 border-l-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow ${card.borderAccent}`}
          >
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                {card.title}
              </div>
              <div className={`text-[11px] font-medium mt-2 flex items-center ${card.changeColor}`}>
                {card.change}
              </div>
            </div>

            <div>
              {card.customIcon ? (
                card.customIcon
              ) : (
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
