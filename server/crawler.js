import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { analyzeContent, analyzeContentWithAi } from './analyzer.js';
import { extractOcrFromImageUrl } from './ocr.js';
import { addViolation, getViolations, incrementScannedCount } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USER_DATA_DIR = path.join(__dirname, '..', 'fb_session_data');
const STORAGE_STATE_FILE = path.join(USER_DATA_DIR, 'storageState.json');

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
  const hasProfile = (fs.existsSync(USER_DATA_DIR) && fs.readdirSync(USER_DATA_DIR).length > 0) || fs.existsSync(STORAGE_STATE_FILE);
  return {
    ...currentCrawlerStatus,
    hasSavedSession: hasProfile
  };
}

export function saveFacebookCookies(rawInput) {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    throw new Error('Vui lòng nhập chuỗi cookie hoặc token phiên Facebook.');
  }

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const cookieList = [];
  const trimmed = rawInput.trim();

  // If input is JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      for (const c of parsed) {
        if (c.name && c.value) {
          cookieList.push({
            name: c.name,
            value: c.value,
            domain: c.domain || '.facebook.com',
            path: c.path || '/',
            expires: -1,
            httpOnly: c.httpOnly ?? (c.name === 'xs' || c.name === 'datr'),
            secure: true,
            sameSite: 'Lax'
          });
        }
      }
    } catch {}
  }

  // If not JSON, parse as standard "name=value; name2=value2"
  if (cookieList.length === 0) {
    const pairs = trimmed.split(';');
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const name = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        if (name && value) {
          cookieList.push({
            name,
            value,
            domain: '.facebook.com',
            path: '/',
            expires: -1,
            httpOnly: name === 'xs' || name === 'datr',
            secure: true,
            sameSite: 'Lax'
          });
        }
      }
    }
  }

  if (cookieList.length === 0) {
    throw new Error('Không tìm thấy cookie hợp lệ. Định dạng mẫu: c_user=1000...; xs=2%3A...');
  }

  const storageState = {
    cookies: cookieList,
    origins: []
  };

  fs.writeFileSync(STORAGE_STATE_FILE, JSON.stringify(storageState, null, 2), 'utf-8');
  
  const cUser = cookieList.find(c => c.name === 'c_user')?.value;
  logMessage(`Đã nạp và lưu thành công ${cookieList.length} cookies phiên Facebook (c_user: ${cUser || 'Hợp lệ'}).`, 'success');
  broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

  return {
    success: true,
    message: `Đã lưu thành công ${cookieList.length} cookies phiên đăng nhập Facebook!`,
    userId: cUser,
    cookiesCount: cookieList.length
  };
}

/**
 * Step 1: Mở trình duyệt thực tế để giám sát viên đăng nhập và lưu session vĩnh viễn (Chỉ máy có màn hình)
 */
export async function openBrowserForLogin() {
  const isHeadlessServer = process.platform === 'linux' && !process.env.DISPLAY;
  if (isHeadlessServer) {
    throw new Error(
      'Máy chủ Dokploy đang chạy trên môi trường Linux Server không có màn hình đồ họa X11. Vui lòng sử dụng tính năng "Nhập Cookie Facebook" bên dưới hoặc dùng tab "Thư Viện Quảng Cáo Meta (Không cần đăng nhập)".'
    );
  }

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

  logMessage('Bước 1: Khởi động trình duyệt với hồ sơ lưu trữ an toàn...', 'info');
  currentCrawlerStatus.isRunning = true;
  currentCrawlerStatus.step = 'LOGIN_OPEN';

  try {
    activeBrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      viewport: null,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });

    const page = activeBrowserContext.pages()[0] || await activeBrowserContext.newPage();
    logMessage('Đang mở trang đăng nhập Facebook (https://www.facebook.com)...', 'info');
    await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 45000 });

    logMessage('Cửa sổ trình duyệt đã mở. Cán bộ vui lòng đăng nhập tài khoản Facebook trên cửa sổ này.', 'success');
    logMessage('Cookies và phiên đăng nhập sẽ được lưu vĩnh viễn cho các lần quét tự động.', 'info');

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
 * Làm sạch chuỗi văn bản Facebook
 */
