/**
 * Legal Compliance Rule Engine for Healthcare and Medical Advertising Monitoring in Vietnam
 * Căn cứ pháp lý cập nhật mới nhất:
 * - Luật Khám bệnh, chữa bệnh số 15/2023/QH15 (Có hiệu lực từ 01/01/2024)
 * - Nghị định số 96/2023/NĐ-CP quy định chi tiết Luật Khám bệnh, chữa bệnh 2023
 * - Luật Quảng cáo số 16/2012/QH13
 * - Nghị định số 117/2020/NĐ-CP & Nghị định số 124/2021/NĐ-CP (Xử phạt VPHC trong lĩnh vực Y tế)
 * - Nghị định số 38/2021/NĐ-CP & Nghị định số 128/2022/NĐ-CP (Xử phạt VPHC trong lĩnh vực Văn hóa & Quảng cáo)
 * - Cơ chế chuyển đổi từ tiền kiểm sang HẬU KIỂM toàn diện trên không gian mạng
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
      'nâng cung mày', 'bóc mỡ mắt', 'tạo hình thành bụng', 'truyền trắng',
      'cắt môi trái tim', 'độn cằm vline', 'cấy mỡ tự thân', 'hút mỡ siết eo'
    ],
    exemptions: ['bệnh viện đa khoa', 'bệnh viện thẩm mỹ', 'phòng khám chuyên khoa thẩm mỹ'],
    legalBasis: [
      'Điều 19, Điều 83 Luật Khám bệnh, chữa bệnh số 15/2023/QH15: Nghiêm cấm quảng cáo dịch vụ KCB khi chưa có Giấy phép hoạt động hoặc vượt quá phạm vi chuyên môn được phê duyệt.',
      'Khoản 2 Điều 37 & Điều 38 Nghị định số 96/2023/NĐ-CP: Cơ sở dịch vụ thẩm mỹ (spa, chăm sóc da) KHÔNG ĐƯỢC phép thực hiện hoặc quảng cáo dịch vụ can thiệp xâm lấn (tiêm, truyền, phẫu thuật, thủ thuật dùng thuốc gây tê dạng tiêm).',
      'Khoản 6 Điều 39 Nghị định số 117/2020/NĐ-CP (sửa đổi bởi NĐ 124/2021/NĐ-CP): Phạt tiền từ 40 - 50 triệu đồng và đình chỉ hoạt động 12 - 24 tháng đối với hành vi cung cấp dịch vụ KCB không có giấy phép hoặc vượt quá phạm vi.',
      'Khoản 1 & Khoản 2 Điều 56 Nghị định số 38/2021/NĐ-CP: Phạt tiền từ 30 - 40 triệu đồng đối với hành vi quảng cáo dịch vụ KCB khi chưa có giấy phép hoặc vượt quá phạm vi chuyên môn; buộc tháo gỡ/xóa quảng cáo.'
    ],
    severity: 'Cao',
    recommendations: [
      'Lập biên bản vi phạm hành chính chuyển Thanh tra Sở Y tế kiểm tra đột xuất tại cơ sở',
      'Yêu cầu cơ sở gỡ bỏ ngay lập tức nội dung quảng cáo vi phạm trên trang mạng xã hội',
      'Đình chỉ hoạt động dịch vụ thẩm mỹ xâm lấn trái phép theo quy định tại Nghị định 117/2020/NĐ-CP',
      'Chuyển cơ quan Công an và Quản lý thị trường phối hợp nếu có dấu hiệu hành nghề y trái phép gây hậu quả nghiêm trọng'
    ]
  },
  {
    category: VIOLATION_CATEGORIES.FALSE_EFFICACY_PROMISE,
    keywords: [
      'cam kết 100%', 'cam kết khỏi', 'vĩnh viễn', 'không sưng không đau', 
      'đẹp ngay sau khi làm', 'chữa dứt điểm 100%', 'khỏi hẳn sau 1 liệu trình', 
      'trẻ hóa tức thì 10 tuổi', 'hiệu quả trọn đời', 'không biến chứng', 'an toàn tuyệt đối',
      'hồi sinh làn da 100%', 'đánh bay nám vĩnh viễn', 'không đau 100%', 'đẹp tự nhiên trọn đời'
    ],
    legalBasis: [
      'Khoản 9 Điều 8 Luật Quảng cáo số 16/2012/QH13: Nghiêm cấm quảng cáo không đúng hoặc gây nhầm lẫn về khả năng kinh doanh, khả năng cung cấp sản phẩm, dịch vụ.',
      'Khoản 2 Điều 34 Nghị định số 38/2021/NĐ-CP: Phạt tiền từ 10 - 20 triệu đồng đối với hành vi quảng cáo sử dụng các từ ngữ mang tính cam kết khẳng định tuyệt đối mà không có tài liệu chứng minh hợp pháp.',
      'Nghị định số 96/2023/NĐ-CP: Mọi thông tin y tế, điều trị phải đảm bảo tính khoa học, khách quan, không được cam kết kết quả điều trị tuyệt đối.'
    ],
    severity: 'Trung bình',
    recommendations: [
      'Yêu cầu cơ sở xuất trình bằng chứng kiểm định lâm sàng hoặc tài liệu khoa học được Bộ Y tế công nhận',
      'Buộc cải chính thông tin công khai trên Fanpage/Kênh truyền thông đã đăng tải',
      'Xử phạt hành chính hành vi quảng cáo gây ngộ nhận cho người tiếp cận dịch vụ'
    ]
  },
  {
    category: VIOLATION_CATEGORIES.FAKE_BEFORE_AFTER,
    keywords: [
      'trước và sau', 'before after', 'hình ảnh thực tế khách hàng', 
      'khách hàng sau 7 ngày', 'thay đổi ngoạn mục', 'hình ảnh feedback', 
      'ảnh khách vừa làm xong', 'feedback khách làm', 'lột xác ngoạn mục', 'ảnh chụp tại bàn mổ'
    ],
    legalBasis: [
      'Khoản 1 Điều 56 Nghị định số 38/2021/NĐ-CP: Nghiêm cấm sử dụng hình ảnh, thư cảm ơn, lời cảm ơn của người bệnh để quảng cáo dịch vụ khám bệnh, chữa bệnh.',
      'Khoản 5 Điều 51 Nghị định số 38/2021/NĐ-CP: Phạt tiền từ 20 - 30 triệu đồng đối với hành vi sử dụng hình ảnh mang tính so sánh phóng đại hiệu quả trước và sau khi can thiệp.',
      'Quy định bảo vệ dữ liệu cá nhân y tế tại Luật KCB 15/2023/QH15: Không được sử dụng hình ảnh hồ sơ bệnh án hoặc hình ảnh riêng tư của khách hàng/người bệnh khi chưa có sự đồng ý bằng văn bản.'
    ],
    severity: 'Trung bình',
    recommendations: [
      'Xác minh tính xác thực của hình ảnh khách hàng; kiểm tra hành vi chỉnh sửa ảnh bằng phần mềm hoặc AI',
      'Buộc gỡ bỏ hình ảnh bệnh nhân/khách hàng khỏi toàn bộ các nền tảng số',
      'Lập biên bản xử phạt theo Khoản 1 Điều 56 Nghị định 38/2021/NĐ-CP'
    ]
  },
  {
    category: VIOLATION_CATEGORIES.UNLICENSED_INFO,
    keywords: [
      'bác sĩ chuyên khoa', 'chuyên gia hàng đầu', 'bác sĩ tu nghiệp hàn quốc', 
      'thiết bị đạt chuẩn fda', 'phòng mổ vô trùng quốc tế', 'viện thẩm mỹ quốc tế', 
      'chuyển giao công nghệ hoa kỳ', 'bác sĩ thẩm mỹ 20 năm kinh nghiệm', 'chuyên gia phẫu thuật',
      'đào tạo học viên cấp bằng', 'chuyển giao công nghệ thẩm mỹ'
    ],
    legalBasis: [
      'Điều 20 Luật Quảng cáo số 16/2012/QH13: Quảng cáo dịch vụ khám bệnh, chữa bệnh phải có Giấy phép hoạt động và Chứng chỉ hành nghề / Giấy phép hành nghề của người hành nghề.',
      'Khoản 4 Điều 56 Nghị định số 38/2021/NĐ-CP: Phạt tiền từ 15 - 20 triệu đồng đối với hành vi quảng cáo dịch vụ KCB mà không thể hiện đầy đủ tên cơ sở, địa chỉ, số giấy phép hoạt động khám bệnh, chữa bệnh và phạm vi hoạt động chuyên môn.',
      'Điều 40 Nghị định số 117/2020/NĐ-CP (sửa đổi bởi NĐ 124/2021/NĐ-CP): Xử phạt hành vi mạo danh bác sĩ, sử dụng danh xưng chuyên gia y tế trái phép hoặc sử dụng giấy phép giả mạo.'
    ],
    severity: 'Cao',
    recommendations: [
      'Đối soát qua Cổng thông tin Quản lý người hành nghề khám chữa bệnh của Bộ Y tế / Sở Y tế địa phương',
      'Kiểm tra tính pháp lý của danh xưng "Viện Thẩm Mỹ Quốc Tế" hoặc "Bệnh Viện Thẩm Mỹ"',
      'Chuyển cơ quan điều tra nếu phát hiện hành vi làm giả bằng cấp, chứng chỉ hành nghề y tế'
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
