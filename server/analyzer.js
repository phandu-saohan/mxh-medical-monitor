/**
 * Legal Compliance Rule Engine for Healthcare and Medical Advertising Monitoring
 * Based on:
 * - Luật Khám bệnh, chữa bệnh số 15/2023/QH15
 * - Luật Quảng cáo số 16/2012/QH13
 * - Nghị định 117/2020/NĐ-CP (Xử phạt vi phạm hành chính trong lĩnh vực y tế)
 * - Nghị định 38/2021/NĐ-CP (Xử phạt vi phạm hành chính trong lĩnh vực văn hóa và quảng cáo)
 */

export const VIOLATION_CATEGORIES = {
  UNAUTHORIZED_COSMETIC_SURGERY: 'Quảng cáo dịch vụ thẩm mỹ trái phép',
  FALSE_EFFICACY_PROMISE: 'Cam kết hiệu quả không đúng',
  FAKE_BEFORE_AFTER: 'Sử dụng hình ảnh trước/sau sai sự thật',
  UNLICENSED_INFO: 'Thông tin không được cấp phép',
  OTHER: 'Khác'
};

export const LEGAL_RULES = [
  {
    category: VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
    keywords: [
      'nâng mũi', 'cắt mí', 'hút mỡ', 'tiêm filler', 'tiêm botox', 
      'nâng ngực', 'căng da chỉ', 'căng chỉ collagen', 'tiêm meso', 
      'gọt cằm', 'độn thái dương', 'tiêm tan mỡ', 'phẫu thuật thẩm mỹ', 
      'nâng cung mày', 'bóc mỡ mắt', 'tạo hình thành bụng', 'truyền trắng'
    ],
    exemptions: ['bệnh viện đa khoa', 'bệnh viện thẩm mỹ', 'phòng khám chuyên khoa thẩm mỹ'],
    legalBasis: [
      'Điều 19, 83 Luật Khám bệnh, chữa bệnh số 15/2023/QH15: Dịch vụ phẫu thuật, can thiệp xâm lấn chỉ được thực hiện tại cơ sở KCB được cấp giấy phép hoạt động.',
      'Điều 39 Nghị định 117/2020/NĐ-CP: Phạt 40 - 50 triệu đồng đối với hành vi cung cấp dịch vụ khám bệnh, chữa bệnh mà không có giấy phép hoạt động.',
      'Khoản 1 Điều 56 Nghị định 38/2021/NĐ-CP: Phạt 30 - 40 triệu đồng đối với hành vi quảng cáo dịch vụ khám bệnh, chữa bệnh khi chưa có giấy phép hoạt động.'
    ],
    severity: 'Cao',
    recommendations: [
      'Gửi văn bản cảnh báo cho nền tảng mạng xã hội (Facebook)',
      'Liên hệ yêu cầu gỡ bỏ ngay nội dung quảng cáo vi phạm',
      'Xác minh thông tin đăng ký kinh doanh và giấy phép cơ sở/đơn vị',
      'Lập hồ sơ chuyển Thanh tra Sở Y tế kiểm tra đột xuất tại địa chỉ cơ sở'
    ]
  },
  {
    category: VIOLATION_CATEGORIES.FALSE_EFFICACY_PROMISE,
    keywords: [
      'cam kết 100%', 'cam kết khỏi', 'vĩnh viễn', 'không sưng không đau', 
      'đẹp ngay sau khi làm', 'chữa dứt điểm 100%', 'khỏi hẳn sau 1 liệu trình', 
      'trẻ hóa tức thì 10 tuổi', 'hiệu quả trọn đời', 'không biến chứng', 'an toàn tuyệt đối',
      'hồi sinh làn da 100%', 'đánh bay nám vĩnh viễn'
    ],
    legalBasis: [
      'Khoản 9 Điều 8 Luật Quảng cáo số 16/2012/QH13: Nghiêm cấm quảng cáo không đúng hoặc gây nhầm lẫn về khả năng kinh doanh, khả năng cung cấp sản phẩm, hàng hóa, dịch vụ.',
      'Khoản 2 Điều 34 Nghị định 38/2021/NĐ-CP: Phạt tiền từ 10 - 20 triệu đồng đối với hành vi quảng cáo có sử dụng các từ ngữ mang tính cam kết khẳng định tuyệt đối mà không có tài liệu chứng minh.'
    ],
    severity: 'Trung bình',
    recommendations: [
      'Yêu cầu cơ sở cung cấp chứng nhận kiểm định lâm sàng hoặc tài liệu khoa học chứng minh',
      'Lập biên bản yêu cầu đính chính thông tin gây ngộ nhận cho người tiêu dùng',
      'Khuyến cáo người dân cảnh giác với các cam kết quá đà trên mạng xã hội'
    ]
  },
  {
    category: VIOLATION_CATEGORIES.FAKE_BEFORE_AFTER,
    keywords: [
      'trước và sau', 'before after', 'hình ảnh thực tế khách hàng', 
      'khách hàng sau 7 ngày', 'thay đổi ngoạn mục', 'hình ảnh feedback', 
      'ảnh khách vừa làm xong', 'feedback khách làm'
    ],
    legalBasis: [
      'Khoản 1 Điều 56 Nghị định 38/2021/NĐ-CP & Thông tư 09/2015/TT-BYT: Cấm sử dụng hình ảnh, thư cảm ơn, lời cảm ơn của người bệnh để quảng cáo dịch vụ khám bệnh, chữa bệnh.',
      'Khoản 5 Điều 51 Nghị định 38/2021/NĐ-CP: Phạt tiền từ 20 - 30 triệu đồng đối với hành vi sử dụng hình ảnh mang tính so sánh phóng đại hiệu quả trước và sau khi can thiệp.'
    ],
    severity: 'Trung bình',
    recommendations: [
      'Xác minh tính xác thực của hình ảnh với người mẫu/bệnh nhân',
      'Kiểm tra hành vi chỉnh sửa ảnh (Photoshop/AI) làm sai lệch kết quả thực tế',
      'Yêu cầu gỡ bỏ hình ảnh bệnh nhân chưa được cho phép hoặc trái quy định'
    ]
  },
  {
    category: VIOLATION_CATEGORIES.UNLICENSED_INFO,
    keywords: [
      'bác sĩ chuyên khoa', 'chuyên gia hàng đầu', 'bác sĩ tu nghiệp hàn quốc', 
      'thiết bị đạt chuẩn fda', 'phòng mổ vô trùng quốc tế', 'viện thẩm mỹ quốc tế', 
      'chuyển giao công nghệ hoa kỳ', 'bác sĩ thẩm mỹ 20 năm kinh nghiệm'
    ],
    legalBasis: [
      'Điều 20 Luật Quảng cáo số 16/2012/QH13: Quảng cáo dịch vụ khám bệnh, chữa bệnh phải có giấy phép hoạt động và chứng chỉ hành nghề của người hành nghề.',
      'Điều 56 Nghị định 38/2021/NĐ-CP: Phạt tiền từ 15 - 20 triệu đồng đối với hành vi quảng cáo dịch vụ KCB mà không ghi rõ số giấy phép hoạt động khám bệnh, chữa bệnh, phạm vi hoạt động chuyên môn.',
      'Điều 40 Nghị định 117/2020/NĐ-CP: Xử phạt hành vi mạo danh bác sĩ hoặc sử dụng chứng chỉ hành nghề giả.'
    ],
    severity: 'Cao',
    recommendations: [
      'Tra cứu Cơ sở dữ liệu Quốc gia về người hành nghề khám chữa bệnh để xác minh danh tính bác sĩ',
      'Kiểm tra giấy phép phòng khám và danh mục kỹ thuật được Sở Y tế phê duyệt',
      'Phối hợp với Công an địa phương nếu phát hiện hành vi giả mạo danh xưng bác sĩ'
    ]
  }
];

