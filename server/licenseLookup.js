import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { upsertFacilityToSupabase, deleteFacilityFromSupabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FACILITIES_FILE = path.join(__dirname, '..', 'data', 'licensed_facilities.json');

export const INITIAL_FACILITIES = [
  // HÀ NỘI
  {
    id: 'GPHD-HN-001',
    name: 'Bệnh viện Da liễu Trung ương',
    licenseNumber: '01/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'Hà Nội',
    type: 'Bệnh viện Tuyến Trung ương',
    doctorInCharge: 'PGS.TS Lê Hữu Doanh',
    scope: 'Đầy đủ danh mục kỹ thuật da liễu, phẫu thuật tạo hình và thẩm mỹ',
    address: '15A Phương Mai, Đống Đa, Hà Nội',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HN-002',
    name: 'Bệnh viện Trung ương Quân đội 108 - Khoa Phẫu thuật Tạo hình & Thẩm mỹ',
    licenseNumber: '108/BQP-GPHĐ',
    issuedBy: 'Bộ Quốc phòng / Bộ Y tế',
    city: 'Hà Nội',
    type: 'Bệnh viện Đa khoa Hạng Đặc biệt',
    doctorInCharge: 'GS.TS Vũ Ngọc Lâm',
    scope: 'Phẫu thuật đại phẫu, tạo hình thẩm mỹ, tái tạo mô vi phẫu',
    address: 'Số 1 Trần Hưng Đạo, Hai Bà Trưng, Hà Nội',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HN-003',
    name: 'Bệnh viện Hữu nghị Việt Đức - Trung tâm Phẫu thuật Tạo hình Thẩm mỹ',
    licenseNumber: '02/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'Hà Nội',
    type: 'Bệnh viện Ngoại khoa Tuyến TW',
    doctorInCharge: 'PGS.TS Nguyễn Hồng Hà',
    scope: 'Phẫu thuật hàm mặt, nâng mũi, hút mỡ, tái tạo đường nét cơ thể',
    address: '40 Tràng Thi, Hoàn Kiếm, Hà Nội',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HN-004',
    name: 'Bệnh viện Thẩm mỹ Kangnam Hà Nội',
    licenseNumber: '198/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'Hà Nội',
    type: 'Bệnh viện Chuyên khoa Thẩm mỹ',
    doctorInCharge: 'BSCKII Trần Huỳnh',
    scope: 'Nâng mũi cấu trúc, cắt mí, hút mỡ, phẫu thuật hàm mặt, nâng ngực',
    address: '190 Trường Chinh, Đống Đa, Hà Nội',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HN-005',
    name: 'Bệnh viện Đa khoa Quốc tế Thu Cúc - Khoa Phẫu thuật Thẩm mỹ',
    licenseNumber: '48/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'Hà Nội',
    type: 'Bệnh viện Đa khoa Tư nhân',
    doctorInCharge: 'BSCKI Nguyễn Thị Mai',
    scope: 'Phẫu thuật thẩm mỹ toàn diện, laser công nghệ cao',
    address: '286 Thụy Khuê, Tây Hồ, Hà Nội',
    status: 'Đang hoạt động'
  },

  // TP. HỒ CHÍ MINH
  {
    id: 'GPHD-HCM-001',
    name: 'Bệnh viện Da Liễu TP. Hồ Chí Minh',
    licenseNumber: '02/SYT-GPHĐ',
    issuedBy: 'Sở Y tế TP.HCM',
    city: 'TP. Hồ Chí Minh',
    type: 'Bệnh viện Chuyên khoa Hạng 1',
    doctorInCharge: 'TS.BS Nguyễn Trọng Hào',
    scope: 'Thẩm mỹ nội khoa, tiêm botox, filler, laser thẩm mỹ, điều trị da',
    address: 'Số 2 Nguyễn Thông, Phường 6, Quận 3, TP.HCM',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HCM-002',
    name: 'Bệnh viện Chợ Rẫy - Khoa Tạo hình Thẩm mỹ',
    licenseNumber: '03/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'TP. Hồ Chí Minh',
    type: 'Bệnh viện Đa khoa Trung ương',
    doctorInCharge: 'TS.BS Trần Văn Dương',
    scope: 'Đại phẫu tạo hình, xử lý biến chứng thẩm mỹ, tái tạo mô',
    address: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HCM-003',
    name: 'Bệnh viện Thẩm mỹ JW Hàn Quốc',
    licenseNumber: '112/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'TP. Hồ Chí Minh',
    type: 'Bệnh viện Chuyên khoa Thẩm mỹ',
    doctorInCharge: 'TS.BS Nguyễn Phan Tú Dung',
    scope: 'Nâng mũi sụn sườn, phẫu thuật khuôn mặt hàm mặt, nâng ngực',
    address: '44-46-48-50 Tôn Thất Tùng, Quận 1, TP.HCM',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-HCM-004',
    name: 'Bệnh viện Thẩm mỹ Đông Á TP.HCM',
    licenseNumber: '215/BYT-GPHĐ',
    issuedBy: 'Bộ Y tế',
    city: 'TP. Hồ Chí Minh',
    type: 'Bệnh viện Chuyên khoa Thẩm mỹ',
    doctorInCharge: 'BSCKII Nguyễn Hoàng Long',
    scope: 'Cắt mí, nâng mũi cấu trúc, hút mỡ bụng, nâng ngực',
    address: '218 Nguyễn Trãi, Phường 3, Quận 5, TP.HCM',
    status: 'Đang hoạt động'
  },

  // ĐÀ NẴNG
  {
    id: 'GPHD-DN-001',
    name: 'Bệnh viện Đà Nẵng - Khoa Ngoại Bỏng & Tạo hình Thẩm mỹ',
    licenseNumber: '08/SYT-GPHĐ',
    issuedBy: 'Sở Y tế Đà Nẵng',
    city: 'Đà Nẵng',
    type: 'Bệnh viện Đa khoa Hạng 1',
    doctorInCharge: 'BSCKII Phạm Trần Xuân Anh',
    scope: 'Phẫu thuật tạo hình, điều trị di chứng, can thiệp phẫu thuật thẩm mỹ',
    address: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng',
    status: 'Đang hoạt động'
  },
  {
    id: 'GPHD-DN-002',
    name: 'Phòng khám Chuyên khoa Thẩm mỹ Bác sĩ Nhân Đà Nẵng',
    licenseNumber: '0549/ĐNA-GPHĐ',
    issuedBy: 'Sở Y tế Đà Nẵng',
    city: 'Đà Nẵng',
    type: 'Phòng khám Chuyên khoa Phẫu thuật Thẩm mỹ',
    doctorInCharge: 'ThS.BS Nguyễn Văn Nhân',
    scope: 'Tiểu phẫu nâng mũi, cắt mí mắt, độn cằm theo phạm vi PKCK',
    address: '47 Nguyễn Thị Minh Khai, Hải Châu, Đà Nẵng',
    status: 'Đang hoạt động'
  },

  // HẢI PHÒNG
  {
    id: 'GPHD-HP-001',
    name: 'Bệnh viện Hữu nghị Việt Tiệp Hải Phòng - Khoa Phẫu thuật Tạo hình Thẩm mỹ',
    licenseNumber: '15/SYT-GPHĐ',
    issuedBy: 'Sở Y tế Hải Phòng',
    city: 'Hải Phòng',
    type: 'Bệnh viện Đa khoa Hạng 1',
    doctorInCharge: 'BSCKII Đỗ Mạnh Thắng',
    scope: 'Phẫu thuật tạo hình thẩm mỹ, chỉnh hình vóc dáng',
    address: 'Số 1 Nhà Thương, Cát Dài, Lê Chân, Hải Phòng',
    status: 'Đang hoạt động'
  }
];

export function getLicensedFacilities(city = 'Tất cả') {
  if (!fs.existsSync(FACILITIES_FILE)) {
    fs.writeFileSync(FACILITIES_FILE, JSON.stringify(INITIAL_FACILITIES, null, 2), 'utf-8');
    return INITIAL_FACILITIES;
  }
  try {
    const list = JSON.parse(fs.readFileSync(FACILITIES_FILE, 'utf-8'));
    if (city && city !== 'Tất cả') {
      return list.filter(f => f.city === city);
    }
    return list;
  } catch {
    return INITIAL_FACILITIES;
  }
}

export function saveLicensedFacilities(facilities) {
  fs.writeFileSync(FACILITIES_FILE, JSON.stringify(facilities, null, 2), 'utf-8');
}

export function addLicensedFacility(facility) {
  const list = getLicensedFacilities('Tất cả');
  const newItem = {
    id: facility.id || `GPHD-CUSTOM-${Date.now().toString().slice(-4)}`,
    status: facility.status || 'Đang hoạt động',
    ...facility
  };
  list.unshift(newItem);
  saveLicensedFacilities(list);
  upsertFacilityToSupabase(newItem).catch(err => console.warn('[Supabase] Lỗi lưu cơ sở:', err.message));
  return newItem;
}

/**
 * Nhập hàng loạt danh sách GPHĐ (Excel/CSV parsed list)
 */
export function bulkImportLicensedFacilities(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách cơ sở rỗng hoặc không đúng định dạng.');
  }

  const currentList = getLicensedFacilities('Tất cả');
  const existingLicenseNumbers = new Set(currentList.map(f => (f.licenseNumber || '').toLowerCase().trim()));
  const existingNames = new Set(currentList.map(f => (f.name || '').toLowerCase().trim()));

  let importedCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    if (!item.name || !item.name.trim()) continue;

    const licNum = (item.licenseNumber || `GPHD-IMP-${Date.now().toString().slice(-4)}-${importedCount}`).trim();
    const licKey = licNum.toLowerCase();
    const nameKey = item.name.toLowerCase().trim();

    const facilityData = {
      id: item.id || `GPHD-IMP-${Date.now().toString().slice(-6)}-${importedCount}`,
      name: item.name.trim(),
      licenseNumber: licNum,
      issuedBy: item.issuedBy || 'Sở Y tế',
      city: item.city || item.tinhThanh || 'Toàn quốc',
      type: item.type || item.loaiHinh || 'Phòng khám chuyên khoa Thẩm mỹ',
      doctorInCharge: item.doctorInCharge || item.bacSi || 'BS. Chuyên khoa',
      scope: item.scope || item.phamVi || 'Phẫu thuật tạo hình thẩm mỹ theo danh mục phê duyệt',
      address: item.address || item.diaChi || 'Chưa cập nhật',
      status: item.status || 'Đang hoạt động'
    };

    if (existingLicenseNumbers.has(licKey) || existingNames.has(nameKey)) {
      // Update existing
      const idx = currentList.findIndex(f => 
        (f.licenseNumber && f.licenseNumber.toLowerCase().trim() === licKey) ||
        (f.name && f.name.toLowerCase().trim() === nameKey)
      );
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...facilityData };
        updatedCount++;
      }
    } else {
      currentList.unshift(facilityData);
      existingLicenseNumbers.add(licKey);
      existingNames.add(nameKey);
      importedCount++;
    }

    upsertFacilityToSupabase(facilityData).catch(() => {});
  }

  saveLicensedFacilities(currentList);
  return {
    success: true,
    total: currentList.length,
    importedCount,
    updatedCount,
    message: `Đã nhập thành công ${importedCount} cơ sở mới và cập nhật ${updatedCount} cơ sở trong CSDL Sở Y tế.`
  };
}

