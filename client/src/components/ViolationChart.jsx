import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ViolationChart({ breakdown, total = 156 }) {
  const [timeRange, setTimeRange] = useState('7 ngày gần đây');

  // Colors aligned with the mockup donut chart
  const items = [
    {
      name: 'Quảng cáo dịch vụ thẩm mỹ trái phép',
      percentage: 42,
      count: 65,
      color: '#4f46e5' // Indigo / Purple
    },
    {
      name: 'Cam kết hiệu quả không đúng',
      percentage: 21,
      count: 33,
      color: '#ec4899' // Pink / Magenta
    },
    {
      name: 'Sử dụng hình ảnh trước/sau sai sự thật',
      percentage: 15,
      count: 23,
      color: '#0284c7' // Cyan / Sky blue
    },
    {
      name: 'Thông tin không được cấp phép',
      percentage: 12,
      count: 19,
      color: '#10b981' // Emerald / Green
    },
    {
      name: 'Khác',
      percentage: 10,
      count: 16,
      color: '#94a3b8' // Slate gray
    }
  ];

  // Calculate SVG stroke dashes for Donut chart
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs h-full flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800">
          Thống kê theo loại vi phạm
        </h3>
        <div className="flex items-center space-x-1 text-xs text-slate-500 cursor-pointer hover:text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          <span>{timeRange}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Donut Chart with center label */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 160 160">
            {items.map((item, index) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percentage;

              return (
                <circle
                  key={index}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black text-slate-800 leading-none">
              {total}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
              vi phạm
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-1.5 flex-1 w-full text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center space-x-2 truncate max-w-[210px]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 truncate group-hover:text-slate-900 transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="text-slate-800 font-semibold shrink-0 ml-2">
                <span>{item.percentage}%</span>
                <span className="text-slate-400 font-normal ml-1">({item.count})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