/**
 * Analyzes post text, metadata, and media description
 * Returns violation status, matched categories, detailed points, legal basis, severity, and recommendations
 */
export function analyzeContent(post) {
  const text = ((post.content || '') + ' ' + (post.author || '') + ' ' + (post.title || '')).toLowerCase();
  
  const matchedRules = [];
  const violationPoints = [];
  const legalBases = [];
  const recommendations = new Set();
  let maxSeverity = 'Thấp';

  // Check if text already mentions licensed hospital/clinic credentials
  const hasValidLicenseMention = /gphđ số|giấy phép hoạt động số|chứng chỉ hành nghề số/i.test(text);

  for (const rule of LEGAL_RULES) {
    const matchedKws = rule.keywords.filter(kw => text.includes(kw.toLowerCase()));
    
    if (matchedKws.length > 0) {
      matchedRules.push({
        category: rule.category,
        matchedKeywords: matchedKws,
        severity: rule.severity
      });

      if (rule.category === VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY) {
        violationPoints.push(`Quảng cáo dịch vụ can thiệp xâm lấn (${matchedKws.slice(0, 3).join(', ')}) thuộc danh mục dịch vụ phẫu thuật thẩm mỹ phải được cấp phép KCB.`);
        if (!hasValidLicenseMention) {
          violationPoints.push(`Cơ sở không công khai số Giấy phép hoạt động (GPHĐ) khám bệnh, chữa bệnh theo quy định.`);
        }
      } else if (rule.category === VIOLATION_CATEGORIES.FALSE_EFFICACY_PROMISE) {
        violationPoints.push(`Cam kết hiệu quả tuyệt đối, không đúng sự thật ("${matchedKws.slice(0, 2).join('", "')}") gây ngộ nhận cho người tiếp cận.`);
      } else if (rule.category === VIOLATION_CATEGORIES.FAKE_BEFORE_AFTER) {
        violationPoints.push(`Sử dụng hình ảnh so sánh trước/sau can thiệp thẩm mỹ trái với quy định tại Nghị định 38/2021/NĐ-CP.`);
      } else if (rule.category === VIOLATION_CATEGORIES.UNLICENSED_INFO) {
        violationPoints.push(`Quảng bá danh xưng chuyên gia/bác sĩ, công nghệ chuẩn quốc tế mà không có số hiệu giấy phép kiểm chứng.`);
      }

      rule.legalBasis.forEach(lb => legalBases.push(lb));
      rule.recommendations.forEach(rec => recommendations.add(rec));

      if (rule.severity === 'Cao') {
        maxSeverity = 'Cao';
      } else if (rule.severity === 'Trung bình' && maxSeverity !== 'Cao') {
        maxSeverity = 'Trung bình';
      }
    }
  }

  const isViolation = matchedRules.length > 0;
  const primaryCategory = isViolation ? matchedRules[0].category : null;

  return {
    isViolation,
    category: primaryCategory || 'Nội dung hợp lệ',
    severity: isViolation ? maxSeverity : 'Bình thường',
    violationDetails: violationPoints,
    legalBasis: [...new Set(legalBases)],
    recommendations: Array.from(recommendations),
    matchedKeywords: matchedRules.flatMap(r => r.matchedKeywords)
  };
}
