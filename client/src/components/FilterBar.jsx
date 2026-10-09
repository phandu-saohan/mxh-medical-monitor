import React from 'react';
import { Search, RotateCcw, Calendar, Play } from 'lucide-react';

export default function FilterBar({
  filters,
  setFilters,
  onSearch,
  onReset,
  onOpenCrawler
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Nền tảng */}
        <div className="flex flex-col min-w-[130px]">
          <label htmlFor="filter-platform-select" className="text-[11px] font-semibold text-slate-500 mb-1">
            Nền tảng
          </label>
          <div className="relative">
            <select
              id="filter-platform-select"
              name="platform"
              value={filters.platform}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="Facebook">Facebook</option>
              <option value="Tất cả">Tất cả nền tảng</option>
              <option value="TikTok">TikTok (Sắp có)</option>
              <option value="YouTube">YouTube (Sắp có)</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </div>
          </div>
        </div>

        {/* Loại nội dung */}
        <div className="flex flex-col min-w-[130px]">
          <label htmlFor="filter-post-type-select" className="text-[11px] font-semibold text-slate-500 mb-1">
            Loại nội dung
          </label>
          <div className="relative">
            <select
              id="filter-post-type-select"
              name="postType"
              value={filters.postType}
              onChange={(e) => setFilters({ ...filters, postType: e.target.value })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Video">Video</option>
              <option value="Hình ảnh">Hình ảnh</option>
              <option value="Bài viết">Bài viết</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </div>
          </div>
        </div>

        {/* Loại vi phạm */}
        <div className="flex flex-col min-w-[220px]">
          <label htmlFor="filter-category-select" className="text-[11px] font-semibold text-slate-500 mb-1">
            Loại vi phạm
          </label>
          <div className="relative">
            <select
              id="filter-category-select"
              name="category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer truncate"
            >
              <option value="Tất cả">Tất cả vi phạm</option>
              <option value="Quảng cáo dịch vụ thẩm mỹ trái phép">Quảng cáo dịch vụ thẩm mỹ trái phép</option>
              <option value="Cam kết hiệu quả không đúng">Cam kết hiệu quả không đúng</option>
              <option value="Sử dụng hình ảnh trước/sau sai sự thật">Sử dụng hình ảnh trước/sau sai sự thật</option>
              <option value="Thông tin không được cấp phép">Thông tin không được cấp phép</option>
              <option value="Khác">Khác</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="flex flex-col min-w-[190px]">
          <label className="text-[11px] font-semibold text-slate-500 mb-1">
            Thời gian
          </label>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>01/10/2025</span>
            <span className="text-slate-400">→</span>
            <span>06/10/2025</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2.5 pt-4 sm:pt-0">
        <button
          onClick={onSearch}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Tìm kiếm</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>

        <button
          onClick={onOpenCrawler}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all cursor-pointer"
          title="Kích hoạt bộ rà soát tự động Facebook (B1-B4)"
        >
          <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
          <span>Rà soát tự động FB</span>
        </button>
      </div>
    </div>
  );
}
