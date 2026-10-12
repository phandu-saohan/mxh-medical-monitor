import React, { useState, useEffect } from 'react';
import {
  Video,
  Flame,
  Search,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Heart,
  MessageCircle,
  FileText,
  Sparkles,
  RefreshCw,
  Hash,
  Play,
  UserCheck,
  KeyRound,
  ShieldCheck,
  Unlink,
  LogIn,
  Info
} from 'lucide-react';

export default function TikTokMonitorView({ onOpenViolationModal }) {
  const [hashtags, setHashtags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('reviewthammy');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [singleAnalysis, setSingleAnalysis] = useState(null);

  // TikTok Account Connection State
  const [sessionStatus, setSessionStatus] = useState({ connected: false, cookiesCount: 0, username: null });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [cookieInput, setCookieInput] = useState('');
  const [isSavingCookies, setIsSavingCookies] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState(null);

  useEffect(() => {
    fetchSessionStatus();
    fetchHashtags();
    handleScanTag('reviewthammy');
  }, []);

  const fetchSessionStatus = async () => {
    try {
      const res = await fetch('/api/tiktok/session-status');
      const data = await res.json();
      setSessionStatus(data);
    } catch (e) {
      console.error('Lỗi kiểm tra session TikTok:', e);
    }
  };

  const handleSaveCookies = async (e) => {
    e?.preventDefault();
    if (!cookieInput.trim()) return;
    setIsSavingCookies(true);
    setConnectionMessage(null);
    try {
      const res = await fetch('/api/tiktok/save-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setConnectionMessage({ type: 'success', text: data.message });
        setCookieInput('');
        fetchSessionStatus();
      } else {
        setConnectionMessage({ type: 'error', text: data.error || 'Lỗi lưu cookie.' });
      }
    } catch (err) {
      setConnectionMessage({ type: 'error', text: err.message });
    } finally {
      setIsSavingCookies(false);
    }
  };

  const handleDisconnectSession = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn ngắt kết nối tài khoản TikTok này?')) return;
    try {
      const res = await fetch('/api/tiktok/disconnect-session', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setConnectionMessage({ type: 'success', text: 'Đã ngắt kết nối tài khoản TikTok thành công!' });
        fetchSessionStatus();
      }
    } catch (err) {
      alert('Lỗi ngắt kết nối: ' + err.message);
    }
  };

  const fetchHashtags = async () => {
    try {
      const res = await fetch('/api/tiktok/hashtags');
      const data = await res.json();
      setHashtags(data);
    } catch (e) {
      console.error('Lỗi tải hashtags TikTok:', e);
    }
  };

  const handleScanTag = async (tag) => {
    setSelectedTag(tag);
    setIsScanning(true);
    setSingleAnalysis(null);
    try {
      const res = await fetch('/api/tiktok/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashtag: tag, maxVideos: 10 })
      });
      const data = await res.json();
      setScanResults(data);
    } catch (e) {
      alert('Lỗi rà soát TikTok: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSearchKeyword = async (e) => {
    e?.preventDefault();
    if (!searchKeyword.trim()) return;
    setIsScanning(true);
    setSingleAnalysis(null);
    try {
      const res = await fetch('/api/tiktok/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword.trim(), maxVideos: 10 })
      });
      const data = await res.json();
      setScanResults(data);
    } catch (e) {
      alert('Lỗi tìm kiếm TikTok: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleInspectUrl = async (e) => {
    e?.preventDefault();
    if (!customUrl.trim()) return;
    setIsAnalyzingUrl(true);
    try {
      const res = await fetch('/api/tiktok/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSingleAnalysis(data);
      } else {
        alert(data.error || 'Không thể phân tích URL TikTok này.');
      }
    } catch (e) {
      alert('Lỗi kiểm tra URL: ' + e.message);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const violations = scanResults?.violations || [];
  const allScanned = scanResults?.allScanned || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Video className="w-6 h-6 text-rose-600" />
            <span>Giám Sát TikTok &amp; Video Ngắn KOLs/Reviewer (Hướng C)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tự động giám sát trào lưu review thẩm mỹ viện, tiêm chích trái phép của các TikToker/KOLs theo <strong>Điều 15a Luật Quảng cáo (sửa đổi 2026)</strong> và <strong>Nghị định 147/2024/NĐ-CP</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {sessionStatus.connected ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-emerald-800">
                TikTok: Đã kết nối ({sessionStatus.cookiesCount} cookies)
              </span>
              <button
                type="button"
                onClick={handleDisconnectSession}
                className="text-[10px] text-red-600 hover:text-red-800 font-bold ml-1 hover:underline cursor-pointer"
                title="Hủy kết nối"
              >
                Ngắt
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kết Nối Tài Khoản TikTok</span>
            </button>
          )}

          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-4 h-4 text-rose-500 mr-1.5 animate-pulse" />
            <span>TikTok Live Radar</span>
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{scanResults?.totalScanned || 0}</div>
            <div className="text-xs font-semibold text-slate-500">Video TikTok đã rà soát</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-red-600">{violations.length}</div>
            <div className="text-xs font-semibold text-slate-500">Video vi phạm quy định y tế</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-600">
              {violations.filter(v => v.authorType === 'KOL/Reviewer').length}
            </div>
            <div className="text-xs font-semibold text-slate-500">KOLs/KOCs liên đới vi phạm</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">
              {((violations.length * 35000000) / 1000000).toLocaleString('vi-VN')} tr
            </div>
            <div className="text-xs font-semibold text-slate-500">Ước tính xử phạt (NĐ 117 &amp; NĐ 38)</div>
          </div>
        </div>
      </div>

      {/* Hashtag Quick Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Hash className="w-4 h-4 text-rose-500" />
            <span>Hashtags Thẩm Mỹ Nóng Trên TikTok (Bấm để quét ngay):</span>
          </span>
          <span className="text-[11px] text-slate-400">Tự động gắn cờ tài khoản booking/quảng cáo</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hashtags.map((h) => {
            const isSelected = selectedTag === h.tag;
            return (
              <button
                key={h.tag}
                onClick={() => handleScanTag(h.tag)}
                disabled={isScanning}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={h.description}
              >
                <span>{h.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & URL Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Box 1: Custom Keyword Search */}
        <form onSubmit={handleSearchKeyword} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Tìm kiếm từ khóa TikTok theo yêu cầu:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="VD: tiêm môi baby, hút mỡ bụng, bác sĩ thẩm mỹ..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang quét...</span>
                </>
              ) : (
                <span>Quét TikTok</span>
              )}
            </button>
          </div>
        </form>

        {/* Box 2: Direct Single Video URL Inspector */}
        <form onSubmit={handleInspectUrl} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Thẩm định tức thì 1 link video TikTok cụ thể:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Dán đường dẫn: https://www.tiktok.com/@user/video/..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="submit"
              disabled={isAnalyzingUrl}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              {isAnalyzingUrl ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang thẩm định...</span>
                </>
              ) : (
                <span>Thẩm Định Link</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Single URL Analysis Result Card */}
      {singleAnalysis && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="font-bold text-sm text-cyan-300">Kết Quả Thẩm Định Link TikTok Trực Tiếp</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              singleAnalysis.analysis?.isViolation ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {singleAnalysis.analysis?.isViolation ? 'PHÁT HIỆN VI PHẠM Y TẾ' : 'HỢP LỆ'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400">Chủ tài khoản:</div>
              <div className="font-bold text-white text-sm">{singleAnalysis.author}</div>
              <a href={singleAnalysis.url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline flex items-center space-x-1 pt-1">
                <span>Mở video gốc trên TikTok</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="text-slate-400">Nội dung trích xuất:</div>
              <div className="bg-black/40 p-3 rounded-xl border border-slate-700 text-slate-200 leading-relaxed font-sans">
                {singleAnalysis.content}
              </div>

              {singleAnalysis.analysis?.violationDetails?.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="text-rose-400 font-bold">Các điểm vi phạm pháp luật:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    {singleAnalysis.analysis.violationDetails.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main TikTok Video Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span>Danh Sách Video TikTok Đang Theo Dõi ({allScanned.length})</span>
            {violations.length > 0 && (
              <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {violations.length} vi phạm
              </span>
            )}
          </h2>
          <span className="text-xs text-slate-400">Tự động phân loại theo mức độ rủi ro</span>
        </div>

        {isScanning ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Đang kết nối Playwright và quét video ngắn TikTok...
          </div>
        ) : allScanned.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Chưa có video TikTok nào. Vui lòng bấm vào một hashtag bên trên để rà soát.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {allScanned.map((v, idx) => {
              const matchedVio = violations.find(vio => vio.postUrl === v.postUrl || vio.authorHandle === v.authorHandle);
              const isVio = Boolean(matchedVio);

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                    isVio ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/90'
                  }`}
                >
                  {/* Video Thumbnail Box */}
                  <div className="relative h-56 bg-slate-900 group overflow-hidden">
                    <img
                      src={v.mediaUrl || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&h=800&q=80'}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />

                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Video className="w-3 h-3 text-rose-400" />
                        <span>TikTok</span>
                      </span>

                      {v.isKOL && (
                        <span className="bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          ⭐ KOL / Reviewer
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isVio ? 'bg-red-600 text-white shadow-sm' : 'bg-emerald-600 text-white'
                      }`}>
                        {isVio ? 'VI PHẠM Y TẾ' : 'HỢP LỆ'}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {v.videoDuration || '00:45'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{v.author}</h4>
                          <span className="text-[11px] text-blue-600 font-medium">{v.authorHandle}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{v.followers || 'Creator'}</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                        {v.content}
                      </p>

                      {isVio && matchedVio && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-[11px]">
                          <div className="font-bold text-rose-800 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Hành vi: {matchedVio.category}</span>
                          </div>
                          <p className="text-rose-700 text-[10px]">
                            Trách nhiệm liên đới theo Điều 15a Luật Quảng cáo (sửa đổi 2026).
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          <span>{v.engagement?.likes?.toLocaleString('vi-VN') || '1.2K'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{v.engagement?.comments?.toLocaleString('vi-VN') || '320'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{v.engagement?.shares?.toLocaleString('vi-VN') || '85'}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <a
                          href={v.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1"
                        >
                          <span>Xem TikTok</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {isVio && matchedVio && (
                          <button
                            onClick={() => {
                              window.open(`/api/violations/${matchedVio.id}/sanction-record`, '_blank');
                            }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Biên Bản VPHC (NĐ 118)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL KẾT NỐI TÀI KHOẢN TIKTOK */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-base">
                <KeyRound className="w-5 h-5" />
                <span>Kết Nối Tài Khoản Giám Sát TikTok</span>
              </div>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectionMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Tại sao cần kết nối tài khoản TikTok?</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-700">
                  TikTok thường yêu cầu đăng nhập khi tìm kiếm nhiều video hoặc truy vấn sâu theo hashtag thẩm mỹ. Nạp cookie phiên tài khoản giúp hệ thống <strong>bỏ qua Captcha, rà soát 24/7 ổn định</strong> và đọc trọn vẹn bình luận, tương tác của các KOLs/Reviewer.
                </p>
              </div>

              {connectionMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  connectionMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {connectionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{connectionMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveCookies} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dán Cookie Phiên TikTok (sessionid, sid_guard... hoặc JSON export):
                  </label>
                  <textarea
                    rows={4}
                    value={cookieInput}
                    onChange={(e) => setCookieInput(e.target.value)}
                    placeholder="sessionid=abc123...; msToken=xyz...&#10;(Hoặc dán toàn bộ mảng JSON cookies từ extension Cookie-Editor)"
                    className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                  <div className="flex items-center justify-between mt-1 text-[10.5px] text-slate-400">
                    <span>Cách lấy: Mở tiktok.com &gt; F12 &gt; Application &gt; Cookies</span>
                    <a
                      href="https://www.tiktok.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Mở TikTok.com ↗
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConnectModal(false);
                      setConnectionMessage(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCookies || !cookieInput.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCookies ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Lưu &amp; Kích Hoạt Phiên TikTok</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
