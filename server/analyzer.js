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
  },
  {
    category: 'Quảng cáo KOLs/Reviewer không minh bạch',
    keywords: [
      'review có tâm', 'được tài trợ', 'bác sĩ ruột của mình', 'trải nghiệm dịch vụ tại', 
      'kols review', 'tiktoker review', 'nghệ sĩ tin dùng', 'diễn viên trải nghiệm'
    ],
    legalBasis: [
      'Điều 15a Luật Quảng cáo (sửa đổi hiệu lực 2026): Người chuyển tải sản phẩm quảng cáo (KOLs, KOCs) phải kiểm chứng hồ sơ pháp lý của cơ sở trước khi quảng bá và chịu trách nhiệm liên đới nếu quảng cáo sai sự thật.',
      'Khoản 3 Điều 15a Luật Quảng cáo (sửa đổi hiệu lực 2026): Bắt buộc phải thông báo rõ ràng cho người xem biết đây là nội dung quảng cáo (gắn nhãn #Ads/Quảng cáo).',
      'Nghị định số 147/2024/NĐ-CP: Tài khoản mạng xã hội đăng tải nội dung thương mại phải được xác thực danh tính; xử lý nghiêm hành vi tiếp tay cho dịch vụ y tế không phép.'
    ],
    severity: 'Cao',
    recommendations: [
      'Xác minh hợp đồng quảng cáo và trách nhiệm liên đới giữa cơ sở thẩm mỹ và người nổi tiếng (KOL/KOC)',
      'Yêu cầu gỡ bỏ video/bài viết và công khai đính chính nếu cơ sở chưa được cấp phép can thiệp xâm lấn',
      'Chuyển thông tin cho cơ quan thuế và cơ quan quản lý thông tin để xử lý nghĩa vụ thuế và vi phạm hành chính'
    ]
  }
];

/**
 * Danh mục nhận diện nội dung/dịch vụ liên quan đến THẨM MỸ Y TẾ & LÀM ĐẸP
 * Dùng để khoanh vùng trọng tâm, LOẠI BỎ 100% các chủ đề không liên quan (quần áo, ăn uống, đời sống...).
 */
export const COSMETIC_INDICATORS = [
  'thẩm mỹ', 'spa', 'phẫu thuật', 'tiêm', 'filler', 'botox', 'meso', 
  'nâng mũi', 'cắt mí', 'hút mỡ', 'nâng ngực', 'căng chỉ', 'gọt cằm', 
  'độn cằm', 'độn thái dương', 'cắt môi', 'truyền trắng', 'chăm sóc da', 
  'trẻ hóa', 'trị nám', 'trị mụn', 'bác sĩ thẩm mỹ', 'viện thẩm mỹ', 
  'phòng khám', 'clinic', 'beauty', 'làm đẹp', 'tiểu phẫu', 'đại phẫu',
  'bàn mổ', 'giảm béo', 'siết eo', 'cấy mỡ', 'nâng cung mày', 'bọc răng sứ',
  'nhấn mí', 'làm mũi', 'làm ngực', 'cắt da thừa', 'hút mỡ bụng', 'cấy phấn',
  'tạo hình', 'phun xăm', 'cắt da thừa', 'chỉnh hình'
];

/**
 * Kiểm tra xem bài viết hoặc trang có liên quan đến DỊCH VỤ THẨM MỸ hay không
 */
export function isCosmeticRelated(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return COSMETIC_INDICATORS.some(kw => lower.includes(kw));
}

/**
 * Analyzes post text, metadata, and media description (Heuristic Rule Engine)
 * Tập trung 100% vào dịch vụ thẩm mỹ, loại bỏ hoàn toàn nội dung lan man ngoài ngành.
 */
