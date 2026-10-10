import React, { useState } from 'react';
import { MoreHorizontal, FileText, CheckCircle, Clock } from 'lucide-react';

function cleanContentText(text) {
  if (!text) return '';
  return text
    .replace(/(?:\bFacebook\b[\s,.:;·•\-_/|]*){2,}/gi, ' ')
    .replace(/^\s*(?:Facebook[\s,.:;·•\-_/|]*)+/gi, '')
    .replace(/(?:Facebook[\s,.:;·•\-_/|]*)+\s*$/gi, '')
    .replace(/\bFacebook\s+Facebook\b/gi, '')
    .replace(/Có thể là hình ảnh về[^\n\.]*(?:\.|\n|$)/gi, ' ')
    .replace(/May be an image of[^\n\.]*(?:\.|\n|$)/gi, ' ')
    .replace(/Đã chia sẻ bài viết.*$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function ViolationsTable({
  violations = [],
  totalCount = 156,
  selectedItem,
  onSelectItem,
  currentPage = 1,
  totalPages = 23,
  onPageChange
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === violations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(violations.map((v) => v.id)));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Badge styles for violation categories
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Quảng cáo dịch vụ thẩm mỹ trái phép':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'Sử dụng hình ảnh trước/sau sai sự thật':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'Thông tin không được cấp phép':
        return 'bg-pink-50 text-pink-600 border border-pink-200';
      case 'Cam kết hiệu quả không đúng':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  // Badge styles for resolution status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'bg-amber-50 text-amber-700 border border-amber-200/80';
      case 'Đã xác minh':
        return 'bg-orange-50 text-orange-700 border border-orange-200/80';
      case 'Đã xử lý':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Header / Title */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-900">
            Danh sách nội dung vi phạm
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            ({totalCount})
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-blue-600 font-medium">
              Đã chọn {selectedIds.size} mục
            </span>
            <button
              onClick={() => alert(`Lập hồ sơ thanh tra hàng loạt cho ${selectedIds.size} bài viết!`)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Lập hồ sơ hàng loạt
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === violations.length && violations.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-28">Thời gian</th>
              <th className="py-3 px-2 w-14 text-center">Nền tảng</th>
              <th className="py-3 px-4 min-w-[280px]">Nội dung</th>
              <th className="py-3 px-3 w-48">Loại vi phạm</th>
              <th className="py-3 px-3 w-28 text-center">Trạng thái</th>
              <th className="py-3 px-3 w-16 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {violations.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500/60" />
                    <p className="text-sm font-bold text-slate-700">Chưa có vi phạm nào được ghi nhận</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Dữ liệu mẫu đã được làm sạch. Cơ sở dữ liệu đang ở trạng thái Trắng (Production 100%), sẵn sàng ghi nhận các vi phạm thực tế từ Facebook.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              violations.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isChecked = selectedIds.has(item.id);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/60 ring-1 ring-blue-500/20'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => toggleSelectOne(item.id, e)}
                      className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Thời gian */}
                  <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                    <div>{item.timestamp.split(' ')[0]}</div>
                    <div className="text-[11px] text-slate-400">{item.timestamp.split(' ')[1]}</div>
                  </td>

                  {/* Nền tảng (Facebook Icon) */}
                  <td className="py-3 px-2 text-center">
                    <div className="inline-flex w-7 h-7 rounded-full bg-blue-600 text-white items-center justify-center font-bold text-sm shadow-xs">
                      f
                    </div>
                  </td>

                  {/* Nội dung (Thumb + Text + Page) */}
                  <td className="py-3 px-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.mediaUrl || item.avatar}
                        alt="Thumbnail"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          {cleanContentText(item.content)}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                          {item.isGroup || item.authorType === 'Group' || /hội|nhóm|group|cộng đồng|tâm sự|chia sẻ/i.test(item.author) ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                              Hội Nhóm
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                              Fanpage
                            </span>
                          )}
                          <span className="font-semibold text-slate-700 truncate">{item.author}</span>
                          <span className="text-slate-400 shrink-0">({item.followers || 'Đang hoạt động'})</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Loại vi phạm */}
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold leading-tight ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectItem(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Xem chi tiết"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          {totalCount === 0 ? (
            <span>Hiển thị <span className="font-semibold text-slate-800">0</span> kết quả</span>
          ) : (
            <span>
              Hiển thị <span className="font-semibold text-slate-800">{(currentPage - 1) * 7 + 1} - {Math.min(currentPage * 7, totalCount)}</span> trong{' '}
              <span className="font-semibold text-slate-800">{totalCount}</span> kết quả
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ‹
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange && onPageChange(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

            {totalPages > 5 && (
              <button
                onClick={() => onPageChange && onPageChange(totalPages)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer ${
                  currentPage === totalPages ? 'bg-blue-600 text-white' : ''
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
