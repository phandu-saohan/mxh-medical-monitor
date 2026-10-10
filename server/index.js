import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getViolations,
  addViolation,
  updateViolation,
  deleteViolation,
  clearViolations,
  getKeywords,
  saveKeywords,
  getStats,
  incrementScannedCount,
  initDbSync
} from './db.js';
import { isSupabaseConnected } from './supabase.js';
import { analyzeContent, analyzeContentWithAi, VIOLATION_CATEGORIES } from './analyzer.js';
import {
  openBrowserForLogin,
  saveFacebookCookies,
  runScrapeAndInspect,
  getCrawlerStatus,
  subscribeCrawlerEvents
} from './crawler.js';
import { generateViolationReportHtml } from './export.js';
import { captureLegalEvidence, archiveMediaToVault } from './evidence.js';
import { searchMetaAdLibrary } from './metaAdLibrary.js';
import {
  getSchedulerConfig,
  saveSchedulerConfig,
  executeScheduledJob,
  initScheduler,
  generatePeriodicReportHtml
} from './scheduler.js';
import {
  getLicensedFacilities,
  addLicensedFacility,
  deleteLicensedFacility,
  verifyFacilityLicense,
  bulkImportLicensedFacilities,
  parseCsvFacilitiesText
} from './licenseLookup.js';
import { generateAiKeywords } from './aiKeywords.js';
import {
  getAlertsConfig,
  saveAlertsConfig,
  testTelegramConnection
} from './alerts.js';
import { extractOcrFromImageUrl } from './ocr.js';
import {
  getEntityProfiles,
  getBlacklistEntities
} from './entities.js';
import { generateAdministrativeViolationRecordHtml } from './dossier.js';
import {
  HOT_TIKTOK_HASHTAGS,
  scanTikTokAestheticVideos,
  analyzeSpecificTikTokUrl
} from './tiktok.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set permissive CSP header to eliminate browser DevTools eval & script warnings
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob: https:; connect-src *;"
  );
  next();
});

// API: Dashboard Stats
app.get('/api/stats', (req, res) => {
  const violations = getViolations();
  const totalViolations = violations.length;
  const statsObj = getStats();
  const totalScanned = Math.max(totalViolations, statsObj.totalScanned || 0);
  const totalValid = Math.max(0, totalScanned - totalViolations);
  const videoViolations = violations.filter(v => v.postType === 'Video').length;

  // Calculate category breakdown
  const categoryCounts = {};
  Object.values(VIOLATION_CATEGORIES).forEach(c => categoryCounts[c] = 0);
  
  violations.forEach(v => {
    if (categoryCounts[v.category] !== undefined) {
      categoryCounts[v.category]++;
    } else {
      categoryCounts[VIOLATION_CATEGORIES.OTHER]++;
    }
  });

  const categoryBreakdown = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalViolations > 0 ? Math.round((count / totalViolations) * 100) : 0
  }));

  res.json({
    totalViolations,
    totalScanned,
    totalValid,
    videoViolations,
    categoryBreakdown,
    statusBreakdown: {
      pending: violations.filter(v => v.status === 'Chờ xử lý').length,
      verified: violations.filter(v => v.status === 'Đã xác minh').length,
      resolved: violations.filter(v => v.status === 'Đã xử lý').length
    }
  });
});

