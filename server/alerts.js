import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const ALERTS_CONFIG_FILE = path.join(DATA_DIR, 'alerts_config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default alerts configuration
const DEFAULT_ALERTS_CONFIG = {
  telegramEnabled: false,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  alertOnHighSeverityOnly: true,
  autoNotifyAutoPilot: true,
  lastAlertTime: null
};

export function getAlertsConfig() {
  if (!fs.existsSync(ALERTS_CONFIG_FILE)) {
    fs.writeFileSync(ALERTS_CONFIG_FILE, JSON.stringify(DEFAULT_ALERTS_CONFIG, null, 2), 'utf-8');
    return DEFAULT_ALERTS_CONFIG;
  }
  try {
    const raw = fs.readFileSync(ALERTS_CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_ALERTS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ALERTS_CONFIG;
  }
}

export function saveAlertsConfig(config) {
  const current = getAlertsConfig();
  const merged = { ...current, ...config };
  fs.writeFileSync(ALERTS_CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

/**
 * Gửi tin nhắn kiểm tra kết nối Telegram Bot
 */
export async function testTelegramConnection(botToken, chatId) {
  const token = botToken || getAlertsConfig().telegramBotToken;
  const targetChatId = chatId || getAlertsConfig().telegramChatId;

  if (!token || !targetChatId) {
    throw new Error('Vui lòng cung cấp cả Telegram Bot Token và Chat ID.');
  }

  const message = `🚨 <b>[MXH-COMPLIANCE] KIỂM TRA KẾT NỐI HỆ THỐNG CẢNH BÁO</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ Hệ thống Giám sát Tuân thủ Y tế trên Mạng xã hội đã kết nối thành công với nhóm Telegram này.\n` +
    `⏱️ Thời gian: ${new Date().toLocaleString('vi-VN')}\n` +
    `🔔 Các vi phạm quảng cáo thẩm mỹ xâm lấn trái phép sẽ tự động được gửi về đây theo thời gian thực.`;

  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: targetChatId,
      text: message,
      parse_mode: 'HTML'
    })
  });

  const resJson = await response.json();
  if (!resJson.ok) {
    throw new Error(`Telegram API lỗi: ${resJson.description || 'Không thể gửi tin'}`);
  }

  return { success: true, message: 'Đã gửi tin nhắn thử nghiệm thành công vào Telegram!' };
}

/**
 * Gửi cảnh báo vi phạm y tế tự động về Telegram
 */
export async function sendTelegramViolationAlert(violation) {
  const config = getAlertsConfig();
  if (!config.telegramEnabled || !config.telegramBotToken || !config.telegramChatId) {
    return false;
  }

  // Filter if configured for high severity only
  if (config.alertOnHighSeverityOnly && violation.severity !== 'Cao') {
    return false;
  }

  try {
    const isPage = violation.authorType === 'Page' || !violation.isGroup;
    const typeBadge = isPage ? '🏢 [FANPAGE]' : '👥 [HỘI NHÓM]';
    const cleanContent = (violation.content || '').slice(0, 350);

    const message = 
      `🚨 <b>PHÁT HIỆN VI PHẠM Y TẾ & THẨM MỸ MỚI</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 <b>Cơ sở/Trang:</b> <b>${violation.author || 'Chưa định danh'}</b> ${typeBadge}\n` +
      `⚠️ <b>Mức độ:</b> 🔴 <b>${violation.severity || 'Cao'}</b> | <b>Loại:</b> ${violation.category}\n` +
      `⏱️ <b>Thời gian:</b> ${violation.timestamp || new Date().toLocaleString('vi-VN')}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 <b>Nội dung trích dẫn:</b>\n<i>"${cleanContent}..."</i>\n\n` +
      `⚖️ <b>Căn cứ pháp lý:</b>\n` +
      `• Luật Khám bệnh, chữa bệnh 15/2023/QH15\n` +
      `• Nghị định 96/2023/NĐ-CP & Nghị định 38/2021/NĐ-CP\n` +
      `💰 <b>Mức phạt đề xuất:</b> 30.000.000đ - 50.000.000đ\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 <a href="${violation.postUrl || '#'}">Xem bài viết trên Facebook</a> | 📋 Mã hồ sơ: <code>${violation.id}</code>`;

    const url = `https://api.telegram.org/bot${encodeURIComponent(config.telegramBotToken)}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const resJson = await response.json();
    return resJson.ok;
  } catch (err) {
    console.warn('[Telegram Alert Warning]:', err.message);
    return false;
  }
}
