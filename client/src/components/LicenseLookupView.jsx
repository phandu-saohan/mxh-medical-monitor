import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  MapPin,
  X
} from 'lucide-react';

export default function LicenseLookupView() {
  const [facilities, setFacilities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [testName, setTestName] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding new licensed facility
  const [newFacility, setNewFacility] = useState({
    name: '',
    licenseNumber: '',
    issuedBy: 'Sở Y tế',
    city: 'Hà Nội',
    type: 'Phòng khám Chuyên khoa Thẩm mỹ',
    doctorInCharge: '',
    scope: '',
    address: ''
  });

  const fetchFacilities = () => {
    fetch(`/api/license/facilities?city=${encodeURIComponent(selectedCity)}`)
      .then((res) => res.json())
      .then((data) => setFacilities(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedCity]);

  const handleTestLookup = (e) => {
    e.preventDefault();
    if (!testName.trim()) return;

    fetch(`/api/license/lookup?name=${encodeURIComponent(testName.trim())}&city=${encodeURIComponent(selectedCity)}`)
      .then((res) => res.json())
      .then((data) => setCheckResult(data))
      .catch(() => {});
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newFacility.name || !newFacility.licenseNumber) {
      alert('Vui lòng nhập tên cơ sở và số Giấy phép hoạt động (GPHĐ).');
      return;
    }

    try {
      const res = await fetch('/api/license/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFacility)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewFacility({
          name: '',
          licenseNumber: '',
          issuedBy: 'Sở Y tế',
          city: 'Hà Nội',
          type: 'Phòng khám Chuyên khoa Thẩm mỹ',
          doctorInCharge: '',
          scope: '',
          address: ''
        });
        fetchFacilities();
        alert('Đã thêm cơ sở vào danh bạ được cấp phép thành công!');
      }
    } catch (e) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa cơ sở này khỏi danh bạ được cấp phép?')) return;
    try {
      await fetch(`/api/license/facilities/${id}`, { method: 'DELETE' });
      fetchFacilities();
    } catch (e) {
      alert(e.message);
    }
  };

  const filteredFacilities = facilities.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Danh Bạ Cơ Sở Y Tế Được Cấp Phép (Whitelisting Địa Phương)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập danh bạ Bệnh viện, Phòng khám chuyên khoa PTTM được Sở Y tế địa phương cấp phép để hệ thống tự động loại trừ và tập trung xử lý các cơ sở "mổ chui".
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Cơ Sở Hợp Pháp Mới</span>
        </button>
      </div>

      {/* Tra cứu nhanh một cơ sở bất kỳ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Search className="w-4 h-4 text-blue-600" />
          <span>Kiểm Tra Nhanh Tên Cơ Sở / Fanpage Nghi Ngờ</span>
        </h3>

        <form onSubmit={handleTestLookup} className="flex flex-wrap gap-3">
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Nhập tên cơ sở trên bài đăng FB (ví dụ: Viện Thẩm Mỹ Seoul Spa, Bệnh viện Kangnam, Spa Tiêm Filler Mini...)"
            className="flex-1 min-w-[280px] px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Đối Soát Pháp Lý
          </button>
        </form>

        {checkResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
            checkResult.isLicensed 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center space-x-2">
                {checkResult.isLicensed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                <span>{checkResult.isLicensed ? 'CƠ SỞ HỢP PHÁP ĐÃ ĐƯỢC CẤP PHÉP' : 'CẢNH BÁO: CHƯA CÓ GIẤY PHÉP PHẪU THUẬT XÂM LẤN'}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                checkResult.isLicensed ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
              }`}>
                {checkResult.warningLevel || 'Cảnh báo'}
              </span>
            </div>
            <p className="leading-relaxed font-medium">
              {checkResult.message}
            </p>
            {checkResult.facility && (
              <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <div>Số GPHĐ: <strong>{checkResult.facility.licenseNumber}</strong> • Cơ quan cấp: <strong>{checkResult.facility.issuedBy}</strong></div>
                <div>Phụ trách chuyên môn: <strong>{checkResult.facility.doctorInCharge || 'Chưa cập nhật'}</strong></div>
                <div>Phạm vi: {checkResult.facility.scope}</div>
                <div>Địa chỉ: {checkResult.facility.address}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bộ lọc Tỉnh/Thành phố & Danh sách cơ sở */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          {/* City Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-2 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Địa bàn:</span>
            </span>
            {['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, số GPHĐ, địa chỉ..."
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-64 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Tên Cơ Sở KCB</th>
                <th className="py-3 px-3">Địa bàn</th>
                <th className="py-3 px-3">Số GPHĐ</th>
                <th className="py-3 px-3">Bác sĩ phụ trách</th>
                <th className="py-3 px-4">Phạm vi kỹ thuật</th>
                <th className="py-3 px-3">Địa chỉ</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFacilities.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{f.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{f.type}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                      {f.city}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    <div>{f.licenseNumber}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{f.issuedBy}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {f.doctorInCharge || 'Chưa cập nhật'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">
                    {f.scope}
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-[180px] truncate" title={f.address}>
                    {f.address}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa khỏi danh bạ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Cơ Sở Hợp Pháp Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-cyan-300" />
                <span>Thêm Cơ Sở Khám Chữa Bệnh Thẩm Mỹ Hợp Pháp</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Bệnh viện / Phòng khám (*):</label>
                <input
                  type="text"
                  required
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  placeholder="Ví dụ: Bệnh viện Đa khoa Quốc tế Vinmec..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Giấy phép hoạt động (GPHĐ) (*):</label>
                  <input
                    type="text"
                    required
                    value={newFacility.licenseNumber}
                    onChange={(e) => setNewFacility({ ...newFacility, licenseNumber: e.target.value })}
                    placeholder="Ví dụ: 123/BYT-GPHĐ hoặc 456/SYT-GPHĐ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tỉnh / Thành phố:</label>
                  <select
                    value={newFacility.city}
                    onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Khác">Tỉnh thành khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cơ quan cấp phép:</label>
                  <input
                    type="text"
                    value={newFacility.issuedBy}
                    onChange={(e) => setNewFacility({ ...newFacility, issuedBy: e.target.value })}
                    placeholder="Bộ Y tế hoặc Sở Y tế Hà Nội..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bác sĩ phụ trách chuyên môn:</label>
                  <input
                    type="text"
                    value={newFacility.doctorInCharge}
                    onChange={(e) => setNewFacility({ ...newFacility, doctorInCharge: e.target.value })}
                    placeholder="BSCKII Nguyễn Văn B..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phạm vi kỹ thuật được phê duyệt:</label>
                <input
                  type="text"
                  value={newFacility.scope}
                  onChange={(e) => setNewFacility({ ...newFacility, scope: e.target.value })}
                  placeholder="Nâng mũi, cắt mí, hút mỡ theo danh mục kỹ thuật Sở Y tế phê duyệt..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ trụ sở hoạt động:</label>
                <input
                  type="text"
                  value={newFacility.address}
                  onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                  placeholder="Số nhà, đường, quận/huyện..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Lưu vào Danh Bạ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
