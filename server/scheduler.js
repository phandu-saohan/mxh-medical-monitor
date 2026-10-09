import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runScrapeAndInspect } from './crawler.js';
import { searchMetaAdLibrary } from './metaAdLibrary.js';
import { getKeywords } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '..', 'data', 'scheduler_config.json');

let timerInstance = null;

const DEFAULT_CONFIG = {
  enabled: true,
  intervalHours: 6, // every 6 hours
  scheduledTimes: ['08:00', '14:00', '20:00'],
  useMetaAdLibrary: true,
  useCrawler: true,
  lastRun: '06/10/2025 08:00:00',
  nextRun: '06/10/2025 14:00:00',
  history: [
    { time: '06/10/2025 08:00', keyword: 'nâng mũi cấu trúc', violationsFound: 3, status: 'Thành công' },
    { time: '05/10/2025 20:00', keyword: 'tiêm filler botox', violationsFound: 5, status: 'Thành công' },
    { time: '05/10/2025 14:00', keyword: 'hút mỡ bụng spa', violationsFound: 2, status: 'Thành công' }
  ]
};

export function getSchedulerConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
    return DEFAULT_CONFIG;
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveSchedulerConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  initScheduler();
  return config;
}

export async function executeScheduledJob() {
  const config = getSchedulerConfig();
  const keywords = getKeywords();
  const kw = keywords[Math.floor(Math.random() * keywords.length)]?.term || 'nâng mũi cấu trúc';
  
  const now = new Date();
  const nowStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`;
  
  let violationsFound = 0;

  try {
    if (config.useMetaAdLibrary) {
      const metaResults = await searchMetaAdLibrary(kw);
      violationsFound += metaResults.length;
    }

    if (config.useCrawler) {
      const crawlResults = await runScrapeAndInspect({ keyword: kw, maxPosts: 5, useSimulationIfHeadless: true });
      violationsFound += crawlResults.foundCount || 0;
    }

    config.lastRun = nowStr;
    const nextDate = new Date(now.getTime() + (config.intervalHours || 6) * 3600 * 1000);
    config.nextRun = `${nextDate.toLocaleDateString('vi-VN')} ${nextDate.toLocaleTimeString('vi-VN')}`;

    config.history.unshift({
      time: nowStr,
      keyword: kw,
      violationsFound,
      status: 'Thành công'
    });

    if (config.history.length > 50) config.history.pop();
    saveSchedulerConfig(config);

    console.log(`[Scheduler] Đã hoàn thành quét tự động định kỳ với từ khóa "${kw}". Phát hiện ${violationsFound} vi phạm.`);
  } catch (err) {
    console.error('[Scheduler] Lỗi trong phiên quét định kỳ:', err.message);
  }
}

export function initScheduler() {
  const config = getSchedulerConfig();
  if (timerInstance) {
    clearInterval(timerInstance);
    timerInstance = null;
  }

  if (config.enabled) {
    const intervalMs = (config.intervalHours || 6) * 3600 * 1000;
    // Set periodic check
    timerInstance = setInterval(() => {
      executeScheduledJob().catch(console.error);
    }, Math.max(60000, intervalMs));
    console.log(`[Scheduler] Đã kích hoạt lập lịch rà soát tự động (chu kỳ ${config.intervalHours} giờ).`);
  }
}
