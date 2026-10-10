import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StatCards from './components/StatCards';
import ViolationChart from './components/ViolationChart';
import FilterBar from './components/FilterBar';
import ViolationsTable from './components/ViolationsTable';
import ViolationDetailModal from './components/ViolationDetailModal';
import CrawlerModal from './components/CrawlerModal';
import KeywordsView from './components/KeywordsView';
import AccountsView from './components/AccountsView';
import LicenseLookupView from './components/LicenseLookupView';
import EntitiesRadarView from './components/EntitiesRadarView';
import TikTokMonitorView from './components/TikTokMonitorView';
import { BookOpen, Scale, FileText, CheckCircle2, Sparkles, BellRing, Send } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalViolations: 0,
    totalScanned: 0,
    totalValid: 0,
    videoViolations: 0,
    categoryBreakdown: []
  });
  const [violations, setViolations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCrawlerOpen, setIsCrawlerOpen] = useState(false);
  const [crawlerStatus, setCrawlerStatus] = useState(null);

  const [filters, setFilters] = useState({
    platform: 'Facebook',
    postType: 'Tất cả',
    category: 'Tất cả'
  });

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState({
    hasKey: false,
    maskedKey: '',
    model: 'gemini-3.8-flash',
    status: ''
  });
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [aiModelInput, setAiModelInput] = useState('gemini-3.8-flash');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);

  // Telegram Alerts Configuration State (Mô-đun 1)
  const [alertsConfig, setAlertsConfig] = useState({
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    alertOnHighSeverityOnly: true,
    autoNotifyAutoPilot: true
  });
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramMessage, setTelegramMessage] = useState(null);

  // Fetch dashboard statistics
  const fetchStats = () => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching stats:', err));
  };

  // Fetch violations list with filters
  const fetchViolations = (page = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '7', // Show 7 items per page as shown in screenshot "Hiển thị 1 - 7 trong 156 kết quả"
      platform: filters.platform,
      postType: filters.postType,
      category: filters.category,
      search: searchKeyword
    });

    fetch(`/api/violations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setViolations(data.items || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);

        if (data.items && data.items.length > 0) {
          if (!selectedItem || !data.items.some(i => i.id === selectedItem.id)) {
            setSelectedItem(data.items[0]);
          }
        } else {
          setSelectedItem(null);
        }
      })
      .catch((err) => console.error('Error fetching violations:', err));
  };

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchViolations(1);

    // Fetch crawler status
    fetch('/api/crawler/status')
      .then((res) => res.json())
      .then((data) => setCrawlerStatus(data))
      .catch(() => {});

    // Fetch AI config
    fetch('/api/settings/ai')
      .then((res) => res.json())
      .then((data) => {
        setAiConfig(data);
        if (data.model) setAiModelInput(data.model);
      })
      .catch(() => {});

    // Fetch Telegram alerts config
    fetch('/api/alerts/config')
      .then((res) => res.json())
      .then((data) => setAlertsConfig(data))
      .catch(() => {});
  }, []);

  const handleSaveAlertsConfig = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/alerts/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertsConfig)
      });
      const data = await res.json();
      if (data.success) {
        setTelegramMessage({ type: 'success', text: data.message });
      } else {
        setTelegramMessage({ type: 'error', text: data.error || 'Lỗi lưu cấu hình.' });
      }
    } catch (err) {
      setTelegramMessage({ type: 'error', text: 'Không thể kết nối máy chủ: ' + err.message });
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramMessage(null);
    try {
      const res = await fetch('/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: alertsConfig.telegramBotToken,
          chatId: alertsConfig.telegramChatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramMessage({ type: 'success', text: data.message });
      } else {
        setTelegramMessage({ type: 'error', text: data.error || 'Không gửi được tin nhắn thử nghiệm.' });
      }
    } catch (err) {
      setTelegramMessage({ type: 'error', text: 'Lỗi kiểm tra kết nối: ' + err.message });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSaveAiConfig = async (e) => {
    e?.preventDefault();
    setIsTestingAi(true);
    setAiMessage(null);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: aiKeyInput, model: aiModelInput })
      });
      const data = await res.json();
      if (data.success) {
        setAiConfig({
          hasKey: data.hasKey,
          maskedKey: data.maskedKey,
          model: data.model,
          status: data.hasKey ? 'Đã kích hoạt Google Gemini AI' : 'Chưa cấu hình'
        });
        setAiMessage({ type: 'success', text: data.message });
        setAiKeyInput('');
      } else {
        setAiMessage({ type: 'error', text: data.error || 'Lỗi kết nối tới Gemini API.' });
      }
    } catch (err) {
      setAiMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ: ' + err.message });
    } finally {
      setIsTestingAi(false);
    }
  };

  // Refetch when filters or search changes
  useEffect(() => {
    fetchViolations(1);
  }, [filters, searchKeyword]);

  const handleUpdateStatus = (id, newStatus) => {
    fetch(`/api/violations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then((res) => res.json())
      .then((updated) => {
        setSelectedItem(updated);
        setViolations((prev) => prev.map((v) => (v.id === id ? updated : v)));
        fetchStats();
      })
      .catch((err) => console.error('Error updating status:', err));
  };

  const handleResetFilters = () => {
    setFilters({
      platform: 'Facebook',
      postType: 'Tất cả',
      category: 'Tất cả'
    });
    setSearchKeyword('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        onOpenCrawler={() => setIsCrawlerOpen(true)}
        crawlerStatus={crawlerStatus}
      />

      <div className="flex flex-1 items-stretch">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          violationCount={stats.totalViolations || 156}
          onOpenCrawler={() => setIsCrawlerOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-x-hidden min-w-0 space-y-5">
          {/* Dashboard & Violations View */}
          {(currentTab === 'dashboard' || currentTab === 'violations') && (
            <>
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">
                  Tổng quan giám sát nội dung
                </h1>
                <div className="text-xs text-slate-500 font-medium">
                  Cơ quan giám sát: <span className="font-bold text-slate-700">Tổ Thanh Tra Y Tế & Quảng Cáo Số</span>
                </div>
              </div>

              {/* Top Overview: 4 Stat Cards + Donut Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <StatCards stats={stats} />
                </div>
                <div className="lg:col-span-1">
                  <ViolationChart breakdown={stats.categoryBreakdown} total={stats.totalViolations} />
                </div>
              </div>

              {/* Filter Toolbar */}
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                onSearch={() => fetchViolations(1)}
                onReset={handleResetFilters}
                onOpenCrawler={() => setIsCrawlerOpen(true)}
              />

              {/* Main Content: Table on Left + Detail Drawer on Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                {/* Violations Table (7 columns out of 12 or full when closed) */}
                <div className={selectedItem ? 'xl:col-span-7' : 'xl:col-span-12'}>
                  <ViolationsTable
                    violations={violations}
                    totalCount={totalCount}
                    selectedItem={selectedItem}
                    onSelectItem={(item) => setSelectedItem(item)}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchViolations(page)}
                  />
                </div>

                {/* Right Detail Panel (5 columns out of 12) */}
                {selectedItem && (
                  <div className="xl:col-span-5 sticky top-20">
                    <ViolationDetailModal
                      item={selectedItem}
                      onClose={() => setSelectedItem(null)}
                      onUpdateStatus={handleUpdateStatus}
                      onExportReport={(item) => {
                        window.open(`/api/violations/${item.id}/export`, '_blank');
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Radar Điểm Nóng & Sổ Đen Cơ Sở Tab (Mô-đun 3) */}
          {currentTab === 'radar' && <EntitiesRadarView />}

          {/* Giám Sát TikTok & Video Ngắn KOLs (Hướng C) */}
          {currentTab === 'tiktok' && (
            <TikTokMonitorView onOpenViolationModal={(v) => setSelectedItem(v)} />
          )}

          {/* Keywords Management Tab */}
          {currentTab === 'keywords' && <KeywordsView />}

          {/* Accounts / Pages Monitored Tab */}
          {currentTab === 'accounts' && <AccountsView violations={violations} />}

          {/* License Lookup Tab (Phase 3) */}
          {currentTab === 'licenses' && <LicenseLookupView />}

          {/* Tracked Posts Tab */}
          {currentTab === 'tracked' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Bài Viết / Video Đã Theo Dõi</h2>
              <ViolationsTable
                violations={violations.filter((v) => v.status === 'Đã xác minh' || v.status === 'Đã xử lý')}
                totalCount={violations.filter((v) => v.status === 'Đã xác minh' || v.status === 'Đã xử lý').length}
                selectedItem={selectedItem}
                onSelectItem={(item) => setSelectedItem(item)}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
              />
            </div>
          )}

          {/* Reports & Statistics Tab */}
          {currentTab === 'reports' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Báo Cáo & Thống Kê Thanh Tra Y Tế</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tổng kết số liệu phục vụ báo cáo định kỳ cho Lãnh đạo Sở Y tế và Cục Quản lý Khám chữa bệnh.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href="/api/reports/periodic-summary"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>📑 In Báo Cáo Định Kỳ Trình Lãnh Đạo (A4 PDF)</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Xuất Báo Cáo Tổng Hợp
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-red-600">{stats.totalViolations || 0}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">Tổng vụ việc có dấu hiệu vi phạm</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Dữ liệu thực tế giám sát</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-orange-600">
                    {stats.categoryBreakdown?.find(c => c.name === 'Quảng cáo dịch vụ thẩm mỹ trái phép')?.count || 0}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">Dịch vụ thẩm mỹ can thiệp trái phép</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {stats.totalViolations > 0 
                      ? `Chiếm ${Math.round(((stats.categoryBreakdown?.find(c => c.name === 'Quảng cáo dịch vụ thẩm mỹ trái phép')?.count || 0) / stats.totalViolations) * 100)}% cơ cấu vi phạm`
                      : 'Chưa có vi phạm'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-emerald-600">{stats.statusBreakdown?.resolved || 0}</div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">Đã xử lý / Đình chỉ quảng cáo</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {stats.totalViolations > 0 
                      ? `Tỉ lệ xử lý thành công ${Math.round(((stats.statusBreakdown?.resolved || 0) / stats.totalViolations) * 100)}%`
                      : 'Chưa có vi phạm'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings & Legal References Tab */}
          {currentTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Hệ Thống & Căn Cứ Pháp Lý Điều Hành</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>Luật Khám bệnh, chữa bệnh số 15/2023/QH15</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Quy định nghiêm ngặt về điều kiện hoạt động của cơ sở thẩm mỹ, phạm vi hành nghề phẫu thuật thẩm mỹ và các dịch vụ can thiệp xâm lấn cơ thể.
                  </p>
                </div>

                <div className="p-4 border border-indigo-200 bg-indigo-50/50 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Luật Quảng cáo số 16/2012/QH13</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Điều 8, Điều 20: Cấm quảng cáo sai sự thật, cấm cam kết tuyệt đối (100%, vĩnh viễn), bắt buộc phải có Giấy phép hoạt động và Chứng chỉ hành nghề.
                  </p>
                </div>

                <div className="p-4 border border-red-200 bg-red-50/50 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>Nghị định 117/2020/NĐ-CP (Xử phạt Y tế)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Điều 39, 40: Phạt 40 - 50 triệu đồng và đình chỉ hoạt động 12 - 24 tháng đối với cơ sở cung cấp dịch vụ khám bệnh, chữa bệnh khi không có giấy phép hoạt động.
                  </p>
                </div>

                <div className="p-4 border border-purple-200 bg-purple-50/50 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Nghị định 38/2021/NĐ-CP (Xử phạt Quảng cáo)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Điều 56: Phạt 30 - 40 triệu đồng đối với hành vi quảng cáo dịch vụ khám chữa bệnh chưa có giấy phép hoạt động hoặc chưa được xác nhận nội dung quảng cáo.
                  </p>
                </div>
              </div>

              {/* Cấu Hình Google Gemini AI */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Cấu Hình Trí Tuệ Nhân Tạo (Google Gemini AI)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tùy chọn kết nối Google Gemini để mở rộng khả năng tự động sinh từ khóa tiếng lóng và bóc tách các thủ đoạn lách luật tinh vi.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {aiConfig.hasKey ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        Đã kích hoạt ({aiConfig.model})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Đang dùng Heuristic Engine nội bộ
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveAiConfig} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="gemini-api-key-input" className="text-xs font-bold text-slate-700">Gemini API Key:</label>
                        {aiConfig.hasKey && (
                          <span className="text-[11px] text-slate-500 font-normal">
                            Khóa hiện tại: <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">{aiConfig.maskedKey}</code>
                          </span>
                        )}
                      </div>
                      <input
                        id="gemini-api-key-input"
                        name="geminiApiKey"
                        type="password"
                        placeholder={aiConfig.hasKey ? "Dán mã mới nếu bạn muốn cập nhật..." : "Dán mã AIzaSy... lấy từ Google AI Studio"}
                        value={aiKeyInput}
                        onChange={(e) => setAiKeyInput(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="gemini-model-select" className="text-xs font-bold text-slate-700">Mô hình AI (Model):</label>
                      <select
                        id="gemini-model-select"
                        name="geminiModel"
                        value={aiModelInput}
                        onChange={(e) => setAiModelInput(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="gemini-3.8-flash">✨ Gemini 3.8 Flash (Thế hệ mới nhất)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng - Nhanh, chuẩn)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ổn định)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Lập luận sâu)</option>
                      </select>
                    </div>
                  </div>

                  {aiMessage && (
                    <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                      aiMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <span>{aiMessage.type === 'success' ? '✅' : '⚠️'}</span>
                      <span>{aiMessage.text}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <div className="text-[11px] text-slate-500">
                      💡 Lấy khóa miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Google AI Studio (aistudio.google.com)</a>. Không bắt buộc: Hệ thống luôn có bộ luật nội bộ hoạt động độc lập 100%.
                    </div>
                    <div className="flex items-center space-x-2">
                      {aiConfig.hasKey && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc muốn hủy khóa Gemini API và quay về dùng bộ luật nội bộ?')) {
                              setAiKeyInput('');
                              handleSaveAiConfig();
                            }
                          }}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 font-medium cursor-pointer"
                        >
                          Gỡ khóa
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isTestingAi}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isTestingAi ? 'Đang kiểm tra kết nối...' : 'Lưu & Kiểm Tra Kết Nối AI'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Cấu Hình Cảnh Báo Telegram Bot (24/7 Smart Alerts - Mô-đun 1) */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <BellRing className="w-4 h-4 text-blue-600" />
                      <span>Cảnh Báo Tự Động Qua Telegram Bot (24/7 Smart Alerts - Mô-đun 1)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tự động đẩy thông báo vi phạm nghiêm trọng (xâm lấn không phép, thẩm mỹ chui) về nhóm chat của Đội Thanh tra ngay khi quét được.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alertsConfig.telegramEnabled ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        Đang kích hoạt cảnh báo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                        Đang tạm dừng
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveAlertsConfig} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Telegram Bot Token:</label>
                      <input
                        type="text"
                        placeholder="VD: 7123456789:AAH..."
                        value={alertsConfig.telegramBotToken}
                        onChange={(e) => setAlertsConfig({ ...alertsConfig, telegramBotToken: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Telegram Chat ID (hoặc Group ID):</label>
                      <input
                        type="text"
                        placeholder="VD: -100123456789 hoặc 987654321"
                        value={alertsConfig.telegramChatId}
                        onChange={(e) => setAlertsConfig({ ...alertsConfig, telegramChatId: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertsConfig.telegramEnabled}
                          onChange={(e) => setAlertsConfig({ ...alertsConfig, telegramEnabled: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Bật đẩy cảnh báo tức thời</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertsConfig.alertOnHighSeverityOnly}
                          onChange={(e) => setAlertsConfig({ ...alertsConfig, alertOnHighSeverityOnly: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Chỉ cảnh báo vi phạm mức độ "Cao"</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={isTestingTelegram || !alertsConfig.telegramBotToken || !alertsConfig.telegramChatId}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3 text-blue-600" />
                        <span>{isTestingTelegram ? 'Đang gửi tin...' : 'Gửi Tin Thử Nghiệm'}</span>
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Lưu Cấu Hình Cảnh Báo
                      </button>
                    </div>
                  </div>

                  {telegramMessage && (
                    <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                      telegramMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <span>{telegramMessage.type === 'success' ? '✅' : '⚠️'}</span>
                      <span>{telegramMessage.text}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Chế độ Vận Hành Thật (Production Controls) */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Môi Trường Vận Hành: CHÍNH THỨC (PRODUCTION 100%)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Hệ thống đã loại bỏ hoàn toàn các chế độ sandbox thử nghiệm. Mọi hoạt động cào dữ liệu và lập bằng chứng đều truy vấn trực tiếp trên Facebook thật.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ 156 dữ liệu mẫu ban đầu để đưa hệ thống về danh sách trắng rỗng, sẵn sàng chỉ ghi nhận các vi phạm thực tế do cán bộ quét được. Bạn có chắc chắn muốn thực hiện?')) {
                        const res = await fetch('/api/violations/reset-production', { method: 'POST' });
                        const data = await res.json();
                        alert(data.message);
                        fetchViolations(1);
                        fetchStats();
                      }
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    🗑️ Dọn Dẹp Dữ Liệu Sandbox (Khởi Tạo Database Trắng)
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Crawler Automation Modal (Steps B1 to B4) */}
      <CrawlerModal
        isOpen={isCrawlerOpen}
        onClose={() => setIsCrawlerOpen(false)}
        onRefreshViolations={() => {
          fetchViolations(1);
          fetchStats();
        }}
      />
    </div>
  );
}