export function analyzeContent(post) {
  const text = ((post.content || '') + ' ' + (post.author || '') + ' ' + (post.title || '')).toLowerCase();
  
  // NGUYÊN TẮC TRỌNG TÂM: Chỉ thẩm định các bài viết hoặc trang có liên quan đến DỊCH VỤ THẨM MỸ.
  // Tuyệt đối không lan man sang các ngành nghề khác (quần áo, ăn uống, đời sống...).
  if (!isCosmeticRelated(text)) {
    return {
      isViolation: false,
      isCosmetic: false,
      category: 'Nội dung hợp lệ',
      severity: 'Bình thường',
      violationDetails: [],
      legalBasis: [],
      recommendations: [],
      matchedKeywords: []
    };
  }

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
      } else if (rule.category === 'Quảng cáo KOLs/Reviewer không minh bạch') {
        violationPoints.push(`Người ảnh hưởng/KOLs thực hiện quảng bá dịch vụ thẩm mỹ không gắn nhãn minh bạch hoặc tiếp tay cho cơ sở chưa được cấp phép (Điều 15a Luật Quảng cáo sửa đổi).`);
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
    isCosmetic: true,
    category: primaryCategory || 'Nội dung hợp lệ',
    severity: isViolation ? maxSeverity : 'Bình thường',
    violationDetails: violationPoints,
    legalBasis: [...new Set(legalBases)],
    recommendations: Array.from(recommendations),
    matchedKeywords: matchedRules.flatMap(r => r.matchedKeywords)
  };
}

/**
 * Mô hình AI Google Gemini phân tích bài viết, hình ảnh và video chuyên sâu về dịch vụ thẩm mỹ
 * Tập trung 100% vào vi phạm của các trang Fanpage, không lan man vào các vấn đề khác.
 */
