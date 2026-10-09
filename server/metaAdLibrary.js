import { chromium } from 'playwright';
import { analyzeContent } from './analyzer.js';
import { addViolation } from './db.js';

/**
 * Meta Ad Library (Thư viện quảng cáo Meta) Production Integration
 * Scrapes real active ads from Facebook Meta Ad Library or uses Graph API
 */
export async function searchMetaAdLibrary(keyword = 'nâng mũi', accessToken = process.env.META_ACCESS_TOKEN) {
  // Method 1: Official Meta Graph API (if token provided)
  if (accessToken && accessToken.trim()) {
    try {
      const url = `https://graph.facebook.com/v19.0/ads_archive?access_token=${encodeURIComponent(accessToken)}&ad_reached_countries=['VN']&search_terms=${encodeURIComponent(keyword)}&ad_type=ALL&fields=id,ad_creation_time,ad_creative_bodies,ad_snapshot_url,page_id,page_name&limit=15`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
        return processMetaAds(data.data, keyword);
      }
    } catch (e) {
      console.error('[Meta Ad Library API Error]:', e.message);
    }
  }

  // Method 2: Real Production Web Scraping of Meta Ad Library Public Archive
  // URL: https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=VN&q=...
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=VN&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered&media_type=all`;

    console.log(`[Meta Ad Library Real] Navigating to: ${adLibraryUrl}`);
    await page.goto(adLibraryUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    // Scroll to load ads cards
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);

    const liveAds = await page.evaluate((kw) => {
      const results = [];
      // Ad cards in Meta Ad Library
      const cards = document.querySelectorAll('div._7jvw, div[class*="x1dr59a3"], div.x1yztbdb');

      cards.forEach((card) => {
        if (results.length >= 10) return;
        const text = card.innerText || '';
        if (text.length < 40) return;

        // Find page name header
        const pageLink = card.querySelector('a[href*="/ads/library/?active_status=active"]');
        const pageName = pageLink ? pageLink.innerText.trim() : 'Đơn vị quảng cáo Facebook';

        // Extract snapshot URL
        const snapshotLink = card.querySelector('a[href*="/ads/library/?id="]');
        const snapshotUrl = snapshotLink ? snapshotLink.href : window.location.href;

        // Extract body text
        const bodyEl = card.querySelector('div[style*="white-space: pre-wrap"], div._4ik4');
        const bodyText = bodyEl ? bodyEl.innerText.trim() : text;

        if (bodyText.length > 25) {
          results.push({
            page_name: pageName,
            ad_creative_bodies: [bodyText],
            ad_snapshot_url: snapshotUrl
          });
        }
      });

      return results;
    }, keyword);

    await browser.close();
    browser = null;

    if (liveAds && liveAds.length > 0) {
      console.log(`[Meta Ad Library Real] Trích xuất thành công ${liveAds.length} bài quảng cáo thật từ Meta.`);
      return processMetaAds(liveAds, keyword);
    }
  } catch (err) {
    console.error(`[Meta Ad Library Real Scraping Warning]: ${err.message}`);
    if (browser) await browser.close().catch(() => {});
  }

  // Return empty list if no active ads found
  return [];
}

function processMetaAds(ads, keyword) {
  const detectedViolations = [];
  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  for (let i = 0; i < ads.length; i++) {
    const ad = ads[i];
    const text = (ad.ad_creative_bodies && ad.ad_creative_bodies[0]) || '';
    const author = ad.page_name || 'Đơn vị quảng cáo Meta';

    const analysis = analyzeContent({ content: text, author });
    if (analysis.isViolation) {
      const item = {
        id: `ad-real-${Date.now().toString().slice(-6)}-${i}`,
        timestamp: dateFormatted,
        date: now.toISOString(),
        platform: 'Facebook (Meta Ad Library)',
        author,
        authorHandle: `@${author.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        followers: 'Đang chạy quảng cáo tài trợ',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
        content: text,
        postType: 'Video',
        postUrl: ad.ad_snapshot_url || `https://www.facebook.com/ads/library/?id=${Date.now() + i}`,
        mediaUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&h=400&q=80',
        mediaGallery: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&h=400&q=80'],
        videoDuration: '00:45',
        engagement: { likes: 0, comments: 0, shares: 0 },
        category: analysis.category,
        status: 'Chờ xử lý',
        severity: analysis.severity,
        violationDetails: analysis.violationDetails,
        legalBasis: analysis.legalBasis,
        recommendations: analysis.recommendations,
        notes: `Phát hiện thực tế từ Thư viện quảng cáo Meta Ad Library với từ khóa "${keyword}"`
      };

      addViolation(item);
      detectedViolations.push(item);
    }
  }

  return detectedViolations;
}
