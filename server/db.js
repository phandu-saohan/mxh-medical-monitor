import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeContent, VIOLATION_CATEGORIES } from './analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const VIOLATIONS_FILE = path.join(DATA_DIR, 'violations.json');
const KEYWORDS_FILE = path.join(DATA_DIR, 'keywords.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic seed items matching the user's mockup
const INITIAL_VIOLATIONS = [
  {
    id: 'vio-001',
    timestamp: '06/10/2025 09:42',
    date: '2025-10-06T09:42:00',
    platform: 'Facebook',
    author: 'Thẩm mỹ Viện Ngọc Ánh',
    authorHandle: '@ngocanh.beauty',
    followers: '12.5K',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Nâng mũi cấu trúc chỉ 45 phút, đẹp ngay sau khi làm! Cam kết không đau, không sưng! 💯 Đăng ký ngay để được tư vấn miễn phí!',
    postType: 'Video',
    postUrl: 'https://www.facebook.com/ngocanh.beauty/posts/123456789',
    mediaUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    videoDuration: '00:45',
    engagement: { likes: 1240, comments: 342, shares: 89 },
    category: VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
    status: 'Chờ xử lý', // 'Chờ xử lý' | 'Đã xác minh' | 'Đã xử lý'
    severity: 'Cao',
    violationDetails: [
      'Quảng cáo dịch vụ nâng mũi (thuộc danh mục dịch vụ phẫu thuật thẩm mỹ phải được cấp phép KCB)',
      'Cam kết hiệu quả ("đẹp ngay", "không đau, không sưng")',
      'Không có thông tin giấy phép hoạt động khám chữa bệnh'
    ],
    legalBasis: [
      'Điều 19, 83 Luật Khám bệnh, chữa bệnh số 15/2023/QH15',
      'Điều 39 Nghị định 117/2020/NĐ-CP',
      'Điều 56 Nghị định 38/2021/NĐ-CP'
    ],
    recommendations: [
      'Gửi cảnh báo cho nền tảng (Facebook)',
      'Liên hệ yêu cầu gỡ bỏ nội dung',
      'Xác minh thông tin cơ sở/đơn vị',
      'Lập hồ sơ xử lý vi phạm'
    ],
    notes: 'Cơ sở tại quận Cầu Giấy, biển hiệu chỉ ghi chăm sóc da nhưng nhận mổ nâng mũi.'
  },
  {
    id: 'vio-002',
    timestamp: '06/10/2025 08:17',
    date: '2025-10-06T08:17:00',
    platform: 'Facebook',
    author: 'Mega Beauty Clinic',
    authorHandle: '@megabeauty.clinic',
    followers: '45.2K',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Trước và sau 7 ngày nâng mũi - Khách hàng thực tế! Dáng mũi cao bay tự nhiên, không lộ sẹo.',
    postType: 'Hình ảnh',
    postUrl: 'https://www.facebook.com/megabeauty.clinic/posts/987654321',
    mediaUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    engagement: { likes: 2150, comments: 410, shares: 65 },
    category: VIOLATION_CATEGORIES.FAKE_BEFORE_AFTER,
    status: 'Đã xác minh',
    severity: 'Trung bình',
    violationDetails: [
      'Sử dụng hình ảnh so sánh trước/sau can thiệp thẩm mỹ trái với quy định tại Nghị định 38/2021/NĐ-CP',
      'Dấu hiệu can thiệp đồ họa làm sai lệch kết quả phẫu thuật'
    ],
    legalBasis: [
      'Khoản 1 Điều 56 Nghị định 38/2021/NĐ-CP',
      'Thông tư 09/2015/TT-BYT'
    ],
    recommendations: [
      'Yêu cầu cơ sở tháo gỡ hình ảnh so sánh',
      'Phạt vi phạm hành chính theo Điều 56 NĐ 38/2021'
    ]
  },
  {
    id: 'vio-003',
    timestamp: '06/10/2025 07:56',
    date: '2025-10-06T07:56:00',
    platform: 'Facebook',
    author: 'Dr. Hoàng Beauty',
    authorHandle: '@drhoang.beauty',
    followers: '28.7K',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Bác sĩ chuyên khoa thẩm mỹ với 20 năm kinh nghiệm, tư vấn miễn phí! Hút mỡ bụng an toàn không nghỉ dưỡng!',
    postType: 'Bài viết',
    postUrl: 'https://www.facebook.com/drhoang.beauty/posts/554433221',
    mediaUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    engagement: { likes: 890, comments: 195, shares: 32 },
    category: VIOLATION_CATEGORIES.UNLICENSED_INFO,
    status: 'Chờ xử lý',
    severity: 'Cao',
    violationDetails: [
      'Tự xưng danh hiệu "Bác sĩ chuyên khoa 20 năm kinh nghiệm" nhưng không có số CCHN',
      'Quảng cáo dịch vụ hút mỡ bụng (đại phẫu) ngoài phạm vi bệnh viện đa khoa'
    ],
    legalBasis: [
      'Điều 20 Luật Quảng cáo số 16/2012/QH13',
      'Điều 40 Nghị định 117/2020/NĐ-CP'
    ],
    recommendations: [
      'Tra cứu CSDL Quốc gia người hành nghề',
      'Chuyển cơ quan điều tra nếu có dấu hiệu mạo danh bác sĩ'
    ]
  },
  {
    id: 'vio-004',
    timestamp: '06/10/2025 06:33',
    date: '2025-10-06T06:33:00',
    platform: 'Facebook',
    author: 'Thẩm mỹ Queen',
    authorHandle: '@queen.beauty',
    followers: '18.3K',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Giảm béo công nghệ cao, giảm 10kg chỉ sau 1 liệu trình! Đốt mỡ tầng sâu không phẫu thuật.',
    postType: 'Video',
    postUrl: 'https://www.facebook.com/queen.beauty/posts/665544332',
    mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    videoDuration: '01:15',
    engagement: { likes: 3100, comments: 540, shares: 120 },
    category: VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
    status: 'Đã xử lý',
    severity: 'Trung bình',
    violationDetails: [
      'Cam kết phi thực tế giảm 10kg sau 1 liệu trình',
      'Có dấu hiệu sử dụng thuốc/chất tiêm tan mỡ chưa được Bộ Y tế cấp phép lưu hành'
    ],
    legalBasis: [
      'Khoản 9 Điều 8 Luật Quảng cáo số 16/2012/QH13',
      'Điều 34 Nghị định 38/2021/NĐ-CP'
    ],
    recommendations: [
      'Đã lập biên bản xử phạt 17.5 triệu đồng',
      'Đã tháo gỡ video quảng cáo'
    ]
  },
  {
    id: 'vio-005',
    timestamp: '05/10/2025 22:15',
    date: '2025-10-05T22:15:00',
    platform: 'Facebook',
    author: 'Beauty Plus',
    authorHandle: '@beautyplus.vn',
    followers: '32.1K',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Cắt mí không phẫu thuật, hiệu quả vĩnh viễn! 100% không đau, mắt 2 mí sâu hút hồn ngay sau 30 phút.',
    postType: 'Hình ảnh',
    postUrl: 'https://www.facebook.com/beautyplus.vn/posts/88776655',
    mediaUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    engagement: { likes: 1450, comments: 280, shares: 45 },
    category: VIOLATION_CATEGORIES.FALSE_EFFICACY_PROMISE,
    status: 'Chờ xử lý',
    severity: 'Trung bình',
    violationDetails: [
      'Cam kết hiệu quả "vĩnh viễn", "100% không đau"',
      'Dịch vụ cắt mí mắt thuộc phẫu thuật tạo hình phải có giấy phép chuyên khoa'
    ],
    legalBasis: [
      'Điều 8 Luật Quảng cáo số 16/2012/QH13',
      'Điều 39 Nghị định 117/2020/NĐ-CP'
    ],
    recommendations: [
      'Mời chủ cơ sở lên làm việc tại Thanh tra Sở Y tế',
      'Kiểm tra chứng chỉ đào tạo phẫu thuật tạo hình'
    ]
  },
  {
    id: 'vio-006',
    timestamp: '05/10/2025 20:48',
    date: '2025-10-05T20:48:00',
    platform: 'Facebook',
    author: 'Bệnh viện Thẩm mỹ Quốc tế',
    authorHandle: '@bvtm.quocte',
    followers: '67.8K',
    avatar: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Phòng mổ đạt chuẩn quốc tế, thiết bị hiện đại, an toàn tuyệt đối! Nâng ngực Nano chip chuyển giao trực tiếp từ Mỹ.',
    postType: 'Video',
    postUrl: 'https://www.facebook.com/bvtm.quocte/posts/991122334',
    mediaUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    videoDuration: '02:05',
    engagement: { likes: 4500, comments: 820, shares: 210 },
    category: VIOLATION_CATEGORIES.UNLICENSED_INFO,
    status: 'Đã xử lý',
    severity: 'Cao',
    violationDetails: [
      'Tự đặt tên "Bệnh viện Thẩm mỹ Quốc tế" khi thực tế giấy phép chỉ là phòng khám chuyên khoa',
      'Quảng cáo dịch vụ nâng ngực (phải thực hiện tại bệnh viện có khoa gây mê hồi sức) chưa được duyệt nội dung'
    ],
    legalBasis: [
      'Điều 56 Nghị định 38/2021/NĐ-CP',
      'Điều 39 Nghị định 117/2020/NĐ-CP'
    ],
    recommendations: [
      'Đình chỉ hoạt động dịch vụ nâng ngực',
      'Xử phạt hành vi tự xưng Bệnh viện Quốc tế'
    ]
  },
  {
    id: 'vio-007',
    timestamp: '05/10/2025 18:20',
    date: '2025-10-05T18:20:00',
    platform: 'Facebook',
    author: 'Viện Da Liễu Sài Gòn',
    authorHandle: '@dalieusaigon.vn',
    followers: '21.4K',
    avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=120&h=120&q=80',
    content: 'Trị nám, tàn nhang 100% khỏi, không tái phát! Bắn laser picosecond công nghệ mới nhất.',
    postType: 'Hình ảnh',
    postUrl: 'https://www.facebook.com/dalieusaigon.vn/posts/112233445',
    mediaUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&h=400&q=80',
    mediaGallery: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&h=400&q=80'
    ],
    engagement: { likes: 1120, comments: 167, shares: 28 },
    category: VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
    status: 'Chờ xử lý',
    severity: 'Trung bình',
    violationDetails: [
      'Quảng cáo cam kết chữa bệnh "100% khỏi, không tái phát" vi phạm Luật Quảng cáo',
      'Chưa được Sở Y tế cấp giấy xác nhận nội dung quảng cáo'
    ],
    legalBasis: [
      'Khoản 9 Điều 8 Luật Quảng cáo số 16/2012/QH13',
      'Điều 56 Nghị định 38/2021/NĐ-CP'
    ],
    recommendations: [
      'Gửi văn bản nhắc nhở và yêu cầu sửa nội dung',
      'Kiểm tra chứng chỉ sử dụng thiết bị laser phát xạ'
    ]
  }
];

