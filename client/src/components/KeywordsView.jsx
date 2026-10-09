import React, { useState, useEffect } from 'react';
import {
  Hash,
  Plus,
  Trash2,
  ShieldAlert,
  Search,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export default function KeywordsView() {
  const [keywords, setKeywords] = useState([]);
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState('Phẫu thuật xâm lấn');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchFilter, setSearchFilter] = useState('');

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTheme, setAiTheme] = useState('evasion');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiCount, setAiCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());

  const fetchKeywords = () => {
    fetch('/api/keywords')
      .then((res) => res.json())
      .then((data) => setKeywords(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTerm.trim()) return;

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: newTerm.trim(), category: newCategory })
      });
      if (res.ok) {
        setNewTerm('');
        fetchKeywords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
      fetchKeywords();
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click quick batch preset insertion
  const handleLoadPreset = async (presetCategory, terms) => {
    for (const t of terms) {
      if (!keywords.some(k => k.term.toLowerCase() === t.toLowerCase())) {
        await fetch('/api/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term: t, category: presetCategory })
        });
      }
    }
    fetchKeywords();
    alert(`Đã nạp thành công bộ từ khóa "${presetCategory}"!`);
  };

  // Trigger AI Generator
  const handleGenerateAi = async () => {
    setIsGenerating(true);
    setAiSuggestions([]);
    setSelectedSuggestions(new Set());
    try {
      const res = await fetch('/api/keywords/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: aiTheme,
          prompt: aiCustomPrompt,
          count: aiCount
        })
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        // Pre-select all by default
        setSelectedSuggestions(new Set(data.suggestions.map((_, i) => i)));
      }
    } catch (err) {
      alert(`Lỗi sinh từ khóa: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle suggestion selection
  const toggleSelectSuggestion = (index) => {
    const updated = new Set(selectedSuggestions);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedSuggestions(updated);
  };

  // Bulk add selected AI suggestions
  const handleAddAiSelected = async () => {
    const itemsToAdd = Array.from(selectedSuggestions).map(idx => aiSuggestions[idx]);
    if (itemsToAdd.length === 0) {
      alert('Vui lòng chọn ít nhất một từ khóa để thêm.');
      return;
    }

    try {
      const res = await fetch('/api/keywords/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd })
      });
      const data = await res.json();
      if (data.success) {
        fetchKeywords();
        setIsAiModalOpen(false);
        alert(`Đã thêm thành công ${data.addedCount} từ khóa mới do AI gợi ý vào hệ thống giám sát!`);
      }
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const filteredKeywords = keywords.filter(k => {
    const matchCat = selectedCategory === 'Tất cả' || k.category === selectedCategory;
    const matchSearch = k.term.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = [
    'Tất cả',
    'Phẫu thuật xâm lấn',
    'Can thiệp tiêm chích',
    'Phẫu thuật đại phẫu',
    'Tiếng lóng & Lách luật',
    'Cam kết sai sự thật',
    'Chất cấm/Chưa cấp phép'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Bộ Từ Khóa Rà Soát Y Tế &amp; Tiếng Lóng Thẩm Mỹ
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bổ sung các thuật ngữ chuyên môn và tiếng lóng thẩm mỹ theo địa phương để máy quét tự động phát hiện chính xác.
          </p>
        </div>

        {/* Nút Kích Hoạt AI Gợi Ý */}
        <button
          onClick={() => {
            setIsAiModalOpen(true);
            if (aiSuggestions.length === 0) handleGenerateAi();
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer shrink-0 transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>✨ AI Gợi Ý Từ Khóa Mới</span>
        </button>
      </div>

      {/* Preset Quick Load Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-2">
        <div className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <span>Gợi ý nạp nhanh bộ từ khóa đặc thù theo chuyên đề:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handleLoadPreset('Tiếng lóng & Lách luật', ['tiểu phẫu tại nhà', 'bác sĩ đến tận spa', 'bao đẹp không đau', 'mổ dạo', 'sụn nhân tạo giá sỉ'])}
            className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-300 transition-colors cursor-pointer shadow-xs"
          >
            + Nạp Bộ Tiếng Lóng / Lách Luật
          </button>
          <button
            onClick={() => handleLoadPreset('Can thiệp tiêm chích', ['tiêm tai tài lộc', 'tiêm môi baby', 'tiêm tan mỡ', 'cấy chỉ collagen', 'tiêm meso căng bóng'])}
            className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-300 transition-colors cursor-pointer shadow-xs"
          >
            + Nạp Bộ Tiêm Chích (Filler / Botox)
          </button>
          <button
            onClick={() => handleLoadPreset('Phẫu thuật xâm lấn', ['cắt mí mini', 'cắt mí babydoll', 'nâng mũi sụn sườn', 'bóc mỡ mí mắt', 'gọt hàm hạ gò má'])}
            className="px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-300 transition-colors cursor-pointer shadow-xs"
          >
            + Nạp Bộ Phẫu Thuật Mũi / Mắt / Hàm
          </button>
          <button
            onClick={() => handleLoadPreset('Chất cấm/Chưa cấp phép', ['truyền trắng noãn thực vật', 'truyền trắng phi thuyền', 'cấy phấn nano', 'thuốc tan mỡ siêu tốc'])}
            className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-300 transition-colors cursor-pointer shadow-xs"
          >
            + Nạp Bộ Chất Cấm / Truyền Trắng
          </button>
        </div>
      </div>

      {/* Add New Keyword Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="new-keyword-term-input" className="sr-only">Từ khóa y tế cần giám sát</label>
          <input
            id="new-keyword-term-input"
            name="newTerm"
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Nhập từ khóa y tế cần giám sát (ví dụ: cắt mí mini, truyền trắng noãn, nâng ngực nano...)"
            aria-label="Nhập từ khóa y tế cần giám sát"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label htmlFor="new-keyword-category-select" className="sr-only">Danh mục từ khóa</label>
        <select
          id="new-keyword-category-select"
          name="newCategory"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          aria-label="Danh mục từ khóa"
          className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="Phẫu thuật xâm lấn">Phẫu thuật xâm lấn</option>
          <option value="Can thiệp tiêm chích">Can thiệp tiêm chích</option>
          <option value="Phẫu thuật đại phẫu">Phẫu thuật đại phẫu</option>
          <option value="Tiếng lóng & Lách luật">Tiếng lóng & Lách luật</option>
          <option value="Cam kết sai sự thật">Cam kết sai sự thật</option>
          <option value="Chất cấm/Chưa cấp phép">Chất cấm/Chưa cấp phép</option>
        </select>

        <button
          type="submit"
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm từ khóa</span>
        </button>
      </form>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Lọc từ khóa..."
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-52"
          />
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKeywords.map((kw) => (
          <div
            key={kw.id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-400 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{kw.term}</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-600">{kw.category}</span> • {kw.count || 0} bài vi phạm
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(kw.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa từ khóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: AI GỢI Ý TỪ KHÓA MỚI */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                    <span>Trợ Lý AI Gợi Ý &amp; Bóc Tách Từ Khóa Lách Luật Y Tế</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Phát hiện các biến thể lách kiểm duyệt, tiếng lóng mạng xã hội và thuật ngữ mổ chui mới nổi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Controls Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ai-theme-select" className="font-bold text-slate-700 block mb-1">
                      Chọn chủ đề phân tích AI:
                    </label>
                    <select
                      id="ai-theme-select"
                      name="aiTheme"
                      value={aiTheme}
                      onChange={(e) => setAiTheme(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-xs"
                    >
                      <option value="evasion">Thủ đoạn lách kiểm duyệt (Viết tắt, chèn dấu f.i.l.l.e.r)</option>
                      <option value="student_traps">Chiêu trò giá rẻ sinh viên &amp; Tuyển mẫu mổ thực hành</option>
                      <option value="injection">Can thiệp tiêm chích (Filler, Botox, Meso, Tan mỡ)</option>
                      <option value="surgery">Mổ chui xâm lấn (Nâng mũi bán cấu trúc, Cắt mí, Độn cằm)</option>
                      <option value="major_surgery">Đại phẫu nguy hiểm (Hút mỡ bụng, Nâng ngực tại spa)</option>
                      <option value="banned_substances">Chất cấm, Tế bào gốc, Truyền trắng phi thuyền</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ai-count-select" className="font-bold text-slate-700 block mb-1">
                      Số lượng từ khóa gợi ý:
                    </label>
                    <select
                      id="ai-count-select"
                      name="aiCount"
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-xs"
                    >
                      <option value={6}>6 từ khóa</option>
                      <option value={8}>8 từ khóa (Khuyên dùng)</option>
                      <option value={12}>12 từ khóa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ai-custom-prompt-input" className="font-bold text-slate-700 block mb-1">
                    Yêu cầu bổ sung cho AI (Tùy chọn):
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="ai-custom-prompt-input"
                      name="aiCustomPrompt"
                      type="text"
                      value={aiCustomPrompt}
                      onChange={(e) => setAiCustomPrompt(e.target.value)}
                      placeholder="Ví dụ: Tìm các từ khóa spa hay dùng trên TikTok để dụ dỗ nâng mũi chỉ 999k..."
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                    <button
                      onClick={handleGenerateAi}
                      disabled={isGenerating}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI đang phân tích...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Khởi Chạy AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Generated Suggestions Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <span>Kết quả AI phát hiện</span>
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {aiSuggestions.length} từ khóa
                    </span>
                  </div>

                  {aiSuggestions.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedSuggestions.size === aiSuggestions.length) {
                          setSelectedSuggestions(new Set());
                        } else {
                          setSelectedSuggestions(new Set(aiSuggestions.map((_, i) => i)));
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      {selectedSuggestions.size === aiSuggestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>

                {isGenerating ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                    <p className="text-slate-600 font-semibold">AI đang rà soát các thủ đoạn và tiếng lóng thẩm mỹ...</p>
                  </div>
                ) : aiSuggestions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 italic">
                    Chưa có từ khóa nào. Bấm nút "Khởi Chạy AI" ở trên để tạo từ khóa.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {aiSuggestions.map((item, idx) => {
                      const isSelected = selectedSuggestions.has(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleSelectSuggestion(idx)}
                          className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectSuggestion(idx)}
                            className="mt-0.5 rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm">
                                "{item.term}"
                              </span>
                              <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                item.risk === 'Cao' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                Rủi ro: {item.risk}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                              💡 <strong>Thủ đoạn lách luật:</strong> {item.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-slate-500 text-xs">
                Đã chọn: <strong className="text-purple-700">{selectedSuggestions.size}</strong> từ khóa gợi ý
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleAddAiSelected}
                  disabled={selectedSuggestions.size === 0}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Thêm {selectedSuggestions.size} Từ Khóa Vào Giám Sát</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
