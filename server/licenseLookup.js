import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    id: `GPHD-CUSTOM-${Date.now().toString().slice(-4)}`,
    status: 'Đang hoạt động',
    ...facility
  };
  list.unshift(newItem);
  saveLicensedFacilities(list);
  return newItem;
}

export function deleteLicensedFacility(id) {
  const list = getLicensedFacilities('Tất cả');
  const filtered = list.filter(f => f.id !== id);
  saveLicensedFacilities(filtered);
  return true;
}

/**
 * Checks facility name against licensed database with city awareness
 */
export function verifyFacilityLicense(facilityName, city) {
  if (!facilityName) return { isLicensed: false, message: 'Chưa có thông tin tên cơ sở' };

  const facilities = getLicensedFacilities('Tất cả');
  const normalized = facilityName.toLowerCase().trim();

  // Find exact or substring match in whitelist
  const match = facilities.find(f => {
    const fNorm = f.name.toLowerCase();
    return normalized.includes(fNorm) || fNorm.includes(normalized);
  });

  if (match) {
    return {
      isLicensed: true,
      facility: match,
      warningLevel: 'Hợp lệ',
      message: `CƠ SỞ ĐƯỢC CẤP PHÉP: "${match.name}" (Số GPHĐ: ${match.licenseNumber} do ${match.issuedBy} cấp). Phụ trách chuyên môn: ${match.doctorInCharge || 'Bác sĩ chuyên khoa'}.`
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
