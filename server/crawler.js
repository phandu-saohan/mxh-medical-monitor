import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { analyzeContent } from './analyzer.js';
import { addViolation, getViolations, incrementScannedCount } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USER_DATA_DIR = path.join(__dirname, '..', 'fb_session_data');

function ensureNoOrphanedChrome() {
  if (process.platform === 'win32') {
    try {
      execSync(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = \'chrome.exe\'\\" | Where-Object { $_.CommandLine -like \'*fb_session_data*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"',
        { stdio: 'ignore', timeout: 5000 }
      );
    } catch {}
    // Remove lockfile if still present
    const lockfile = path.join(USER_DATA_DIR, 'lockfile');
    if (fs.existsSync(lockfile)) {
      try { fs.unlinkSync(lockfile); } catch {}
    }
  }
}

let currentCrawlerStatus = {
  isRunning: false,
  step: 'IDLE', // 'IDLE' | 'LOGIN_OPEN' | 'SEARCHING' | 'SCRAPING' | 'ANALYZING' | 'DONE' | 'ERROR'
  currentKeyword: '',
  progress: 0,
  logs: [],
  foundCount: 0
};

let activeBrowserContext = null;
const eventListeners = new Set();

export function subscribeCrawlerEvents(res) {
  eventListeners.add(res);
  res.on('close', () => {
    eventListeners.delete(res);
  });
}

function broadcastEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of eventListeners) {
    try {
      client.write(payload);
    } catch {
      eventListeners.delete(client);
    }
  }
}

function logMessage(text, type = 'info') {
  const entry = {
    id: Date.now() + Math.random(),
    time: new Date().toLocaleTimeString('vi-VN'),
    text,
    type
  };
  currentCrawlerStatus.logs.push(entry);
  if (currentCrawlerStatus.logs.length > 200) currentCrawlerStatus.logs.shift();
  broadcastEvent({ type: 'LOG', entry, status: currentCrawlerStatus });
  console.log(`[Crawler Production] [${type.toUpperCase()}] ${text}`);
}

export function getCrawlerStatus() {
  const hasProfile = fs.existsSync(USER_DATA_DIR) && fs.readdirSync(USER_DATA_DIR).length > 0;
  return {
    ...currentCrawlerStatus,
    hasSavedSession: hasProfile
  };
}

/**
 * Step 1: Mở trình duyệt thực tế để giám sát viên đăng nhập và lưu session vĩnh viễn
 */
export async function openBrowserForLogin() {
  if (activeBrowserContext) {
    try {
      const pages = activeBrowserContext.pages();
      if (pages.length > 0) {
        await pages[0].bringToFront().catch(() => {});
        return { success: true, message: 'Cửa sổ đăng nhập Facebook đã mở sẵn trên màn hình.' };
      }
    } catch {
      activeBrowserContext = null;
    }
  }

  // Ensure no zombie background Chrome is locking the profile
  ensureNoOrphanedChrome();

  logMessage('Bước 1: Khởi động Google Chrome thực tế với hồ sơ lưu trữ an toàn...', 'info');
  currentCrawlerStatus.isRunning = true;
  currentCrawlerStatus.step = 'LOGIN_OPEN';

  try {
    activeBrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      channel: 'chrome',
      viewport: null,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });

    const page = activeBrowserContext.pages()[0] || await activeBrowserContext.newPage();
    logMessage('Đang mở trang đăng nhập Facebook (https://www.facebook.com)...', 'info');
    await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 45000 });

    logMessage('Cửa sổ Chrome đã mở. Cán bộ vui lòng đăng nhập tài khoản Facebook trên cửa sổ này.', 'success');
    logMessage('Cookies và phiên đăng nhập sẽ được lưu vĩnh viễn tại fb_session_data cho các lần quét tự động.', 'info');

    activeBrowserContext.on('close', () => {
      logMessage('Trình duyệt đã đóng. Dữ liệu phiên đăng nhập đã được lưu trữ an toàn trong hệ thống.', 'info');
      currentCrawlerStatus.isRunning = false;
      currentCrawlerStatus.step = 'IDLE';
      activeBrowserContext = null;
      broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });
    });

    return { success: true, message: 'Đã mở trình duyệt đăng nhập Facebook thành công.' };
  } catch (err) {
    logMessage(`Lỗi mở trình duyệt: ${err.message}`, 'error');
    currentCrawlerStatus.isRunning = false;
    currentCrawlerStatus.step = 'ERROR';
    if (activeBrowserContext) {
      await activeBrowserContext.close().catch(() => {});
      activeBrowserContext = null;
    }
    throw err;
  }
}

