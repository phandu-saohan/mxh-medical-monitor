/**
 * AI Keyword Suggestion Engine for Medical Compliance Monitoring
 * Generates keywords, evasion tactics, and aesthetic medical slang
 */

const AI_THEME_TEMPLATES = {
  evasion: [
    { term: 'f.i.l.l.e.r chuẩn auth', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Chèn dấu chấm để lách bộ lọc từ cấm của Facebook/TikTok.' },
    { term: 't.i.ê.m tan mỡ', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Viết cách chữ để tránh bot quét từ khóa tiêm chích trái phép.' },
    { term: 'b.o.t.o.x gọn hàm', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Biến thể lách quét botox độc tố botulinum nhóm thuốc kiểm soát đặc biệt.' },
    { term: 'mổ dạo tại gia', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Dịch vụ bác sĩ mổ không cố định, trốn tránh thanh tra y tế.' },
    { term: 'tiểu phẫu kín đáo', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Thuật ngữ ngụy trang cho phẫu thuật thẩm mỹ xâm lấn không phép.' },
    { term: 'cấy tinh chất hoa hồng', category: 'Tiếng lóng & Lách luật', risk: 'Trung bình', explanation: 'Ngụy trang cho dịch vụ tiêm meso/chất làm đầy không rõ nguồn gốc.' },
    { term: 'nâng cung mày giấu chỉ', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Dịch vụ phẫu thuật cắt da vùng mắt đội lốt thẩm mỹ nhẹ nhàng.' }
  ],
  injection: [
    { term: 'tiêm tai tài lộc phong thủy', category: 'Can thiệp tiêm chích', risk: 'Cao', explanation: 'Dịch vụ tiêm lượng lớn filler vào vành tai gây nguy cơ hoại tử mạch máu.' },
    { term: 'tiêm môi baby tạ đính', category: 'Can thiệp tiêm chích', risk: 'Cao', explanation: 'Tiêm tạo hình môi cánh én không đúng kỹ thuật tại cơ sở spa.' },
    { term: 'tiêm tan mỡ nọng cằm cấp tốc', category: 'Can thiệp tiêm chích', risk: 'Cao', explanation: 'Sử dụng thuốc tiêm tan mỡ chưa được Bộ Y tế cấp phép lưu hành.' },
    { term: 'cấy chỉ vàng collagen 24k', category: 'Can thiệp tiêm chích', risk: 'Cao', explanation: 'Can thiệp xâm lấn căng da luồn chỉ dưới da trái phép.' },
    { term: 'tiêm meso noãn thực vật', category: 'Can thiệp tiêm chích', risk: 'Cao', explanation: 'Thuốc tiêm mesotherapy trôi nổi, nguy cơ nhiễm trùng u hạt.' },
    { term: 'tiêm làm đầy rãnh cười', category: 'Can thiệp tiêm chích', risk: 'Cao', explanation: 'Vùng tam giác nguy hiểm trên mặt, tiêm sai kỹ thuật có thể gây mù mắt.' }
  ],
  surgery: [
    { term: 'cắt mí mắt babydoll giấu sẹo', category: 'Phẫu thuật xâm lấn', risk: 'Cao', explanation: 'Phẫu thuật tạo hình nếp mí thuộc kỹ thuật phẫu thuật ngoại khoa.' },
    { term: 'nâng mũi bán cấu trúc sụn tai', category: 'Phẫu thuật xâm lấn', risk: 'Cao', explanation: 'Thao tác lấy sụn vành tai là phẫu thuật xâm lấn chỉ BV/PKCK được làm.' },
    { term: 'thu gọn cánh mũi mini', category: 'Phẫu thuật xâm lấn', risk: 'Cao', explanation: 'Can thiệp cắt rạch mô cánh mũi gây chảy máu và sẹo co rút.' },
    { term: 'bóc tách bọng mỡ mắt dưới', category: 'Phẫu thuật xâm lấn', risk: 'Cao', explanation: 'Đại phẫu mí mắt dưới dễ gây lật mi, tổn thương cơ vòng mi.' },
    { term: 'độn cằm v-line sụn silicon', category: 'Phẫu thuật xâm lấn', risk: 'Cao', explanation: 'Rạch khoang niêm mạc miệng đặt chất liệu độn nhân tạo.' },
    { term: 'gọt góc hàm hạ gò má', category: 'Phẫu thuật xâm lấn', risk: 'Cao', explanation: 'Đại phẫu xương sọ mặt bắt buộc phải gây mê tại bệnh viện đa khoa.' }
  ],
  major_surgery: [
    { term: 'hút mỡ siết eo tạo rãnh bụng', category: 'Phẫu thuật đại phẫu', risk: 'Cao', explanation: 'Hút mỡ là đại phẫu có nguy cơ thuyên tắc mạch phổi tử vong cao nhất.' },
    { term: 'nâng ngực nano chip công nghệ hoa kỳ', category: 'Phẫu thuật đại phẫu', risk: 'Cao', explanation: 'Phải thực hiện tại BV có khoa hồi sức cấp cứu, spa quảng cáo là trái phép.' },
    { term: 'tạo hình thành bụng sau sinh', category: 'Phẫu thuật đại phẫu', risk: 'Cao', explanation: 'Cắt bỏ vạt da mỡ thừa và khâu cơ thẳng bụng, xâm lấn rất lớn.' },
    { term: 'hút mỡ bắp tay bắp đùi', category: 'Phẫu thuật đại phẫu', risk: 'Cao', explanation: 'Thao tác luồn canuyn phá vỡ tế bào mỡ nguy hiểm ngoài bệnh viện.' }
  ],
  banned_substances: [
    { term: 'truyền trắng noãn cá tuyết', category: 'Chất cấm/Chưa cấp phép', risk: 'Cao', explanation: 'Chất truyền tĩnh mạch làm trắng da chưa từng được Bộ Y tế cấp phép.' },
    { term: 'truyền trắng phi thuyền hoàng gia', category: 'Chất cấm/Chưa cấp phép', risk: 'Cao', explanation: 'Quảng bá kết hợp truyền dịch tĩnh mạch và máy ánh sáng lừa dối người dân.' },
    { term: 'cấy phấn nano thay thế kem nền', category: 'Chất cấm/Chưa cấp phép', risk: 'Cao', explanation: 'Đưa phẩm màu và titan dioxit vào trung bì da gây bít tắc, viêm nang lông.' },
    { term: 'tế bào gốc sống trẻ hóa 20 tuổi', category: 'Chất cấm/Chưa cấp phép', risk: 'Cao', explanation: 'Mạo danh công nghệ tế bào gốc để lừa đảo người tiêu dùng.' }
  ],
  student_traps: [
    { term: 'nâng mũi giá học sinh sinh viên', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Đánh vào tâm lý giá rẻ của giới trẻ để thực hiện mổ chui giá vài trăm ngàn.' },
    { term: 'tiêm filler cằm 299k', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Giá rẻ bất thường, thường dùng silicon lỏng độc hại bị cấm.' },
    { term: 'cắt mí bao bảo hành trọn đời', category: 'Cam kết sai sự thật', risk: 'Trung bình', explanation: 'Cam kết gian dối vi phạm Khoản 9 Điều 8 Luật Quảng cáo.' },
    { term: 'tuyển mẫu nâng mũi miễn phí', category: 'Tiếng lóng & Lách luật', risk: 'Cao', explanation: 'Chiêu trò dụ dỗ người làm chuột bạch cho thợ spa thực hành tay nghề.' }
  ]
};

export async function generateAiKeywords({ prompt = '', theme = 'evasion', count = 8 }) {
  // Check if user has Google Gemini API Key configured in env
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const systemInstruction = `Bạn là chuyên gia Thanh tra Y tế Việt Nam chuyên giám sát mạng xã hội. 
Nhiệm vụ của bạn là phân tích và sinh ra các từ khóa tìm kiếm trên Facebook/TikTok mà các spa, thẩm mỹ viện "chui" thường dùng để quảng cáo phẫu thuật xâm lấn trái phép, lách luật, cam kết sai sự thật hoặc dùng tiếng lóng.
Căn cứ: Luật Khám bệnh chữa bệnh 15/2023 và Nghị định 117/2020/NĐ-CP.
Trả về định dạng JSON array với các trường:
[{"term": "tên từ khóa", "category": "danh mục (Phẫu thuật xâm lấn / Can thiệp tiêm chích / Tiếng lóng & Lách luật / Chất cấm/Chưa cấp phép / Phẫu thuật đại phẫu / Cam kết sai sự thật)", "risk": "Cao hoặc Trung bình", "explanation": "giải thích ngắn gọn thủ đoạn"}]`;

      const userQuery = `Chủ đề hoặc yêu cầu: ${prompt || theme}. Hãy gợi ý ${count} từ khóa tiếng Việt độc đáo, sát thực tế mạng xã hội.`;

      const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\n${userQuery}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[AI Keywords] Lỗi gọi Gemini API, chuyển sang Heuristic AI Engine:', e.message);
    }
  }

  // Fallback to Heuristic Contextual AI Generator with diverse themes
  let pool = [];
  if (theme && AI_THEME_TEMPLATES[theme]) {
    pool = [...AI_THEME_TEMPLATES[theme]];
  } else {
    // Combine multiple pools based on prompt keywords
    const p = (prompt || '').toLowerCase();
    if (p.includes('tiêm') || p.includes('filler') || p.includes('botox')) {
      pool.push(...AI_THEME_TEMPLATES.injection);
    }
    if (p.includes('mũi') || p.includes('mí') || p.includes('mổ') || p.includes('xâm lấn')) {
      pool.push(...AI_THEME_TEMPLATES.surgery);
    }
    if (p.includes('hút mỡ') || p.includes('ngực') || p.includes('đại phẫu')) {
      pool.push(...AI_THEME_TEMPLATES.major_surgery);
    }
    if (p.includes('lách') || p.includes('tiếng lóng') || p.includes('chấm')) {
      pool.push(...AI_THEME_TEMPLATES.evasion);
    }
    if (p.includes('trắng') || p.includes('cấm') || p.includes('tế bào gốc')) {
      pool.push(...AI_THEME_TEMPLATES.banned_substances);
    }
    if (p.includes('sinh viên') || p.includes('giá rẻ') || p.includes('mẫu')) {
      pool.push(...AI_THEME_TEMPLATES.student_traps);
    }

    if (pool.length === 0) {
      pool = [
        ...AI_THEME_TEMPLATES.evasion,
        ...AI_THEME_TEMPLATES.injection,
        ...AI_THEME_TEMPLATES.surgery,
        ...AI_THEME_TEMPLATES.student_traps
      ];
    }
  }

  // Shuffle and slice
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