/**
 * Bóc tách dữ liệu văn bản CSV thành danh sách cơ sở
 */
export function parseCsvFacilitiesText(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV row parser handling quotes
    const row = [];
    let insideQuote = false;
    let current = '';

    for (const char of lines[i]) {
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());

    if (row.length < 2) continue;

    const getVal = (possibleHeaders, defaultVal = '') => {
      for (const h of possibleHeaders) {
        const idx = headers.findIndex(hdr => hdr.includes(h));
        if (idx !== -1 && row[idx]) return row[idx].replace(/["']/g, '').trim();
      }
      return defaultVal;
    };

    const name = getVal(['tên', 'tên cơ sở', 'name', 'co so']);
    if (!name) continue;

    results.push({
      name,
      licenseNumber: getVal(['số gphđ', 'gphđ', 'số giấy phép', 'license', 'so gphd'], 'Đang cập nhật'),
      issuedBy: getVal(['cơ quan', 'cấp bởi', 'issued', 'so y te'], 'Sở Y tế'),
      city: getVal(['tỉnh', 'thành phố', 'city', 'dia ban'], 'TP. Hồ Chí Minh'),
      type: getVal(['loại hình', 'loại', 'type'], 'Phòng khám Chuyên khoa Thẩm mỹ'),
      doctorInCharge: getVal(['bác sĩ', 'phụ trách', 'doctor'], 'BSCK. Thẩm mỹ'),
      scope: getVal(['phạm vi', 'chuyên môn', 'kỹ thuật', 'scope'], 'Tạo hình thẩm mỹ theo danh mục kỹ thuật phê duyệt'),
      address: getVal(['địa chỉ', 'address'], 'Chưa cập nhật')
    });
  }

  return results;
}

export function deleteLicensedFacility(id) {
  const list = getLicensedFacilities('Tất cả');
  const filtered = list.filter(f => f.id !== id);
  saveLicensedFacilities(filtered);
  deleteFacilityFromSupabase(id).catch(err => console.warn('[Supabase] Lỗi xóa cơ sở:', err.message));
  return true;
}

/**
 * Checks facility name against licensed database with city awareness and scope verification
 */
export function verifyFacilityLicense(facilityName, city, serviceClaim = '') {
  if (!facilityName) return { isLicensed: false, message: 'Chưa có thông tin tên cơ sở' };

  const facilities = getLicensedFacilities('Tất cả');
  const normalized = facilityName.toLowerCase().trim();

  // Find exact or substring match in whitelist
  const match = facilities.find(f => {
    const fNorm = f.name.toLowerCase();
    return normalized.includes(fNorm) || fNorm.includes(normalized);
  });

  if (match) {
    // Nếu có thông tin dịch vụ quảng cáo, kiểm tra xem có vượt quá phạm vi hoạt động chuyên môn không
    if (serviceClaim) {
      const claimLower = serviceClaim.toLowerCase();
      const scopeLower = (match.scope || '').toLowerCase();

      const isMajorSurgeryClaim = /hút mỡ|nâng ngực|gọt cằm|gọt hàm|cắt da bụng|tạo hình thành bụng/i.test(claimLower);
      const isHospitalOnly = /bệnh viện/i.test(match.type) || /bệnh viện/i.test(match.name);

      if (isMajorSurgeryClaim && !isHospitalOnly && !scopeLower.includes('đại phẫu')) {
        return {
          isLicensed: true,
          facility: match,
          warningLevel: 'Vượt quá phạm vi chuyên môn',
          isScopeExceeded: true,
          message: `CẢNH BÁO VƯỢT QUÁ PHẠM VI: Cơ sở "${match.name}" CÓ GIẤY PHÉP (Số: ${match.licenseNumber}), nhưng kỹ thuật quảng cáo ("${serviceClaim}") thuộc danh mục ĐẠI PHẪU (chỉ được thực hiện tại Bệnh viện đa khoa/chuyên khoa thẩm mỹ). Vi phạm Khoản 6 Điều 39 Nghị định 117/2020/NĐ-CP!`
        };
      }
    }

    return {
      isLicensed: true,
      facility: match,
      warningLevel: 'Hợp lệ',
      message: `CƠ SỞ ĐƯỢC CẤP PHÉP: "${match.name}" (Số GPHĐ: ${match.licenseNumber} do ${match.issuedBy} cấp). Phụ trách chuyên môn: ${match.doctorInCharge || 'Bác sĩ chuyên khoa'}. Phạm vi: ${match.scope}.`
    };
  }

  // Detect illicit keywords typical of unlicensed spas & salons
  const isSpaOrSalon = /spa|viện chăm sóc da|beauty center|clinic mini|thẩm mỹ viện|chăm sóc sắc đẹp|tiểu phẫu tại nhà|chuyên sỉ filler|học viện thẩm mỹ/i.test(normalized);

  return {
    isLicensed: false,
    warningLevel: isSpaOrSalon ? 'Cực kỳ nghiêm trọng' : 'Chưa xác minh',
    message: isSpaOrSalon 
      ? `CẢNH BÁO VI PHẠM: Cơ sở dạng "${facilityName}" KHÔNG CÓ trong danh bạ Bệnh viện/Phòng khám chuyên khoa thẩm mỹ được cấp phép. Hành vi thực hiện và quảng cáo kỹ thuật xâm lấn (nâng mũi, cắt mí, hút mỡ, tiêm filler) là trái quy định Điều 19 Luật KCB 15/2023 và bị xử phạt theo Điều 39 Nghị định 117/2020/NĐ-CP (phạt 40 - 50 triệu đồng và đình chỉ).`
      : `Chưa tìm thấy Giấy phép hoạt động phẫu thuật thẩm mỹ của "${facilityName}" trong cơ sở dữ liệu y tế địa phương.`
  };
}
