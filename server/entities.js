import { getViolations } from './db.js';
import { verifyFacilityLicense } from './licenseLookup.js';

/**
 * Trích xuất Số điện thoại hotline từ văn bản
 */
export function extractHotlines(text) {
  if (!text) return [];
  const regex = /(?:(?:\+84|0)[1-9]\d{8,9}|1900\s*\d{4}|1800\s*\d{4})/g;
  const matches = text.match(regex) || [];
  return Array.from(new Set(matches.map(m => m.replace(/\s+/g, ''))));
}

/**
 * Trích xuất Tỉnh/Thành phố hoặc Quận/Huyện từ văn bản
 */
export function extractLocation(text) {
  if (!text) return 'Chưa xác định';
  const cities = [
    'Hà Nội', 'TP.HCM', 'TP Hồ Chí Minh', 'Sài Gòn', 'Đà Nẵng', 'Hải Phòng', 
    'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Nghệ An', 'Thanh Hóa', 'Quảng Ninh',
    'Khánh Hòa', 'Nha Trang', 'Đắk Lắk', 'Buôn Ma Thuột', 'Lâm Đồng', 'Đà Lạt'
  ];

  for (const c of cities) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(text)) {
      if (c === 'TP Hồ Chí Minh' || c === 'Sài Gòn') return 'TP.HCM';
      return c;
    }
  }

  // Check District
  const districts = ['Quận 1', 'Quận 10', 'Quận 3', 'Quận 5', 'Quận 7', 'Cầu Giấy', 'Đống Đa', 'Ba Đình', 'Hai Bà Trưng', 'Thanh Xuân'];
  for (const d of districts) {
    if (new RegExp(`\\b${d}\\b`, 'i').test(text)) {
      return d;
    }
  }

  return 'Toàn quốc';
}

/**
 * Xây dựng danh sách Hồ sơ Thực thể Cơ sở & Sổ Đen Tái Phạm
 */
export function getEntityProfiles() {
  const violations = getViolations();
  const entityMap = new Map();

  for (const v of violations) {
    // Normalize entity brand name
    let brand = (v.author || 'Cơ sở Chưa định danh').trim();
    brand = brand.replace(/^(?:Trang|Hội|Nhóm|Review)\s+/i, '').trim();

    const hotlines = extractHotlines(`${v.content} ${v.author}`);
    const location = extractLocation(`${v.content} ${v.author}`);

    // Unique key: prefer brand, group by brand
    const key = brand.toLowerCase();

    if (!entityMap.has(key)) {
      entityMap.set(key, {
        id: `entity-${Math.abs(key.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
        name: brand,
        originalAuthor: v.author,
        authorType: v.authorType || (v.isGroup ? 'Group' : 'Page'),
        hotlines: new Set(),
        location,
        violationCount: 0,
        highSeverityCount: 0,
        estimatedTotalFine: 0,
        categories: new Set(),
        sampleUrls: [],
        firstDetected: v.timestamp || v.date,
        lastDetected: v.timestamp || v.date,
        sampleAvatar: v.avatar || v.mediaUrl
      });
    }

    const entity = entityMap.get(key);
    entity.violationCount += 1;
    if (v.severity === 'Cao') {
      entity.highSeverityCount += 1;
      entity.estimatedTotalFine += 35000000; // Mức phạt trung bình khung 30-40tr
    } else {
      entity.estimatedTotalFine += 15000000; // Mức phạt trung bình khung 10-20tr
    }

    hotlines.forEach(h => entity.hotlines.add(h));
    if (v.category) entity.categories.add(v.category);
    if (v.postUrl && entity.sampleUrls.length < 3) entity.sampleUrls.push(v.postUrl);
    if (v.timestamp) entity.lastDetected = v.timestamp;
  }

  // Convert map to array and add risk scoring & license verification
  const profiles = Array.from(entityMap.values()).map(e => {
    // Verify against licensed facilities
    const licenseCheck = verifyFacilityLicense(e.name, e.location);
    const isLicensed = licenseCheck.verified;

    // Determine Risk Level
    let riskLevel = 'CẦN THEO DÕI';
    let riskColor = 'blue';

    if (e.violationCount >= 3 || (!isLicensed && e.highSeverityCount >= 1)) {
      riskLevel = 'CỰC KỲ NGUY HIỂM (TÁI PHẠM)';
      riskColor = 'red';
    } else if (e.highSeverityCount >= 1 || e.violationCount >= 2) {
      riskLevel = 'RỦI RO CAO';
      riskColor = 'amber';
    }

    return {
      id: e.id,
      name: e.name,
      authorType: e.authorType,
      hotlines: Array.from(e.hotlines),
      location: e.location,
      violationCount: e.violationCount,
      highSeverityCount: e.highSeverityCount,
      estimatedTotalFine: e.estimatedTotalFine,
      formattedFine: `${(e.estimatedTotalFine / 1000000).toLocaleString('vi-VN')} triệu VNĐ`,
      categories: Array.from(e.categories),
      sampleUrls: e.sampleUrls,
      sampleAvatar: e.sampleAvatar,
      firstDetected: e.firstDetected,
      lastDetected: e.lastDetected,
      isLicensed,
      licenseDetails: licenseCheck.facility || null,
      licenseStatus: isLicensed ? 'ĐÃ ĐƯỢC CẤP PHÉP' : 'CHƯA CÓ GIẤY PHÉP (NGUY CƠ CHUI)',
      riskLevel,
      riskColor
    };
  });

  // Sort by highest risk and highest violation count first
  profiles.sort((a, b) => b.violationCount - a.violationCount || b.highSeverityCount - a.highSeverityCount);

  return profiles;
}

/**
 * Trích xuất danh sách Sổ Đen các cơ sở có nguy cơ cao nhất
 */
export function getBlacklistEntities() {
  const all = getEntityProfiles();
  return all.filter(e => e.riskLevel.includes('CỰC KỲ NGUY HIỂM') || e.riskLevel.includes('RỦI RO CAO'));
}