// Generate extra realistic items to match the exact 156 items
function generateFullDataset() {
  const dataset = [...INITIAL_VIOLATIONS];
  const pages = [
    { author: 'Seoul Center Spa', handle: '@seoulcenter.vn', followers: '15.2K', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80' },
    { author: 'Thẩm mỹ viện Lavender', handle: '@lavender.beauty', followers: '53.1K', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80' },
    { author: 'Bác sĩ Tuấn Phẫu Thuật', handle: '@bstituan.tmv', followers: '8.4K', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80' },
    { author: 'Kora Spa & Clinic', handle: '@kora.clinic', followers: '22.0K', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80' },
    { author: 'Hana Beauty Center', handle: '@hana.beautycenter', followers: '19.8K', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&h=120&q=80' }
  ];

  const templates = [
    {
      cat: VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
      postType: 'Video',
      text: 'Tiêm filler mũi cằm giá sinh viên chỉ 499k/cc! Đảm bảo hàng chính hãng Châu Âu, tự tay chuyên gia tiêm không đau!',
      severity: 'Cao'
    },
    {
      cat: VIOLATION_CATEGORIES.UNAUTHORIZED_COSMETIC_SURGERY,
      postType: 'Video',
      text: 'Hút mỡ siết eo tạo form đồng hồ cát ngay tại spa mini, về ngay trong ngày không cần nằm viện!',
      severity: 'Cao'
    },
    {
      cat: VIOLATION_CATEGORIES.FALSE_EFFICACY_PROMISE,
      postType: 'Hình ảnh',
      text: 'Trẻ hóa xóa nhăn 100% chỉ sau một lần làm duy nhất, cam kết trẻ ra 15 tuổi hoàn tiền nếu không hài lòng!',
      severity: 'Trung bình'
    },
    {
      cat: VIOLATION_CATEGORIES.FAKE_BEFORE_AFTER,
      postType: 'Hình ảnh',
      text: 'Ảnh feedback trước và sau khi làm cằm V-line của chị khách U40, lột xác hoàn toàn không ai nhận ra!',
      severity: 'Trung bình'
    },
    {
      cat: VIOLATION_CATEGORIES.UNLICENSED_INFO,
      postType: 'Bài viết',
      text: 'Học viện đào tạo tiêm filler botox cấp chứng chỉ quốc tế sau 3 ngày! Cơ hội kiếm 50 triệu/tháng cho các bạn trẻ!',
      severity: 'Cao'
    },
    {
      cat: VIOLATION_CATEGORIES.OTHER,
      postType: 'Bài viết',
      text: 'Bán sỉ lẻ sụn nâng mũi silicon y tế, kim tiêm meso, máy xóa xăm mini ship toàn quốc không cần giấy phép.',
      severity: 'Thấp'
    }
  ];

  let idCounter = 8;
  while (dataset.length < 156) {
    const page = pages[dataset.length % pages.length];
    const tmpl = templates[dataset.length % templates.length];
    const day = Math.max(1, 6 - Math.floor(dataset.length / 30));
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const hour = (23 - (dataset.length % 24)).toString().padStart(2, '0');
    const minute = ((dataset.length * 7) % 60).toString().padStart(2, '0');
    
    const analysis = analyzeContent({ content: tmpl.text, author: page.author });
    const statuses = ['Chờ xử lý', 'Đã xác minh', 'Đã xử lý'];

    dataset.push({
      id: `vio-${idCounter.toString().padStart(3, '0')}`,
      timestamp: `${dayStr}/10/2025 ${hour}:${minute}`,
      date: `2025-10-${dayStr}T${hour}:${minute}:00`,
      platform: 'Facebook',
      author: page.author,
      authorHandle: page.handle,
      followers: page.followers,
      avatar: page.avatar,
      content: tmpl.text,
      postType: tmpl.postType,
      postUrl: `https://www.facebook.com/${page.handle.replace('@', '')}/posts/${1000000 + idCounter}`,
      mediaUrl: page.avatar,
      mediaGallery: [page.avatar],
      videoDuration: tmpl.postType === 'Video' ? '00:58' : null,
      engagement: {
        likes: Math.floor(200 + Math.random() * 2500),
        comments: Math.floor(20 + Math.random() * 450),
        shares: Math.floor(5 + Math.random() * 95)
      },
      category: tmpl.cat,
      status: statuses[dataset.length % 3],
      severity: tmpl.severity,
      violationDetails: analysis.violationDetails.length > 0 ? analysis.violationDetails : ['Có dấu hiệu quảng cáo sai quy định pháp luật y tế'],
      legalBasis: analysis.legalBasis,
      recommendations: analysis.recommendations,
      notes: ''
    });
    idCounter++;
  }

  return dataset;
}

export function getViolations() {
  if (!fs.existsSync(VIOLATIONS_FILE)) {
    fs.writeFileSync(VIOLATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(VIOLATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading violations:', e);
    return [];
  }
}

export function saveViolations(data) {
  fs.writeFileSync(VIOLATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function addViolation(item) {
  const list = getViolations();
  list.unshift(item);
  saveViolations(list);
  return item;
}

export function updateViolation(id, updates) {
  const list = getViolations();
  const idx = list.findIndex(v => v.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    saveViolations(list);
    return list[idx];
  }
  return null;
}

export function deleteViolation(id) {
  const list = getViolations();
  const filtered = list.filter(v => v.id !== id);
  saveViolations(filtered);
  return true;
}

export function getStats() {
  if (!fs.existsSync(STATS_FILE)) {
    return { totalScanned: 0 };
  }
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  } catch {
    return { totalScanned: 0 };
  }
}

export function incrementScannedCount(count = 1) {
  const stats = getStats();
  stats.totalScanned = (stats.totalScanned || 0) + count;
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  return stats;
}

export function clearViolations() {
  saveViolations([]);
  fs.writeFileSync(STATS_FILE, JSON.stringify({ totalScanned: 0 }, null, 2), 'utf-8');
  const evidenceDir = path.join(DATA_DIR, 'evidence');
  if (fs.existsSync(evidenceDir)) {
    try {
      const files = fs.readdirSync(evidenceDir);
      for (const file of files) {
        fs.unlinkSync(path.join(evidenceDir, file));
      }
    } catch (e) {
      console.error('Error clearing evidence:', e);
    }
  }
  return [];
}

export function getKeywords() {
  const DEFAULT_KEYWORDS = [
    // Phẫu thuật can thiệp xâm lấn
    { id: 1, term: 'nâng mũi cấu trúc', category: 'Phẫu thuật xâm lấn', count: 48, status: 'Đang theo dõi' },
    { id: 2, term: 'nâng mũi sụn sườn', category: 'Phẫu thuật xâm lấn', count: 32, status: 'Đang theo dõi' },
    { id: 3, term: 'cắt mí mini', category: 'Phẫu thuật xâm lấn', count: 41, status: 'Đang theo dõi' },
    { id: 4, term: 'cắt mí babydoll', category: 'Phẫu thuật xâm lấn', count: 28, status: 'Đang theo dõi' },
    { id: 5, term: 'bóc mỡ mí mắt', category: 'Phẫu thuật xâm lấn', count: 19, status: 'Đang theo dõi' },
    { id: 6, term: 'độn thái dương', category: 'Phẫu thuật xâm lấn', count: 15, status: 'Đang theo dõi' },
    { id: 7, term: 'gọt hàm hạ gò má', category: 'Phẫu thuật xâm lấn', count: 22, status: 'Đang theo dõi' },

    // Can thiệp tiêm chích (Filler / Botox / Meso)
    { id: 8, term: 'tiêm filler cằm', category: 'Can thiệp tiêm chích', count: 62, status: 'Đang theo dõi' },
    { id: 9, term: 'tiêm botox gọn hàm', category: 'Can thiệp tiêm chích', count: 35, status: 'Đang theo dõi' },
    { id: 10, term: 'tiêm tai tài lộc', category: 'Can thiệp tiêm chích', count: 24, status: 'Đang theo dõi' },
    { id: 11, term: 'tiêm tan mỡ', category: 'Can thiệp tiêm chích', count: 31, status: 'Đang theo dõi' },
    { id: 12, term: 'cấy chỉ collagen', category: 'Can thiệp tiêm chích', count: 27, status: 'Đang theo dõi' },

    // Phẫu thuật đại phẫu (Bắt buộc BV đa khoa)
    { id: 13, term: 'hút mỡ bụng siết eo', category: 'Phẫu thuật đại phẫu', count: 29, status: 'Đang theo dõi' },
    { id: 14, term: 'nâng ngực nano chip', category: 'Phẫu thuật đại phẫu', count: 38, status: 'Đang theo dõi' },
    { id: 15, term: 'tạo hình thành bụng', category: 'Phẫu thuật đại phẫu', count: 17, status: 'Đang theo dõi' },

    // Tiếng lóng / Lách luật / Hoạt động chui
    { id: 16, term: 'tiểu phẫu tại nhà', category: 'Tiếng lóng & Lách luật', count: 44, status: 'Đang theo dõi' },
    { id: 17, term: 'bác sĩ đến tận spa', category: 'Tiếng lóng & Lách luật', count: 26, status: 'Đang theo dõi' },
    { id: 18, term: 'bao đẹp không đau', category: 'Tiếng lóng & Lách luật', count: 33, status: 'Đang theo dõi' },

    // Cam kết sai sự thật & Chất cấm
    { id: 19, term: 'cam kết 100% vĩnh viễn', category: 'Cam kết sai sự thật', count: 37, status: 'Đang theo dõi' },
    { id: 20, term: 'truyền trắng noãn thực vật', category: 'Chất cấm/Chưa cấp phép', count: 21, status: 'Đang theo dõi' },
    { id: 21, term: 'truyền trắng phi thuyền', category: 'Chất cấm/Chưa cấp phép', count: 18, status: 'Đang theo dõi' }
  ];

  if (!fs.existsSync(KEYWORDS_FILE)) {
    fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(DEFAULT_KEYWORDS, null, 2), 'utf-8');
    return DEFAULT_KEYWORDS;
  }
  try {
    return JSON.parse(fs.readFileSync(KEYWORDS_FILE, 'utf-8'));
  } catch {
    return DEFAULT_KEYWORDS;
  }
}

export function saveKeywords(kws) {
  fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(kws, null, 2), 'utf-8');
}