/**
 * Step 2, 3, 4 (PRODUCTION): Rà soát thật 100% trên Facebook (Không dùng dữ liệu sandbox giả lập)
 */
export async function runScrapeAndInspect(options = {}) {
  const {
    keyword = 'nâng mũi cấu trúc',
    maxPosts = 15
  } = options;

  if (currentCrawlerStatus.isRunning && currentCrawlerStatus.step !== 'LOGIN_OPEN') {
    throw new Error('Đang có tiến trình rà soát đang chạy.');
  }

  currentCrawlerStatus.isRunning = true;
  currentCrawlerStatus.step = 'SEARCHING';
  currentCrawlerStatus.currentKeyword = keyword;
  currentCrawlerStatus.progress = 5;
  currentCrawlerStatus.foundCount = 0;
  currentCrawlerStatus.logs = [];

  logMessage(`[PRODUCTION] Khởi động rà soát mạng xã hội với từ khóa y tế: "${keyword}"`, 'info');
  logMessage('Căn cứ pháp lý: Luật KCB 15/2023/QH15, Luật QC 16/2012, NĐ 117/2020/NĐ-CP, NĐ 38/2021/NĐ-CP', 'info');

  let browserContext = activeBrowserContext;
  let createdOwnContext = false;

  try {
    const hasProfile = fs.existsSync(USER_DATA_DIR) && fs.readdirSync(USER_DATA_DIR).length > 0;
    if (!hasProfile && !browserContext) {
      logMessage('CẢNH BÁO: Chưa phát hiện phiên đăng nhập Facebook đã lưu trong thư mục fb_session_data!', 'warning');
      logMessage('Hệ thống khuyến nghị cán bộ nhấn "B1: Mở Trình Duyệt Đăng Nhập FB" để kết quả tìm kiếm đầy đủ nhất.', 'warning');
    }

    if (!browserContext) {
      ensureNoOrphanedChrome();
      logMessage('Khởi chạy tiến trình Playwright kết nối với hồ sơ Facebook lưu trữ...', 'info');

      browserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: true, // headless mode for production scan
        channel: 'chrome',
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-first-run',
          '--no-default-browser-check'
        ]
      });
      createdOwnContext = true;
    }

    const page = await browserContext.newPage();
    
    // Bước 2: Điều hướng đến trang tìm kiếm Facebook thật
    const searchUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(keyword)}`;
    logMessage(`Bước 2: Tự động điều hướng đến URL tìm kiếm Facebook: ${searchUrl}`, 'info');
    currentCrawlerStatus.progress = 20;
    broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    // Bước 3: Đọc DOM, cuộn trang lấy dữ liệu thực tế
    logMessage('Bước 3: Đang đọc cấu trúc bài viết thực tế trên Facebook (Văn bản, hình ảnh, video, tên trang)...', 'info');
    currentCrawlerStatus.step = 'SCRAPING';
    currentCrawlerStatus.progress = 40;
    broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

    // Scroll to trigger infinite load
    for (let i = 1; i <= 4; i++) {
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(2000);
      currentCrawlerStatus.progress = 40 + i * 8;
      broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });
    }

    // Extract genuine posts from page DOM
    const extractedPosts = await page.evaluate((max) => {
      const results = [];
      // Select feed articles or main post containers
      const elements = document.querySelectorAll('div[role="feed"] > div, div[role="article"], div.x1yztbdb');

      elements.forEach((el) => {
        if (results.length >= max) return;
        const text = (el.innerText || '').trim();
        if (text.length < 35) return; // ignore trivial chips or buttons

        // Extract author name from links or heading
        const authorLinks = Array.from(el.querySelectorAll('a[role="link"], h2 a, h3 a, span a'));
        const validAuthor = authorLinks.find(a => {
          const t = a.innerText && a.innerText.trim();
          return t && t.length > 2 && t.length < 60 && !t.includes('Thích') && !t.includes('Bình luận') && !t.includes('Chia sẻ');
        });
        const authorName = validAuthor ? validAuthor.innerText.trim() : 'Cơ sở Thẩm mỹ chưa định danh';

        // Extract post permalink
        const permalink = validAuthor ? validAuthor.href : window.location.href;

        // Extract images
        const imgs = Array.from(el.querySelectorAll('img'))
          .map(i => i.src)
          .filter(src => src && src.startsWith('http') && !src.includes('emoji') && !src.includes('rsrc.php'));

        // Extract video indicator
        const hasVideo = el.querySelectorAll('video').length > 0 || text.includes('00:') || text.includes('01:') || text.includes('Xem thêm video');

        results.push({
          author: authorName,
          authorHandle: `@${authorName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          content: text.slice(0, 700),
          postType: hasVideo ? 'Video' : (imgs.length > 0 ? 'Hình ảnh' : 'Bài viết'),
          postUrl: permalink,
          mediaUrl: imgs[0] || null,
          mediaGallery: imgs.slice(0, 4),
          videoDuration: hasVideo ? '01:00' : null
        });
      });

      return results;
    }, maxPosts);

    await page.close().catch(() => {});
    logMessage(`Đã trích xuất được ${extractedPosts.length} bài viết thực tế từ Facebook với từ khóa "${keyword}".`, 'info');
    if (extractedPosts.length > 0) {
      incrementScannedCount(extractedPosts.length);
    }

    // Bước 4: Phân tích vi phạm bằng Rule Engine pháp luật y tế
    currentCrawlerStatus.step = 'ANALYZING';
    currentCrawlerStatus.progress = 80;
    broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

    const newViolations = [];
    const now = new Date();
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (let i = 0; i < extractedPosts.length; i++) {
      const p = extractedPosts[i];
      const analysis = analyzeContent(p);

      if (analysis.isViolation) {
        const item = {
          id: `vio-real-${Date.now().toString().slice(-6)}-${i}`,
          timestamp: dateFormatted,
          date: now.toISOString(),
          platform: 'Facebook',
          author: p.author,
          authorHandle: p.authorHandle,
          followers: 'Đang hoạt động trên FB',
          avatar: p.mediaUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
          content: p.content,
          postType: p.postType,
          postUrl: p.postUrl,
          mediaUrl: p.mediaUrl,
          mediaGallery: p.mediaGallery,
          videoDuration: p.videoDuration,
          engagement: { likes: 0, comments: 0, shares: 0 },
          category: analysis.category,
          status: 'Chờ xử lý',
          severity: analysis.severity,
          violationDetails: analysis.violationDetails,
          legalBasis: analysis.legalBasis,
          recommendations: analysis.recommendations,
          notes: `Tự động phát hiện khi rà soát thật từ khóa "${keyword}"`
        };

        addViolation(item);
        newViolations.push(item);
        logMessage(`[PHÁT HIỆN VI PHẠM THẬT] Trang "${p.author}" - Lỗi: ${analysis.category} (${analysis.severity})`, 'warning');
      }
    }

    currentCrawlerStatus.foundCount = newViolations.length;
    currentCrawlerStatus.progress = 100;
    currentCrawlerStatus.step = 'DONE';
    currentCrawlerStatus.isRunning = false;

    if (newViolations.length > 0) {
      logMessage(`Hoàn tất rà soát thật! Đã phát hiện và lập hồ sơ cho ${newViolations.length} bài viết vi phạm y tế.`, 'success');
      broadcastEvent({ type: 'NEW_VIOLATIONS', items: newViolations });
    } else {
      logMessage(`Hoàn tất rà soát! Đã kiểm tra ${extractedPosts.length} bài viết, không phát hiện vi phạm mới hoặc cần mở rộng từ khóa.`, 'info');
    }

    broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

    return {
      success: true,
      foundCount: newViolations.length,
      violations: newViolations
    };
  } catch (err) {
    logMessage(`Lỗi trong tiến trình rà soát thật: ${err.message}`, 'error');
    currentCrawlerStatus.isRunning = false;
    currentCrawlerStatus.step = 'ERROR';
    broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });
    throw err;
  } finally {
    if (createdOwnContext && browserContext) {
      await browserContext.close().catch(() => {});
    }
  }
}
