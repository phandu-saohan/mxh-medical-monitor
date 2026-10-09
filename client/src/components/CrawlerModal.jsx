import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Globe,
  KeyRound,
  Search,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Sparkles,
  CalendarClock,
  Clock,
  Cpu
} from 'lucide-react';

export default function CrawlerModal({ isOpen, onClose, onRefreshViolations }) {
  const [activeTab, setActiveTab] = useState('crawler'); // 'crawler' | 'meta-ads' | 'scheduler'
  const [keyword, setKeyword] = useState('nâng mũi cấu trúc');
  const [maxPosts, setMaxPosts] = useState(15);
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);
  const [isRunningScan, setIsRunningScan] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [currentStep, setCurrentStep] = useState('IDLE');
  const [progress, setProgress] = useState(0);

  // Meta Ad Library state
  const [metaToken, setMetaToken] = useState('');
  const [isScanningMeta, setIsScanningMeta] = useState(false);

  // Scheduler state
  const [schedulerConfig, setSchedulerConfig] = useState(null);
  const [isSavingScheduler, setIsSavingScheduler] = useState(false);

  // Cookie input state
  const [showCookieInput, setShowCookieInput] = useState(false);
  const [cookieInput, setCookieInput] = useState('');
  const [isSavingCookies, setIsSavingCookies] = useState(false);

  const quickKeywords = [
    'nâng mũi cấu trúc',
    'tiêm filler giá sinh viên',
    'tiêm botox gọn hàm',
    'cắt mí vĩnh viễn',
    'hút mỡ bụng tại spa',
    'cam kết 100% không đau',
    'bác sĩ phẫu thuật 20 năm',
    'truyền trắng phi thuyền'
  ];

  // Fetch status, scheduler config & listen to SSE
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/crawler/status')
      .then((res) => res.json())
      .then((data) => {
        setSessionStatus(data);
        if (data.isRunning) {
          setIsRunningScan(true);
          setProgress(data.progress || 10);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/scheduler')
      .then((res) => res.json())
      .then((data) => setSchedulerConfig(data))
      .catch(() => {});

    const evtSource = new EventSource('/api/crawler/events');

    evtSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'LOG') {
          setLogs((prev) => [...prev, payload.entry].slice(-100));
          if (payload.status) {
            setProgress(payload.status.progress);
            setCurrentStep(payload.status.step);
            setIsRunningScan(payload.status.isRunning);
          }
        } else if (payload.type === 'STATUS') {
          setSessionStatus(payload.status);
          setProgress(payload.status.progress);
          setCurrentStep(payload.status.step);
          setIsRunningScan(payload.status.isRunning);
        } else if (payload.type === 'NEW_VIOLATIONS') {
          setFoundItems((prev) => [...payload.items, ...prev]);
          if (onRefreshViolations) onRefreshViolations();
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      evtSource.close();
    };
  }, [isOpen, onRefreshViolations]);

  if (!isOpen) return null;

  // B1: Save Facebook Cookies
  const handleSaveCookies = async () => {
    if (!cookieInput.trim()) {
      alert('Vui lòng nhập chuỗi Cookie Facebook.');
      return;
    }
    setIsSavingCookies(true);
    try {
      const res = await fetch('/api/crawler/save-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message || 'Đã lưu thành công phiên đăng nhập Facebook!');
      setShowCookieInput(false);
      setCookieInput('');
      fetch('/api/crawler/status').then((r) => r.json()).then(setSessionStatus);
    } catch (e) {
      alert(`Lỗi lưu cookie: ${e.message}`);
    } finally {
      setIsSavingCookies(false);
    }
  };

  // B1: Open Browser for Login
  const handleOpenBrowser = async () => {
    setIsOpeningBrowser(true);
    try {
      const res = await fetch('/api/crawler/open-login', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Đã mở trình duyệt! Cán bộ vui lòng đăng nhập vào Facebook và giải quyết 2FA (nếu có). Sau khi xong, hãy đóng cửa sổ trình duyệt.');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsOpeningBrowser(false);
    }
  };

  // B2 - B4: Run Scrape & Inspect
  const handleStartScan = async () => {
    setIsRunningScan(true);
    setProgress(5);
    setFoundItems([]);
    try {
      const res = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, maxPosts })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      setIsRunningScan(false);
    }
  };

  // Giai đoạn 1: Quét Meta Ad Library
  const handleSearchMetaAds = async () => {
    setIsScanningMeta(true);
    try {
      const res = await fetch('/api/meta-ads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, token: metaToken })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã phát hiện ${data.count} bài viết quảng cáo được tài trợ vi phạm quy định y tế!`);
        if (onRefreshViolations) onRefreshViolations();
      }
    } catch (e) {
      alert(`Lỗi quét Meta Ad Library: ${e.message}`);
    } finally {
      setIsScanningMeta(false);
    }
  };

  // Giai đoạn 1: Lưu cấu hình Scheduler
  const handleSaveScheduler = async (updates) => {
    setIsSavingScheduler(true);
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...schedulerConfig, ...updates })
      });
      const data = await res.json();
      setSchedulerConfig(data);
    } catch (e) {
      alert(`Lỗi lưu lịch: ${e.message}`);
    } finally {
      setIsSavingScheduler(false);
    }
  };

  const handleRunSchedulerNow = async () => {
    try {
      await fetch('/api/scheduler/run-now', { method: 'POST' });
      alert('Đã kích hoạt phiên rà soát nền tự động. Kết quả sẽ được cập nhật vào danh sách.');
      if (onRefreshViolations) onRefreshViolations();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Bộ Rà Soát Tự Động &amp; Thư Viện Quảng Cáo Y Tế (Facebook)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tích hợp Giai đoạn 1 (Meta Ad Library &amp; Scheduler) &amp; Giai đoạn 2 (Bằng chứng số SHA-256)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-800 px-6 py-2 flex items-center space-x-2 border-b border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('crawler')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'crawler'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Rà Soát Trực Tiếp (B1 - B4)</span>
          </button>

          <button
            onClick={() => setActiveTab('meta-ads')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'meta-ads'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Thư Viện Quảng Cáo Meta (GĐ 1)</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'scheduler'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Lập Lịch Quét Định Kỳ (GĐ 1)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: B1 - B4 CRAWLER */}
          {activeTab === 'crawler' && (
            <>
              {/* Progress Bar */}
              {isRunningScan && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between font-bold text-blue-900">
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Tiến trình rà soát trực tiếp: {currentStep}</span>
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Grid of Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bước 1 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                        <span>B1: Phiên Đăng Nhập Facebook</span>
                      </span>
                      {sessionStatus?.hasSavedSession ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã lưu phiên</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          Chưa lưu session
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px] mb-3">
                      Lưu cookies hoặc phiên FB một lần duy nhất để phục vụ rà soát tự động không gián đoạn.
                    </p>

                    {showCookieInput && (
                      <div className="mb-3 p-3 bg-white border border-blue-200 rounded-lg space-y-2">
                        <div className="text-[11px] font-bold text-slate-700">Dán Cookie Facebook (c_user &amp; xs):</div>
                        <textarea
                          rows={3}
                          value={cookieInput}
                          onChange={(e) => setCookieInput(e.target.value)}
                          placeholder="c_user=1000...; xs=2%3A... (hoặc toàn bộ chuỗi cookie từ F12)"
                          className="w-full p-2 text-[11px] border border-slate-300 rounded-md font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">F12 &gt; Application &gt; Cookies</span>
                          <button
                            type="button"
                            onClick={handleSaveCookies}
                            disabled={isSavingCookies}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-md shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isSavingCookies ? 'Đang lưu...' : 'Lưu Phiên Cookie'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setShowCookieInput(!showCookieInput)}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{showCookieInput ? 'Đóng Ô Nhập Cookie' : 'Nhập Cookie Facebook (Khuyên dùng)'}</span>
                    </button>

                    <button
                      onClick={handleOpenBrowser}
                      disabled={isOpeningBrowser || isRunningScan}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isOpeningBrowser ? 'Đang mở trình duyệt...' : 'Mở Trình Duyệt Đồ Họa (Chỉ máy có màn hình)'}</span>
                    </button>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 mb-2 font-bold text-sm text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                      <span>B2: Tự động điền từ khóa rà soát</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mb-2">
                      Tự động điền vào thanh tìm kiếm của Facebook, bóc tách các bài viết của Trang, Nhóm, Reels và Video.
                    </p>
                    <div className="space-y-1.5">
                      <label htmlFor="crawler-keyword-input" className="sr-only">Từ khóa y tế rà soát</label>
                      <input
                        id="crawler-keyword-input"
                        name="keyword"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Nhập từ khóa y tế..."
                        aria-label="Nhập từ khóa y tế"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {quickKeywords.slice(0, 4).map((kw, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setKeyword(kw)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              keyword === kw
                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <label htmlFor="crawler-max-posts-select">Số bài tối đa:</label>
                    <select
                      id="crawler-max-posts-select"
                      name="maxPosts"
                      value={maxPosts}
                      onChange={(e) => setMaxPosts(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-md px-2 py-1 font-semibold"
                    >
                      <option value={10}>10 bài</option>
                      <option value={20}>20 bài</option>
                      <option value={50}>50 bài</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bước 3 & Bước 4 */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center space-x-2 font-bold text-sm text-cyan-300">
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[11px] font-black">3+4</span>
                    <span>B3 &amp; B4: Đọc đa phương tiện &amp; Lập danh sách vi phạm</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Playwright tự động cuộn trang, đọc văn bản, ảnh, video, sau đó engine pháp luật đối chiếu với <strong>Luật Khám bệnh chữa bệnh 15/2023</strong> và <strong>Nghị định 117/2020</strong> để lập danh mục vi phạm cho giám sát viên.
                  </p>
                </div>

                <button
                  onClick={handleStartScan}
                  disabled={isRunningScan}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-slate-950 font-black rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isRunningScan ? 'Đang rà soát...' : 'KÍCH HOẠT RÀ SOÁT NGAY'}</span>
                </button>
              </div>

              {/* Terminal Logs View */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[11px] text-slate-300 h-36 overflow-y-auto space-y-1">
                <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800 mb-2">
                  <span className="flex items-center space-x-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Nhật ký rà soát thời gian thực (Live Crawler Terminal)</span>
                  </span>
                  <span className="text-[10px]">Cổng giám sát Y tế</span>
                </div>

                {logs.length === 0 ? (
                  <div className="text-slate-600 italic">
                    Chưa có phiên rà soát mới. Nhấn "Kích hoạt rà soát ngay" để bắt đầu quy trình.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-2">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span
                        className={
                          log.type === 'error'
                            ? 'text-red-400 font-bold'
                            : log.type === 'warning'
                            ? 'text-amber-400 font-semibold'
                            : log.type === 'success'
                            ? 'text-emerald-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        {log.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* TAB 2: META AD LIBRARY (GIAI ĐOẠN 1) */}
          {activeTab === 'meta-ads' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-900 space-y-2">
                <h4 className="font-bold text-sm flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Thư Viện Quảng Cáo Meta (Official Meta Ad Library API)</span>
                </h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Toàn bộ các chiến dịch quảng cáo trả phí (Sponsored Ads) của các thẩm mỹ viện tại Việt Nam được lưu trữ công khai trên Thư viện quảng cáo Meta. Sử dụng kênh này giúp <strong>100% không bao giờ bị khóa tài khoản</strong> và tiếp cận chính xác các quảng cáo đang đổ tiền tiếp cận người dân.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <label htmlFor="meta-keyword-input" className="font-bold text-slate-700 block mb-1">
                    Từ khóa tìm kiếm quảng cáo trả phí:
                  </label>
                  <input
                    id="meta-keyword-input"
                    name="metaKeyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                    placeholder="ví dụ: nâng mũi, tiêm filler, hút mỡ..."
                  />
                </div>

                <div>
                  <label htmlFor="meta-token-input" className="font-bold text-slate-700 block mb-1">
                    Meta Graph API Access Token (Tùy chọn nếu có mã chính thức):
                  </label>
                  <input
                    id="meta-token-input"
                    name="metaToken"
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    placeholder="Nhập User Access Token hoặc để trống để sử dụng kênh kết nối chuẩn..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <button
                  onClick={handleSearchMetaAds}
                  disabled={isScanningMeta}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{isScanningMeta ? 'Đang truy vấn Meta Ad Library...' : 'QUÉT BÀI QUẢNG CÁO META NGAY'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULER (GIAI ĐOẠN 1) */}
          {activeTab === 'scheduler' && schedulerConfig && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm flex items-center space-x-2">
                    <CalendarClock className="w-4 h-4 text-emerald-600" />
                    <span>Lập Lịch Rà Soát Tự Động Định Kỳ (Background Scheduler)</span>
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Hệ thống tự động chạy nền định kỳ hàng ngày, phát hiện vi phạm và gửi cảnh báo mà không cần giám sát viên phải mở app liên tục.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs">Trạng thái:</span>
                  <button
                    onClick={() => handleSaveScheduler({ enabled: !schedulerConfig.enabled })}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      schedulerConfig.enabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {schedulerConfig.enabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-800 text-sm">Cài đặt chu kỳ quét</div>
                  <div>
                    <label htmlFor="scheduler-interval-select" className="text-slate-500 block mb-1">Chu kỳ rà soát:</label>
                    <select
                      id="scheduler-interval-select"
                      name="intervalHours"
                      value={schedulerConfig.intervalHours}
                      onChange={(e) => handleSaveScheduler({ intervalHours: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                    >
                      <option value={2}>Mỗi 2 giờ một lần</option>
                      <option value={4}>Mỗi 4 giờ một lần</option>
                      <option value={6}>Mỗi 6 giờ một lần (Khuyến nghị)</option>
                      <option value={12}>Mỗi 12 giờ một lần</option>
                      <option value={24}>Mỗi ngày một lần (24 giờ)</option>
                    </select>
                  </div>

                  <div className="pt-2 text-slate-600 space-y-1">
                    <div>Lần quét gần nhất: <strong>{schedulerConfig.lastRun}</strong></div>
                    <div>Lần quét dự kiến tiếp theo: <strong>{schedulerConfig.nextRun}</strong></div>
                  </div>

                  <button
                    onClick={handleRunSchedulerNow}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Chạy Thử Phiên Quét Nền Ngay Lập Tức
                  </button>
                </div>

                {/* Scheduler History */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 text-sm">Nhật ký các đợt quét tự động</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {schedulerConfig.history?.map((h, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-[11px]">
                        <div>
                          <div className="font-bold text-slate-800">Từ khóa: "{h.keyword}"</div>
                          <div className="text-slate-400">{h.time}</div>
                        </div>
                        <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md">
                          +{h.violationsFound} vi phạm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-slate-500 text-xs">
            Hồ sơ phiên lưu trữ tại: <code className="bg-slate-200 px-1.5 py-0.5 rounded-sm text-slate-700">c:\MXH\fb_session_data</code>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Đóng &amp; Xem danh sách
          </button>
        </div>
      </div>
    </div>
  );
}