// API: Violations List with query filters
app.get('/api/violations', (req, res) => {
  let list = getViolations();
  const { search, category, postType, platform, status, page = 1, limit = 10 } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(v => 
      v.author.toLowerCase().includes(q) ||
      v.content.toLowerCase().includes(q) ||
      (v.postUrl && v.postUrl.toLowerCase().includes(q)) ||
      (v.authorHandle && v.authorHandle.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'Tất cả') {
    list = list.filter(v => v.category === category);
  }

  if (postType && postType !== 'Tất cả') {
    list = list.filter(v => v.postType === postType);
  }

  if (platform && platform !== 'Tất cả') {
    list = list.filter(v => v.platform === platform);
  }

  if (status && status !== 'Tất cả') {
    list = list.filter(v => v.status === status);
  }

  const total = list.length;
  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const items = list.slice(startIndex, startIndex + l);

  res.json({
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    items
  });
});

// API: Violation Detail
app.get('/api/violations/:id', (req, res) => {
  const item = getViolations().find(v => v.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Không tìm thấy vi phạm.' });
  res.json(item);
});

// API: Update Violation (status, notes)
app.patch('/api/violations/:id', (req, res) => {
  const updated = updateViolation(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy vi phạm.' });
  res.json(updated);
});

// API: Export Official Dossier
app.get('/api/violations/:id/export', (req, res) => {
  const item = getViolations().find(v => v.id === req.params.id);
  if (!item) return res.status(404).send('Không tìm thấy vi phạm.');
  const html = generateViolationReportHtml(item);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// API: Official Sanction Record (Biên bản VPHC chuẩn Nghị định 118/2021/NĐ-CP)
app.get('/api/violations/:id/sanction-record', (req, res) => {
  const item = getViolations().find(v => v.id === req.params.id);
  if (!item) return res.status(404).send('Không tìm thấy vi phạm.');
  const html = generateAdministrativeViolationRecordHtml(item);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// API: Alerts Config & Telegram Testing (Mô-đun 1)
app.get('/api/alerts/config', (req, res) => {
  res.json(getAlertsConfig());
});

app.post('/api/alerts/config', (req, res) => {
  const updated = saveAlertsConfig(req.body);
  res.json({ success: true, config: updated, message: 'Đã lưu cấu hình cảnh báo thành công.' });
});

app.post('/api/alerts/test', async (req, res) => {
  try {
    const { token, chatId } = req.body;
    const result = await testTelegramConnection(token, chatId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// API: Multimodal OCR Text Analysis (Mô-đun 2)
app.post('/api/ocr/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, error: 'Thiếu đường dẫn hình ảnh (imageUrl).' });
    const text = await extractOcrFromImageUrl(imageUrl);
    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Entity Profiles & Blacklist Radar (Mô-đun 3)
app.get('/api/entities', (req, res) => {
  res.json(getEntityProfiles());
});

app.get('/api/entities/blacklist', (req, res) => {
  res.json(getBlacklistEntities());
});

// API: TikTok & KOLs Monitoring Module (Hướng C)
app.get('/api/tiktok/hashtags', (req, res) => {
  res.json(HOT_TIKTOK_HASHTAGS);
});

app.post('/api/tiktok/scan', async (req, res) => {
  try {
    const { keyword, hashtag, maxVideos } = req.body;
    const result = await scanTikTokAestheticVideos({ keyword, hashtag, maxVideos });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tiktok/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Thiếu đường dẫn URL TikTok.' });
    const result = await analyzeSpecificTikTokUrl(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Reset / Clear database for Production
app.post('/api/violations/reset-production', (req, res) => {
  clearViolations();
  res.json({ success: true, message: 'Đã làm sạch dữ liệu thử nghiệm, đưa hệ thống về môi trường Production sẵn sàng tiếp nhận các vi phạm thực tế.' });
});

// API: Keywords
app.get('/api/keywords', (req, res) => {
  res.json(getKeywords());
});

app.post('/api/keywords', (req, res) => {
  const { term, category } = req.body;
  if (!term) return res.status(400).json({ error: 'Vui lòng nhập từ khóa.' });
  const kws = getKeywords();
  const newItem = {
    id: Date.now(),
    term,
    category: category || 'Thẩm mỹ chung',
    count: 0,
    status: 'Đang theo dõi'
  };
  kws.unshift(newItem);
  saveKeywords(kws);
  res.json(newItem);
});

app.delete('/api/keywords/:id', (req, res) => {
  const kws = getKeywords().filter(k => k.id.toString() !== req.params.id.toString());
  saveKeywords(kws);
  res.json({ success: true });
});

// API: AI Keyword Suggestions
app.post('/api/keywords/ai-generate', async (req, res) => {
  try {
    const { prompt, theme, count } = req.body;
    const suggestions = await generateAiKeywords({ prompt, theme, count });
    res.json({ success: true, count: suggestions.length, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Bulk Add Keywords
app.post('/api/keywords/bulk-add', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Danh sách không hợp lệ.' });
  }
  const kws = getKeywords();
  let addedCount = 0;
  for (const item of items) {
    if (!kws.some(k => k.term.toLowerCase() === item.term.toLowerCase())) {
      kws.unshift({
        id: Date.now() + Math.random(),
        term: item.term,
        category: item.category || 'Gợi ý từ AI',
        count: 0,
        status: 'Đang theo dõi'
      });
      addedCount++;
    }
  }
  saveKeywords(kws);
  res.json({ success: true, addedCount, total: kws.length });
});

// API: Analyze Custom Text with AI
app.post('/api/ai-analyze', async (req, res) => {
  try {
    const { content, author, title, mediaUrl, postType, ocrText } = req.body;
    const analysis = await analyzeContentWithAi({ content, author, title, mediaUrl, postType, ocrText });
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Step 1 - Open Browser for Login
app.post('/api/crawler/open-login', async (req, res) => {
  try {
    const result = await openBrowserForLogin();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Step 1 (Server/Cloud) - Save Facebook Cookies / Session
app.post('/api/crawler/save-cookies', (req, res) => {
  try {
    const { cookies } = req.body;
    const result = saveFacebookCookies(cookies);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Step 2, 3, 4 - Run Scraper & Legal Inspector (Hỗ trợ từ khóa đơn HOẶC quét toàn bộ chuyên mục)
app.post('/api/crawler/start', async (req, res) => {
  try {
    const { keyword, keywords, categoryName, maxPosts } = req.body;
    // Run asynchronously, respond immediately with initial state
    runScrapeAndInspect({ keyword, keywords, categoryName, maxPosts }).catch(e => console.error('Crawler error:', e));
    res.json({ success: true, message: 'Đã kích hoạt tiến trình rà soát.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Crawler Status
app.get('/api/crawler/status', (req, res) => {
  res.json(getCrawlerStatus());
});

// API: Crawler Real-time Events (SSE)
app.get('/api/crawler/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  subscribeCrawlerEvents(res);
});

// Serve evidence snapshots & vault files statically
app.use('/api/evidence/vault', express.static(path.join(__dirname, '../data/evidence_vault')));
app.use('/api/evidence', express.static(path.join(__dirname, '../data/evidence')));

// API Phase 2: Capture Legal Evidence Snapshot with SHA-256 Checksum
app.post('/api/evidence/:id/capture', async (req, res) => {
  try {
    const evidence = await captureLegalEvidence(req.params.id);
    res.json({ success: true, evidence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Option 3: Archive Raw Media into Permanent Evidence Vault (Chống xóa bài phi tang)
app.post('/api/evidence/:id/archive-vault', async (req, res) => {
  try {
    const { mediaUrl } = req.body || {};
    const vault = await archiveMediaToVault(req.params.id, mediaUrl);
    res.json({ success: true, vault });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Phase 1: Search Meta Ad Library
app.post('/api/meta-ads/search', async (req, res) => {
  try {
    const { keyword, token } = req.body;
    const ads = await searchMetaAdLibrary(keyword, token);
    res.json({ success: true, count: ads.length, items: ads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Phase 1 & Option 2: Scheduler Management & Auto-Pilot 24/7
app.get('/api/scheduler', (req, res) => {
  res.json(getSchedulerConfig());
});

app.post('/api/scheduler', (req, res) => {
  const updated = saveSchedulerConfig(req.body);
  res.json(updated);
});

app.post('/api/scheduler/run-now', async (req, res) => {
  try {
    const runResult = await executeScheduledJob();
    res.json({ success: true, message: 'Đã hoàn thành phiên rà soát định kỳ Auto-Pilot 24/7.', result: runResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Option 2: Xuất Báo Cáo Định Kỳ Trình Lãnh Đạo Sở Y Tế (Khổ A4 chuẩn thể thức hành chính)
app.get('/api/reports/periodic-summary', (req, res) => {
  try {
    const period = req.query.period || 'BÁO CÁO ĐỊNH KỲ';
    const html = generatePeriodicReportHtml(period);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send(`Lỗi tạo báo cáo: ${err.message}`);
  }
});

// API Phase 3 & Option 1: Facility Operating License Lookup & Management
app.get('/api/license/lookup', (req, res) => {
  const { name, city, serviceClaim } = req.query;
  const result = verifyFacilityLicense(name, city, serviceClaim);
  res.json(result);
});

app.get('/api/license/facilities', (req, res) => {
  res.json(getLicensedFacilities(req.query.city));
});

app.post('/api/license/facilities', (req, res) => {
  const item = addLicensedFacility(req.body);
  res.json(item);
});

app.delete('/api/license/facilities/:id', (req, res) => {
  deleteLicensedFacility(req.params.id);
  res.json({ success: true });
});

// Option 1: Import hàng loạt CSDL Giấy phép từ CSV / Danh sách
app.post('/api/license/import', async (req, res) => {
  try {
    const { items, csvText } = req.body || {};
    let facilitiesToImport = items;

    if (!facilitiesToImport && csvText) {
      facilitiesToImport = parseCsvFacilitiesText(csvText);
    }

    if (!Array.isArray(facilitiesToImport) || facilitiesToImport.length === 0) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu hợp lệ để nhập. Vui lòng kiểm tra định dạng CSV/danh sách.' });
    }

    const result = await bulkImportLicensedFacilities(facilitiesToImport);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Option 1: Tải template CSV mẫu cho cán bộ nhập liệu
app.get('/api/license/template', (req, res) => {
  const sampleCsv = 
`Tên cơ sở,Số GPHĐ,Cơ quan cấp,Tỉnh thành,Loại hình,Người chịu trách nhiệm,Phạm vi chuyên môn,Địa chỉ
Bệnh viện Thẩm mỹ Kangnam,00123/BYT-GPHĐ,Bộ Y tế,TP. Hồ Chí Minh,Bệnh viện Thẩm mỹ,BS. Trần Văn A,Phẫu thuật tạo hình thẩm mỹ toàn diện đại phẫu và tiểu phẫu,666 Cách Mạng Tháng 8 P.11 Q.3 TP.HCM
Phòng khám Chuyên khoa Thẩm mỹ Seoul Center,07892/SYT-GPHĐ,Sở Y tế,Hà Nội,Phòng khám Chuyên khoa Thẩm mỹ,BS. Lê Thị B,Tạo hình mí mắt mũi không gây mê không đại phẫu,120 Phố Huế Hai Bà Trưng Hà Nội
Viện Thẩm mỹ Quốc tế Thu Cúc,00456/BYT-GPHĐ,Bộ Y tế,Hà Nội,Bệnh viện Đa khoa / Thẩm mỹ,BS. Nguyễn Văn C,Phẫu thuật thẩm mỹ hút mỡ nâng ngực tạo hình,286 Thụy Khuê Tây Hồ Hà Nội`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mau_csdl_giay_phep_so_y_te.csv"');
  res.send('\uFEFF' + sampleCsv); // prepend UTF-8 BOM
});

// Initialize persistent AI configuration from data/ai_config.json or .env
const AI_CONFIG_FILE = path.join(__dirname, '../data/ai_config.json');
try {
  if (fs.existsSync(AI_CONFIG_FILE)) {
    const savedAi = JSON.parse(fs.readFileSync(AI_CONFIG_FILE, 'utf8'));
    if (savedAi.apiKey && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = savedAi.apiKey;
    }
    if (savedAi.model && !process.env.GEMINI_MODEL) {
      process.env.GEMINI_MODEL = savedAi.model;
    }
  }
} catch (e) {
  console.warn('[AI Config Init Warning]:', e.message);
}

// Helper: Save environment variables to .env and data/ai_config.json
function updateEnvFile(updates) {
  const envPath = path.join(__dirname, '../.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }
  const lines = content.split(/\r?\n/);
  const remainingKeys = new Set(Object.keys(updates));
  const newLines = lines.map(line => {
    for (const key of Object.keys(updates)) {
      if (line.startsWith(`${key}=`)) {
        remainingKeys.delete(key);
        return `${key}=${updates[key]}`;
      }
    }
    return line;
  });
  for (const key of remainingKeys) {
    newLines.push(`${key}=${updates[key]}`);
  }
  fs.writeFileSync(envPath, newLines.filter(Boolean).join('\n') + '\n', 'utf8');

  // Also persist to /data volume so it survives Docker redeploys/restarts
  try {
    const aiData = {
      apiKey: updates.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? '',
      model: updates.GEMINI_MODEL ?? process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(AI_CONFIG_FILE, JSON.stringify(aiData, null, 2), 'utf8');
  } catch (e) {
    console.warn('[AI Config Write Warning]:', e.message);
  }
}

// API: Get Gemini AI Configuration
app.get('/api/settings/ai', (req, res) => {
  const key = process.env.GEMINI_API_KEY || '';
  const maskedKey = key ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : '';
  res.json({
    hasKey: Boolean(key),
    maskedKey,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    status: Boolean(key) ? 'Đã kích hoạt Google Gemini AI (Tự động lưu vĩnh viễn trong env/data)' : 'Chưa cấu hình (Đang dùng Heuristic Engine nội bộ)'
  });
});

// API: Save & Test Gemini AI Configuration
app.post('/api/settings/ai', async (req, res) => {
  try {
    const { apiKey, model = 'gemini-2.5-flash' } = req.body;
    
    // If empty apiKey, clear it
    if (!apiKey || apiKey.trim() === '') {
      delete process.env.GEMINI_API_KEY;
      process.env.GEMINI_MODEL = model;
      updateEnvFile({ GEMINI_API_KEY: '', GEMINI_MODEL: model });
      return res.json({
        success: true,
        hasKey: false,
        message: 'Đã xóa API Key. Hệ thống chuyển về sử dụng bộ engine phân tích nội bộ.'
      });
    }

    const trimmedKey = apiKey.trim();

    // Verify key by calling Gemini API
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;
    const testRes = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Kiểm tra kết nối hệ thống y tế' }] }]
      })
    });

    const testData = await testRes.json();
    if (!testRes.ok || testData.error) {
      const errMsg = testData.error?.message || 'Không thể xác thực khóa Google Gemini API.';
      return res.status(400).json({
        success: false,
        error: `Kết nối thất bại: ${errMsg}`
      });
    }

    // Save to process.env and .env file and persistent volume
    process.env.GEMINI_API_KEY = trimmedKey;
    process.env.GEMINI_MODEL = model;
    updateEnvFile({
      GEMINI_API_KEY: trimmedKey,
      GEMINI_MODEL: model
    });

    res.json({
      success: true,
      hasKey: true,
      maskedKey: `${trimmedKey.substring(0, 6)}...${trimmedKey.substring(trimmedKey.length - 4)}`,
      model,
      message: `Kết nối thành công tới mô hình ${model}! Đã lưu vĩnh viễn vào hệ thống (không cần nhập lại mỗi lần mở).`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Supabase Connection & Health Status
app.get('/api/supabase/status', (req, res) => {
  res.json({
    connected: isSupabaseConnected(),
    url: process.env.SUPABASE_URL || 'https://supabase-supabase-7c4fe6-72-61-123-73.sslip.io',
    tables: ['violations', 'keywords', 'licensed_facilities', 'scan_stats', 'scheduler_config'],
    message: 'Đã kết nối cơ sở dữ liệu Supabase PostgreSQL trên Dokploy'
  });
});

app.post('/api/supabase/sync', async (req, res) => {
  try {
    await initDbSync();
    res.json({ success: true, message: 'Đồng bộ cơ sở dữ liệu Supabase thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend built assets
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Initial Supabase DB Sync
initDbSync().catch(err => console.warn('[Supabase] Khởi tạo đồng bộ thất bại:', err.message));

// Start recurring scheduler at boot
initScheduler();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