export async function analyzeContentWithAi(post, options = {}) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  const model = options.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Nếu chưa cấu hình Gemini API Key, sử dụng bộ engine heuristic chuyên sâu
  if (!apiKey || !apiKey.trim()) {
    return analyzeContent(post);
  }

  // Pre-filter: Nếu bài viết hoàn toàn không có dấu hiệu liên quan đến thẩm mỹ
  const fullText = `${post.content || ''} ${post.author || ''}`.toLowerCase();
  if (!isCosmeticRelated(fullText) && !post.ocrText) {
    return {
      isViolation: false,
      isCosmetic: false,
      category: 'Nội dung hợp lệ',
      severity: 'Bình thường',
      violationDetails: [],
      legalBasis: [],
      recommendations: [],
      matchedKeywords: []
    };
  }

  try {
    const isPage = post.authorType === 'Page' || post.isPage;
    const cleanContent = (post.content || '').slice(0, 1500);

    const prompt = 
`Bạn là Trợ lý AI Chuyên gia Thanh tra Giám sát Y tế & Pháp luật Quảng cáo Dịch vụ Thẩm mỹ Việt Nam.
Căn cứ pháp lý:
- Luật Khám bệnh, chữa bệnh 15/2023/QH15 & Nghị định 96/2023/NĐ-CP (quy định nghiêm ngặt về cơ sở thẩm mỹ, cấm spa xâm lấn phẫu thuật).
- Luật Quảng cáo 16/2012/QH13 (cấm cam kết tuyệt đối 100%, vĩnh viễn, cấm quảng cáo KCB không phép).
- Nghị định 117/2020/NĐ-CP (Xử phạt Y tế) & Nghị định 38/2021/NĐ-CP (Xử phạt Quảng cáo, cấm dùng ảnh Before/After của người bệnh).
- Nghị định 147/2024/NĐ-CP & Điều 15a Luật Quảng cáo sửa đổi 2026 (trách nhiệm liên đới của KOLs/KOCs quảng cáo thẩm mỹ).

NHIỆM VỤ CỐT LÕI:
Thẩm định xem bài đăng sau có vi phạm các quy định pháp luật về QUẢNG CÁO DỊCH VỤ THẨM MỸ Y TẾ hay không.

QUY TẮC BẤT DI BẤT DỊCH (TẬP TRUNG VI PHẠM THẨM MỸ - KHÔNG LAN MAN SANG VẤN ĐỀ KHÁC):
1. CHỈ TẬP TRUNG VÀO DỊCH VỤ THẨM MỸ: Can thiệp xâm lấn cơ thể (tiêm filler/botox/meso, nâng mũi, cắt mí, hút mỡ, nâng ngực, căng chỉ, độn cằm...), cam kết kết quả sai sự thật, hình ảnh Before-After tại cơ sở làm đẹp.
2. TUYỆT ĐỐI KHÔNG BẮT LỖI LAN MAN: Bỏ qua hoàn toàn bài viết không liên quan đến thẩm mỹ (quần áo, mỹ phẩm bôi ngoài da thông thường, đồ gia dụng, ăn uống, đời sống cá nhân...). Dịch vụ làm đẹp không xâm lấn (gội đầu, chăm sóc da cơ bản, làm nail) là HỢP LỆ, trừ khi có tiêm chích/phẫu thuật hoặc cam kết chữa khỏi 100%.
3. ĐẶC BIỆT CHÚ Ý TRANG FANPAGE: ${isPage ? 'ĐÂY LÀ TRANG FANPAGE KINH DOANH DỊCH VỤ THẨM MỸ -> Kiểm tra kỹ tính hợp pháp của dịch vụ chào mời và giấy phép.' : 'Tài khoản cá nhân / Hội nhóm.'}

DỮ LIỆU ĐÁNH GIÁ:
- Tên Trang/Tác giả: "${post.author || 'Chưa xác định'}"
- Phân loại tài khoản: ${isPage ? 'Trang Fanpage' : 'Hội nhóm'}
- Định dạng: ${post.postType || 'Bài viết'}
- Nội dung bài đăng: """${cleanContent}"""
${post.ocrText ? `- Chữ đọc được từ ảnh/banner (OCR): """${post.ocrText}"""` : ''}

YÊU CẦU TRẢ VỀ:
Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm bất kỳ văn bản giải thích nào ngoài JSON):
{
  "isViolation": true hoặc false,
  "isCosmetic": true hoặc false,
  "category": "Quảng cáo dịch vụ thẩm mỹ trái phép" | "Cam kết hiệu quả không đúng" | "Sử dụng hình ảnh trước/sau sai sự thật" | "Thông tin không được cấp phép" | "Quảng cáo KOLs/Reviewer không minh bạch" | "Nội dung hợp lệ",
  "severity": "Cao" | "Trung bình" | "Thấp" | "Bình thường",
  "violationDetails": ["từng vi phạm cụ thể, ngắn gọn, súc tích"],
  "legalBasis": ["điều luật viện dẫn chính xác"],
  "recommendations": ["đề xuất xử lý hành chính"],
  "matchedKeywords": ["các từ ngữ/dịch vụ vi phạm được phát hiện"]
}`;

    // Payload for Gemini
    const contentsParts = [{ text: prompt }];

    // Optional: nếu bài viết có mediaUrl và chưa có ocrText, gửi kèm ảnh trực tiếp vào Gemini Multimodal Vision
    if (post.mediaUrl && !post.ocrText && typeof post.mediaUrl === 'string' && post.mediaUrl.startsWith('http')) {
      try {
        const imgRes = await fetch(post.mediaUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3500)
        });
        if (imgRes.ok) {
          const arrBuf = await imgRes.arrayBuffer();
          const b64 = Buffer.from(arrBuf).toString('base64');
          const mime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
          contentsParts.push({
            inline_data: { mime_type: mime, data: b64 }
          });
        }
      } catch {
        // Fetch image timeout/error -> proceed with text prompt
      }
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: contentsParts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!apiRes.ok) {
      return analyzeContent(post);
    }

    const data = await apiRes.json();
    const rawAiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON from Gemini response
    const jsonMatch = rawAiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return analyzeContent(post);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Nếu AI kết luận không liên quan thẩm mỹ thì không thể là vi phạm thẩm mỹ
    if (parsed.isCosmetic === false) {
      return {
        isViolation: false,
        isCosmetic: false,
        category: 'Nội dung hợp lệ',
        severity: 'Bình thường',
        violationDetails: [],
        legalBasis: [],
        recommendations: [],
        matchedKeywords: []
      };
    }

    return {
      isViolation: Boolean(parsed.isViolation),
      isCosmetic: true,
      category: parsed.category || VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
      severity: parsed.severity || (parsed.isViolation ? 'Cao' : 'Bình thường'),
      violationDetails: Array.isArray(parsed.violationDetails) ? parsed.violationDetails : [],
      legalBasis: Array.isArray(parsed.legalBasis) && parsed.legalBasis.length > 0 ? parsed.legalBasis : [
        'Điều 19, Điều 83 Luật Khám bệnh, chữa bệnh 15/2023/QH15',
        'Khoản 2 Điều 37 & Điều 38 Nghị định 96/2023/NĐ-CP',
        'Khoản 1 & Khoản 2 Điều 56 Nghị định 38/2021/NĐ-CP'
      ],
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : [
        'Lập biên bản vi phạm hành chính chuyển Thanh tra Sở Y tế kiểm tra đột xuất tại cơ sở',
        'Yêu cầu cơ sở gỡ bỏ ngay lập tức nội dung quảng cáo vi phạm trên Fanpage'
      ],
      matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
      aiAnalyzed: true
    };
  } catch (err) {
    console.warn('[Gemini AI Analyzer Warning, falling back to rule engine]:', err.message);
    return analyzeContent(post);
  }
}