export function cleanFacebookText(rawText, author = '') {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText;

  // 1. Remove repeated "Facebook" blocks (e.g. "Facebook Facebook Facebook...")
  text = text.replace(/(?:\bFacebook\b[\s,.:;·•\-_/|]*){2,}/gi, ' ');
  text = text.replace(/^\s*(?:Facebook[\s,.:;·•\-_/|]*)+/gi, '');
  text = text.replace(/(?:Facebook[\s,.:;·•\-_/|]*)+\s*$/gi, '');
  text = text.replace(/\bFacebook\s+Facebook\b/gi, '');

  // 2. Remove automated Facebook image alt text
  text = text.replace(/Có thể là hình ảnh về[^\n\.]*(?:\.|\n|$)/gi, ' ');
  text = text.replace(/May be an image of[^\n\.]*(?:\.|\n|$)/gi, ' ');

  // 3. Remove Facebook UI/interaction metadata strings
  text = text.replace(/Đã chia sẻ bài viết\s*\d*[\s\d]*.*$/gi, '');
  text = text.replace(/\b(Chỉ báo trạng thái online|Đang hoạt động trên FB|Đang hoạt động)\b/gi, '');
  text = text.replace(/\b(Thích|Bình luận|Chia sẻ|Gửi tin nhắn|Xem thêm|Gợi ý cho bạn|Gợi ý)\b/gi, '');

  // 4. Remove author redundancy if it starts with the author name
  if (author) {
    const cleanAuth = author.trim();
    if (cleanAuth && text.startsWith(cleanAuth)) {
      text = text.slice(cleanAuth.length).trim();
    }
  }

  // 5. Clean extra symbols and whitespace
  text = text.replace(/[·•]\s*[·•]+/g, '·');
  text = text.replace(/^[·•,\s\-_:]+/, '');
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/**
 * Step 2, 3, 4 (PRODUCTION): Rà soát thật 100% trên Facebook (Đơn từ khóa HOẶC Quét hàng loạt toàn bộ Chuyên mục)
 */
export async function runScrapeAndInspect(options = {}) {
  const {
    keyword,
    keywords = [],
    categoryName = '',
    maxPosts = 100
  } = options;

  // Chuẩn hóa danh sách từ khóa: hỗ trợ cả đơn từ khóa lẫn danh sách chuyên mục
  let keywordList = [];
  if (Array.isArray(keywords) && keywords.length > 0) {
    keywordList = keywords.map(k => (typeof k === 'string' ? k.trim() : k.term?.trim())).filter(Boolean);
  } else if (keyword && typeof keyword === 'string' && keyword.trim()) {
    keywordList = [keyword.trim()];
  } else {
    keywordList = ['nâng mũi cấu trúc'];
  }

  // Loại bỏ từ khóa trùng lặp
  keywordList = [...new Set(keywordList)];

  if (currentCrawlerStatus.isRunning && currentCrawlerStatus.step !== 'LOGIN_OPEN') {
    throw new Error('Đang có tiến trình rà soát đang chạy.');
  }

  const isBatchMode = keywordList.length > 1;
  const initialDisplayKeyword = isBatchMode
    ? `${categoryName ? `[${categoryName}] ` : ''}${keywordList[0]} (+${keywordList.length - 1} từ khác)`
    : keywordList[0];

  currentCrawlerStatus.isRunning = true;
  currentCrawlerStatus.step = 'SEARCHING';
  currentCrawlerStatus.currentKeyword = initialDisplayKeyword;
  currentCrawlerStatus.categoryName = categoryName || null;
  currentCrawlerStatus.totalKeywords = keywordList.length;
  currentCrawlerStatus.currentKeywordIndex = 1;
  currentCrawlerStatus.progress = 5;
  currentCrawlerStatus.foundCount = 0;
  currentCrawlerStatus.logs = [];

  if (isBatchMode) {
    logMessage(`⚡ [QUÉT TOÀN BỘ CHUYÊN MỤC] Khởi động quét loạt ${keywordList.length} từ khóa thuộc chuyên mục "${categoryName || 'Y tế Thẩm mỹ'}": ${keywordList.join(', ')}`, 'info');
  } else {
    logMessage(`[PRODUCTION] Khởi động rà soát mạng xã hội với từ khóa y tế: "${keywordList[0]}" (Mục tiêu: ${maxPosts} mục)`, 'info');
  }
  logMessage('Chiến lược: TÁI SỬ DỤNG TRÌNH DUYỆT - ƯU TIÊN FANPAGE TRƯỚC HỘI NHÓM - BÓC TÁCH ĐA PHƯƠNG TIỆN', 'info');
  logMessage('Căn cứ pháp lý: Luật KCB 15/2023/QH15, NĐ 96/2023/NĐ-CP, Luật QC 16/2012, NĐ 117/2020/NĐ-CP, NĐ 38/2021/NĐ-CP', 'info');

  let browserContext = activeBrowserContext;
  let createdOwnContext = false;

  try {
    const hasProfile = fs.existsSync(USER_DATA_DIR) && fs.readdirSync(USER_DATA_DIR).length > 0;
    if (!hasProfile && !browserContext) {
      logMessage('CẢNH BÁO: Chưa phát hiện phiên đăng nhập Facebook đã lưu trong thư mục fb_session_data!', 'warning');
      logMessage('Hệ thống khuyến nghị cán bộ nhấn "B1: Mở Trình Duyệt Đăng Nhập FB" hoặc nạp cookie để kết quả tìm kiếm đầy đủ nhất.', 'warning');
    }

    if (!browserContext) {
      ensureNoOrphanedChrome();
      logMessage('Khởi chạy tiến trình Playwright kết nối với hồ sơ Facebook lưu trữ...', 'info');

      browserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: true, // headless mode for production scan
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-default-browser-check'
        ]
      });

      // Inject saved cookies from storageState.json if present
      if (fs.existsSync(STORAGE_STATE_FILE)) {
        try {
          const state = JSON.parse(fs.readFileSync(STORAGE_STATE_FILE, 'utf8'));
          if (state.cookies && state.cookies.length > 0) {
            await browserContext.addCookies(state.cookies);
            logMessage(`Đã nạp ${state.cookies.length} cookies phiên Facebook đã lưu.`, 'info');
          }
        } catch (e) {
          console.warn('Lỗi đọc storageState:', e.message);
        }
      }
      createdOwnContext = true;
    }

    const page = await browserContext.newPage();
    let candidateItems = [];

    // Số lượng bài viết phân bổ cho mỗi từ khóa nếu chạy chế độ quét toàn bộ chuyên mục
    const perKeywordMaxPosts = isBatchMode
      ? Math.max(15, Math.ceil(maxPosts / Math.min(keywordList.length, 5)))
      : maxPosts;

    for (let kIdx = 0; kIdx < keywordList.length; kIdx++) {
      const currentKw = keywordList[kIdx];
      currentCrawlerStatus.currentKeyword = currentKw;
      currentCrawlerStatus.currentKeywordIndex = kIdx + 1;
      const baseProgress = Math.round((kIdx / keywordList.length) * 75);
      currentCrawlerStatus.progress = Math.max(10, baseProgress);
      broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

      logMessage(`\n--- [TỪ KHÓA ${kIdx + 1}/${keywordList.length}] Rà soát: "${currentKw}" ---`, 'info');

      // GIAI ĐOẠN 1: Quét Fanpage liên quan đến currentKw
      const pagesSearchUrl = `https://www.facebook.com/search/pages/?q=${encodeURIComponent(currentKw)}`;
      logMessage(`[${currentKw}] Rà soát danh mục Trang Fanpage: ${pagesSearchUrl}`, 'info');

      try {
        await page.goto(pagesSearchUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await page.waitForTimeout(2500);

        for (let s = 1; s <= 2; s++) {
          await page.evaluate(() => window.scrollBy(0, 1000));
          await page.waitForTimeout(1000);
        }

        const extractedPages = await page.evaluate((kw) => {
          const results = [];
          const items = document.querySelectorAll('div[role="feed"] > div, div[role="article"], div.x1yztbdb');
          items.forEach((el) => {
            if (results.length >= 20) return;
            const clone = el.cloneNode(true);
            clone.querySelectorAll('svg, button, form, [role="button"], [aria-label*="Facebook"]').forEach(n => n.remove());
            const text = (clone.innerText || '').trim();
            if (text.length < 15) return;

            const heading = el.querySelector('h2 a, h3 a, h4 a, a[role="link"]');
            if (!heading) return;
            const name = (heading.innerText || '').trim();
            if (name.length < 2 || /facebook|thích|theo dõi|trạng thái/i.test(name)) return;

            const pageUrl = heading.href || window.location.href;
            const imgs = Array.from(el.querySelectorAll('img'))
              .map(i => i.src)
              .filter(src => src && src.startsWith('http') && !src.includes('rsrc.php'));

            results.push({
              author: name,
              authorHandle: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              rawContent: text.slice(0, 600),
              postType: 'Trang Fanpage',
              postUrl: pageUrl,
              mediaUrl: imgs[0] || null,
              mediaGallery: imgs.slice(0, 4),
              videoDuration: null,
              isPage: true,
              isGroup: false,
              authorType: 'Page',
              followers: 'Fanpage chính thức',
              matchedKeyword: kw
            });
          });
          return results;
        }, currentKw);

        if (extractedPages.length > 0) {
          logMessage(`[${currentKw}] Đã phát hiện ${extractedPages.length} Fanpage liên quan.`, 'info');
          candidateItems.push(...extractedPages);
        }
      } catch (errPages) {
        console.warn(`Lỗi quét tab Pages cho "${currentKw}":`, errPages.message);
      }

      // GIAI ĐOẠN 2: Quét bài viết Facebook cho currentKw
      const postsSearchUrl = `https://www.facebook.com/search/posts/?q=${encodeURIComponent(currentKw)}`;
      logMessage(`[${currentKw}] Quét bài viết Facebook: ${postsSearchUrl}`, 'info');
      currentCrawlerStatus.step = 'SCRAPING';
      broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

      try {
        await page.goto(postsSearchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(3000);

        const maxScrolls = Math.min(18, Math.max(5, Math.ceil(perKeywordMaxPosts / 4)));
        for (let i = 1; i <= maxScrolls; i++) {
          await page.evaluate(() => window.scrollBy(0, 1600));
          await page.waitForTimeout(1400);
          const postElementsCount = await page.evaluate(() =>
            document.querySelectorAll('div[role="feed"] > div, div[role="article"], div.x1yztbdb').length
          );

          if (postElementsCount >= perKeywordMaxPosts * 1.3) {
            logMessage(`[${currentKw}] Đã nạp đủ ${postElementsCount} bài viết trên Facebook.`, 'info');
            break;
          }
        }

        const extractedPosts = await page.evaluate(({ max, kw }) => {
          const results = [];
          const elements = document.querySelectorAll('div[role="feed"] > div, div[role="article"], div.x1yztbdb');

          elements.forEach((el) => {
            if (results.length >= max * 1.5) return;

            const messageEl = el.querySelector('div[data-ad-preview="message"], div[data-ad-comet-preview="message"], div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r');
            let rawText = '';
            if (messageEl && messageEl.innerText && messageEl.innerText.trim().length > 15) {
              rawText = messageEl.innerText.trim();
            } else {
              const clone = el.cloneNode(true);
              clone.querySelectorAll('svg, button, form, [role="button"], [aria-label*="Facebook"], [aria-label*="thích"], [aria-label*="bình luận"], [aria-label*="chia sẻ"]').forEach(n => n.remove());
              rawText = (clone.innerText || '').trim();
            }

            if (rawText.length < 25) return;

            const authorLinks = Array.from(el.querySelectorAll('h2 a, h3 a, h4 a, strong a, a[role="link"]'));
            const validAuthor = authorLinks.find(a => {
              const t = a.innerText && a.innerText.trim();
              if (!t || t.length < 2 || t.length > 70) return false;
              if (/chỉ báo trạng thái|đang hoạt động|online|facebook|thích|bình luận|chia sẻ|theo dõi|xem thêm|tham gia|gợi ý/i.test(t)) {
                return false;
              }
              return true;
            });

            let authorName = validAuthor ? validAuthor.innerText.trim() : 'Cơ sở Thẩm mỹ Facebook';
            if (authorName.includes('\n')) {
              authorName = authorName.split('\n')[0].trim();
            }

            const allLinks = Array.from(el.querySelectorAll('a[href]')).map(a => a.href || '');
            const hasGroupLink = allLinks.some(href => href.includes('/groups/'));
            const isGroupAuthor = /hội|nhóm|group|cộng đồng|tâm sự|chia sẻ/i.test(authorName);
            const isGroup = hasGroupLink || isGroupAuthor;
            const isPage = !isGroup;

            const permalink = validAuthor ? validAuthor.href : (allLinks[0] || window.location.href);

            const imgs = Array.from(el.querySelectorAll('img'))
              .map(i => i.src)
              .filter(src => src && src.startsWith('http') && !src.includes('emoji') && !src.includes('rsrc.php'));

            const hasVideo = el.querySelectorAll('video').length > 0 || rawText.includes('00:') || rawText.includes('01:') || rawText.includes('Xem thêm video');

            results.push({
              author: authorName,
              authorHandle: `@${authorName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              rawContent: rawText.slice(0, 700),
              postType: hasVideo ? 'Video' : (imgs.length > 0 ? 'Hình ảnh' : 'Bài viết'),
              postUrl: permalink,
              mediaUrl: imgs[0] || null,
              mediaGallery: imgs.slice(0, 4),
              videoDuration: hasVideo ? '01:00' : null,
              isPage,
              isGroup,
              authorType: isPage ? 'Page' : 'Group',
              followers: isPage ? 'Fanpage FB' : 'Hội Nhóm FB',
              matchedKeyword: kw
            });
          });

          return results;
        }, { max: perKeywordMaxPosts, kw: currentKw });

        if (extractedPosts.length > 0) {
          logMessage(`[${currentKw}] Đã trích xuất ${extractedPosts.length} bài viết Facebook.`, 'info');
          candidateItems.push(...extractedPosts);
        }
      } catch (errPosts) {
        console.warn(`Lỗi quét tab Posts cho "${currentKw}":`, errPosts.message);
      }
    }

    await page.close().catch(() => {});

    // Khử trùng lặp (Deduplicate) theo postUrl hoặc author + nội dung đầu
    const seenMap = new Set();
    const uniqueCandidates = [];
    for (const item of candidateItems) {
      const key = item.postUrl ? item.postUrl : `${item.author}_${(item.rawContent || '').slice(0, 40)}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        uniqueCandidates.push(item);
      }
    }

    logMessage(`Tổng hợp qua ${keywordList.length} từ khóa: Đã thu thập ${candidateItems.length} mục -> Khử trùng lặp còn ${uniqueCandidates.length} mục duy nhất.`, 'info');

    // Làm sạch và chuẩn hóa nội dung văn bản cho toàn bộ ứng viên
    const processedItems = uniqueCandidates.map(p => {
      const cleanContent = cleanFacebookText(p.rawContent || p.content, p.author);
      return {
        ...p,
        content: cleanContent || p.rawContent || p.content
      };
    }).filter(p => p.content && p.content.length >= 20);

    // ==========================================
    // ƯU TIÊN SẮP XẾP: Trang Fanpage (Page) lên trước Hội nhóm (Group)
    // ==========================================
    processedItems.sort((a, b) => {
      if (a.isPage && !b.isPage) return -1;
      if (!a.isPage && b.isPage) return 1;
      return 0;
    });

    // Cắt theo số lượng kiểm tra tổng (nếu quét đơn thì maxPosts, nếu quét nhiều từ khóa thì tối đa Math.max(maxPosts, keywordList.length * 20))
    const totalScanLimit = isBatchMode ? Math.max(maxPosts, keywordList.length * 25) : maxPosts;
    const finalItems = processedItems.slice(0, totalScanLimit);

    logMessage(`Đã xử lý trích xuất ${finalItems.length} mục (${finalItems.filter(p => p.isPage).length} Fanpage, ${finalItems.filter(p => p.isGroup).length} Hội nhóm) sẵn sàng đối soát vi phạm.`, 'info');
    if (finalItems.length > 0) {
      incrementScannedCount(finalItems.length);
    }

    // ==========================================
    // BƯỚC 4: Phân tích vi phạm bằng Rule Engine pháp luật y tế
    // ==========================================
    currentCrawlerStatus.step = 'ANALYZING';
    currentCrawlerStatus.progress = 80;
    broadcastEvent({ type: 'STATUS', status: getCrawlerStatus() });

    const newViolations = [];
    const now = new Date();
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (let i = 0; i < finalItems.length; i++) {
      const p = finalItems[i];

      // TỰ ĐỘNG ĐỌC VÀ BÓC TÁCH CHỮ/HÌNH ẢNH/BANNER/VIDEO BẰNG AI MULTIMODAL OCR (KHÔNG CẦN CHỜ ĐỒNG Ý)
      let autoOcrText = p.ocrText || null;
      if (!autoOcrText && p.mediaUrl && typeof p.mediaUrl === 'string' && p.mediaUrl.startsWith('http')) {
        try {
          autoOcrText = await extractOcrFromImageUrl(p.mediaUrl);
          if (autoOcrText) {
            logMessage(`[AI Vision Tự Động] Đã quét chữ & hình ảnh bài viết của "${p.author}": ${autoOcrText.slice(0, 100)}...`, 'info');
          }
        } catch (e) {
          // Bỏ qua lỗi OCR để tiếp tục quy trình
        }
      }

      const analysis = await analyzeContentWithAi({
        ...p,
        ocrText: autoOcrText
      });

      if (analysis.isViolation) {
        const item = {
          id: `vio-real-${Date.now().toString().slice(-6)}-${i}`,
          timestamp: dateFormatted,
          date: now.toISOString(),
          platform: 'Facebook',
          author: p.author,
          authorHandle: p.authorHandle,
          followers: p.followers || (p.isPage ? 'Fanpage FB' : 'Hội Nhóm FB'),
          avatar: p.mediaUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
          content: p.content,
          ocrText: autoOcrText,
          postType: p.postType,
          postUrl: p.postUrl,
          mediaUrl: p.mediaUrl,
          mediaGallery: p.mediaGallery,
          videoDuration: p.videoDuration,
          engagement: { likes: 0, comments: 0, shares: 0 },
          category: analysis.category,
          status: 'Chờ xử lý',
          severity: analysis.severity,
          isGroup: p.isGroup || false,
          authorType: p.authorType || (p.isGroup ? 'Group' : 'Page'),
          violationDetails: analysis.violationDetails,
          legalBasis: analysis.legalBasis,
          recommendations: analysis.recommendations,
          notes: `Tự động phát hiện khi rà soát thật từ khóa "${p.matchedKeyword || keywordList[0]}" (${categoryName ? `Chuyên mục: ${categoryName} - ` : ''}${p.authorType === 'Page' ? 'Trang Fanpage' : 'Hội Nhóm'})`
        };

        addViolation(item);
        newViolations.push(item);
        logMessage(`[PHÁT HIỆN VI PHẠM THẬT] [${item.authorType === 'Page' ? 'Fanpage' : 'Hội Nhóm'}] "${p.author}" - Lỗi: ${analysis.category} (${analysis.severity})`, 'warning');
      }
    }

    currentCrawlerStatus.foundCount = newViolations.length;
    currentCrawlerStatus.progress = 100;
    currentCrawlerStatus.step = 'DONE';
    currentCrawlerStatus.isRunning = false;

    if (newViolations.length > 0) {
      logMessage(`Hoàn tất rà soát thật! Đã kiểm tra ${finalItems.length} mục và lập hồ sơ cho ${newViolations.length} bài viết vi phạm y tế.`, 'success');
      broadcastEvent({ type: 'NEW_VIOLATIONS', items: newViolations });
    } else {
      logMessage(`Hoàn tất rà soát! Đã kiểm tra ${finalItems.length} mục, không phát hiện vi phạm mới hoặc cần mở rộng từ khóa.`, 'info');
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
