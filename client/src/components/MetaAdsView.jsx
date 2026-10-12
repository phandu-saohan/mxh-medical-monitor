import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Building2,
  Calendar,
  Filter,
  RefreshCw,
  FolderOpen,
  Info,
  DollarSign,
  Tag,
  KeyRound,
  FileText
} from 'lucide-react';

export default function MetaAdsView({ onOpenViolationModal }) {
  const [keyword, setKeyword] = useState('nâng mũi');
  const [metaToken, setMetaToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [dbKeywords, setDbKeywords] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Quick keywords suggestions
  const quickKeywords = [
    'nâng mũi cấu trúc',
    'tiêm filler cằm',
    'tiêm botox gọn hàm',
    'cắt mí mini deep',
    'hút mỡ siết eo',
    'căng chỉ collagen',
    'truyền trắng da',
    'phẫu thuật thẩm mỹ'
  ];

  useEffect(() => {
    // Fetch system keywords
    fetch('/api/keywords')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDbKeywords(data);
      })
      .catch(() => {});

    // Initial search
    handleSearchAds('nâng mũi');
  }, []);

  const handleSearchAds = async (targetKeyword) => {
    const kw = targetKeyword || keyword;
    if (!kw || !kw.trim()) return;

    setIsScanning(true);
    try {
      const res = await fetch('/api/meta-ads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw, token: metaToken })
      });
      const data = await res.json();
      if (data.success) {
        setScanResults(data);
      } else {
        alert(data.error || 'Lỗi truy vấn Thư viện quảng cáo Meta');
      }
    } catch (err) {
      alert(`Lỗi kết nối tới máy chủ: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const categories = ['Tất cả', ...Array.from(new Set(dbKeywords.map((k) => k.category).filter(Boolean)))];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Official Meta Ad Library API & Public Archive</span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase">100% Không sợ khóa nick</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>Rà Soát Toàn Bộ Quảng Cáo Trả Phí Trên Meta Ad Library</span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Theo dõi và trích xuất trực tiếp toàn bộ các chiến dịch <strong>quảng cáo có trả phí (Sponsored Ads)</strong> của các phòng khám, thẩm mỹ viện đang đổ tiền tiếp cận người dân tại Việt Nam. Tự động kiểm tra đối soát quy định y tế và cổng Giấy phép hoạt động <strong>Medinet Sở Y Tế TP.HCM</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <a
              href="https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=VN&media_type=all"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold rounded-xl border border-slate-600 flex items-center space-x-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Meta Ad Library gốc</span>
            </a>
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="px-4 py-2 bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl border border-indigo-400/40 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showTokenInput ? 'Ẩn Token Meta' : 'Cấu hình Token API'}</span>
            </button>
          </div>
        </div>

        {/* Token config foldout */}
        {showTokenInput && (
          <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Meta Graph API Access Token (Tùy chọn - Dành cho tài khoản Meta Developer chính thức):
              </label>
              <input
                type="password"
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
                placeholder="Nhập User Access Token của Meta Developer (hoặc để trống để sử dụng Crawler Meta công khai)..."
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
              />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 italic">
                * Mặc định hệ thống tự động bóc tách dữ liệu công khai từ Thư viện Meta mà không bắt buộc phải có API Token.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Keyword Selection Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAds()}
                placeholder="Nhập từ khóa dịch vụ thẩm mỹ cần quét quảng cáo trả phí (ví dụ: nâng mũi, filler, cắt mí, hút mỡ...)"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-all"
              />
            </div>
            <button
              onClick={() => handleSearchAds()}
              disabled={isScanning}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang truy vấn Meta...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>QUÉT QUẢNG CÁO META</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick keywords & Category Picker */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-indigo-500" />
              <span>Gợi ý nhanh:</span>
            </span>
            {quickKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setKeyword(kw);
                  handleSearchAds(kw);
                }}
                className={`text-[10.5px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  keyword === kw
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Database Keywords Filter */}
          {dbKeywords.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-slate-500">Kho theo chuyên mục:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-semibold rounded-lg px-2.5 py-1 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Keywords Vault Pills if Category Selected */}
        {selectedCategory !== 'Tất cả' && (
          <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {dbKeywords
              .filter((k) => k.category === selectedCategory)
              .map((k) => (
                <button
                  key={k.id || k.term}
                  type="button"
                  onClick={() => {
                    setKeyword(k.term);
                    handleSearchAds(k.term);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-medium cursor-pointer transition-all ${
                    keyword === k.term
                      ? 'bg-indigo-700 text-white border-indigo-700'
                      : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {k.term}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Results Overview & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">
              Kết Quả Quảng Cáo Trả Phí Thu Thập Được
            </h2>
            {scanResults && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                {scanResults.count || 0} bài quảng cáo vi phạm
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            Dữ liệu tự động lưu vào <strong>Danh sách vi phạm chung</strong> và đối soát <strong>Medinet</strong>
          </span>
        </div>

        {/* Loading state */}
        {isScanning && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-xs">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Đang truy vấn Thư viện Quảng cáo Meta Ad Library...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hệ thống đang bóc tách nội dung các bài quảng cáo trả phí (Sponsored Ads) về "{keyword}", quét nhận diện vi phạm y tế và tra cứu giấy phép hoạt động.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isScanning && (!scanResults || !scanResults.items || scanResults.items.length === 0) && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Chưa có kết quả hoặc không tìm thấy bài quảng cáo vi phạm</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hãy thử chọn từ khóa khác như "nâng mũi cấu trúc", "tiêm filler", "hút mỡ" hoặc nhấn nút "Quét quảng cáo Meta" ở trên.
            </p>
          </div>
        )}

        {/* Items List */}
        {!isScanning && scanResults && scanResults.items && scanResults.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scanResults.items.map((item, idx) => {
              const medinet = item.medinetVerification;
              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200 shrink-0">
                          {item.author ? item.author.charAt(0) : 'M'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {item.author}
                          </h3>
                          <div className="flex items-center space-x-2 text-[10.5px] text-slate-500">
                            <span className="font-semibold text-indigo-600">
                              {item.platform || 'Facebook (Meta Ad Library)'}
                            </span>
                            <span>•</span>
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold text-[9.5px]">
                              Quảng cáo trả phí (Sponsored)
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        item.severity === 'Nghiêm trọng'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.severity || 'Cao'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans max-h-28 overflow-y-auto">
                      {item.content}
                    </div>

                    {/* Medinet verification tag */}
                    {medinet && (
                      <div className={`p-2.5 rounded-xl border text-[11px] flex items-start space-x-2 ${
                        medinet.found
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        <Building2 className={`w-4 h-4 shrink-0 mt-0.5 ${medinet.found ? 'text-emerald-600' : 'text-rose-600'}`} />
                        <div className="space-y-0.5 flex-1">
                          <div className="font-bold">
                            {medinet.found
                              ? `Đã tìm thấy ${medinet.count} GPHĐ trên Medinet Sở Y Tế`
                              : 'Cảnh báo: Không tìm thấy GPHĐ trên Medinet Sở Y Tế (Dấu hiệu không phép)'}
                          </div>
                          <div className="text-[10px] opacity-90 line-clamp-2">
                            {medinet.summary}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Violation reasons */}
                    {item.violationDetails && item.violationDetails.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                          Căn cứ vi phạm xác định:
                        </span>
                        <ul className="space-y-0.5">
                          {item.violationDetails.slice(0, 2).map((detail, dIdx) => (
                            <li key={dIdx} className="text-[11px] text-red-600 flex items-start space-x-1.5">
                              <span className="font-bold">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10.5px] text-slate-400">
                      {item.timestamp || 'Vừa phát hiện'}
                    </span>
                    <div className="flex items-center space-x-2">
                      {item.postUrl && (
                        <a
                          href={item.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem quảng cáo</span>
                        </a>
                      )}
                      <button
                        onClick={() => onOpenViolationModal && onOpenViolationModal(item)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Hồ sơ vi phạm
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
