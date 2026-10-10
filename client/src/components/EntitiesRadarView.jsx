import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Phone,
  MapPin,
  Building2,
  AlertTriangle,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  FileText,
  BadgeAlert
} from 'lucide-react';

export default function EntitiesRadarView({ onSelectEntity }) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/entities');
      const data = await res.json();
      setEntities(data);
    } catch (err) {
      console.error('Lỗi tải danh sách hồ sơ cơ sở:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hotlines.some((h) => h.includes(searchTerm)) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      selectedRisk === 'ALL' ||
      (selectedRisk === 'DANGER' && e.riskLevel.includes('CỰC KỲ NGUY HIỂM')) ||
      (selectedRisk === 'HIGH' && e.riskLevel.includes('RỦI RO CAO')) ||
      (selectedRisk === 'UNLICENSED' && !e.isLicensed);

    const matchesLoc =
      selectedLocation === 'ALL' || e.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesRisk && matchesLoc;
  });

  const totalViolationsCount = entities.reduce((acc, e) => acc + e.violationCount, 0);
  const totalFineEstimate = entities.reduce((acc, e) => acc + e.estimatedTotalFine, 0);
  const unlicensedCount = entities.filter((e) => !e.isLicensed).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>Radar Điểm Nóng &amp; Sổ Đen Tái Phạm (Mô-đun 3)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tự động bóc tách thực thể thương hiệu, số điện thoại hotline, địa bàn và đối soát giấy phép hoạt động để khoanh vùng cơ sở thẩm mỹ "chui" có nguy cơ cao.
          </p>
        </div>

        <button
          onClick={fetchEntities}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 self-start md:self-auto cursor-pointer"
        >
          <span>Làm mới Radar</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{entities.length}</div>
            <div className="text-xs font-semibold text-slate-500">Cơ sở / Thương hiệu ghi nhận</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">
              {entities.filter((e) => e.riskLevel.includes('CỰC KỲ NGUY HIỂM')).length}
            </div>
            <div className="text-xs font-semibold text-slate-500">Cơ sở trong Sổ Đen tái phạm</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{unlicensedCount}</div>
            <div className="text-xs font-semibold text-slate-500">Cơ sở chưa có GPHĐ (Chui)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">
              {(totalFineEstimate / 1000000).toLocaleString('vi-VN')} tr
            </div>
            <div className="text-xs font-semibold text-slate-500">Ước tính khung tiền phạt VPHC</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm tên cơ sở, thương hiệu, số hotline hoặc địa bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">Mức độ: Tất cả</option>
            <option value="DANGER">🔴 Cực kỳ nguy hiểm (Tái phạm)</option>
            <option value="HIGH">🟠 Rủi ro cao</option>
            <option value="UNLICENSED">⚠️ Chưa có Giấy phép hoạt động</option>
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">Địa bàn: Toàn quốc</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP.HCM">TP.HCM</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </select>
        </div>
      </div>

      {/* Entities Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <BadgeAlert className="w-4 h-4 text-red-500" />
            <span>Hồ Sơ Giám Sát Cơ Sở Thẩm Mỹ ({filteredEntities.length})</span>
          </div>
          <span className="text-xs text-slate-400">Sắp xếp theo số lượt vi phạm giảm dần</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Đang tổng hợp dữ liệu Radar...
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Không tìm thấy cơ sở nào phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEntities.map((entity) => (
              <div
                key={entity.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {entity.sampleAvatar ? (
                      <img src={entity.sampleAvatar} alt={entity.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900">{entity.name}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          entity.riskColor === 'red'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : entity.riskColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {entity.riskLevel}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          entity.isLicensed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {entity.licenseStatus}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{entity.location}</span>
                      </span>

                      {entity.hotlines.length > 0 && (
                        <span className="flex items-center space-x-1 text-slate-700 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{entity.hotlines.join(', ')}</span>
                        </span>
                      )}

                      <span className="text-slate-400">
                        Loại trang: <span className="font-medium text-slate-600">{entity.authorType}</span>
                      </span>
                    </div>

                    {entity.categories.length > 0 && (
                      <div className="flex items-center space-x-1.5 pt-1 flex-wrap">
                        {entity.categories.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Metrics & Actions */}
                <div className="flex items-center justify-between md:justify-end space-x-6 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500">Số vụ vi phạm</div>
                    <div className="text-lg font-black text-rose-600">{entity.violationCount} vụ</div>
                    <div className="text-[11px] text-slate-400">Ước tính: {entity.formattedFine}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {entity.sampleUrls && entity.sampleUrls[0] && (
                      <a
                        href={entity.sampleUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Xem bài viết gốc"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
