import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { updateViolation, getViolations } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EVIDENCE_DIR = path.join(__dirname, '..', 'data', 'evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

/**
 * Calculates SHA-256 checksum of a buffer or file
 */
export function calculateSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Creates legal evidence snapshot with digital timestamp and SHA-256 cryptographic proof
 */
export async function captureLegalEvidence(violationId) {
  const violations = getViolations();
  const item = violations.find(v => v.id === violationId);
  if (!item) {
    throw new Error('Không tìm thấy bản ghi vi phạm.');
  }

  const now = new Date();
  const timestampIso = now.toISOString();
  const formattedTime = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`;
  const filename = `${violationId}_evidence.png`;
  const filePath = path.join(EVIDENCE_DIR, filename);

  // Create an SVG-based high-fidelity evidence snapshot proof sheet
  // containing all metadata, author, full post text, legal violations, and visual proof
  const svgSnapshot = `<svg width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
    <style>
      .bg { fill: #f8fafc; }
      .header-bg { fill: #0f172a; }
      .title { font-family: sans-serif; font-size: 20px; font-weight: bold; fill: #ffffff; }
      .sub { font-family: sans-serif; font-size: 13px; fill: #94a3b8; }
      .card { fill: #ffffff; stroke: #cbd5e1; stroke-width: 1.5; rx: 8; }
      .label { font-family: sans-serif; font-size: 12px; font-weight: bold; fill: #475569; }
      .val { font-family: sans-serif; font-size: 14px; fill: #0f172a; }
      .content { font-family: sans-serif; font-size: 14px; fill: #1e293b; line-height: 1.5; }
      .badge { fill: #fee2e2; stroke: #f87171; rx: 4; }
      .badge-text { font-family: sans-serif; font-size: 12px; font-weight: bold; fill: #b91c1c; }
      .hash-box { fill: #f1f5f9; stroke: #94a3b8; stroke-dasharray: 4; rx: 6; }
      .hash-text { font-family: monospace; font-size: 11px; fill: #334155; }
      .watermark { font-family: sans-serif; font-size: 11px; font-weight: bold; fill: #64748b; }
    </style>
    
    <rect width="1000" height="700" class="bg" />
    
    <!-- Top Header Bar -->
    <rect width="1000" height="90" class="header-bg" />
    <text x="30" y="42" class="title">BẰNG CHỨNG GIÁM SÁT VI PHẠM Y TẾ &amp; QUẢNG CÁO MẠNG XÃ HỘI</text>
    <text x="30" y="68" class="sub">HỒ SƠ THANH TRA • THỜI ĐIỂM CHỤP: ${formattedTime} • MÃ HỒ SƠ: ${item.id.toUpperCase()}</text>
    
    <!-- Case Overview Card -->
    <rect x="30" y="115" width="940" height="150" class="card" />
    <text x="50" y="145" class="label">ĐỐI TƯỢNG GIÁM SÁT:</text>
    <text x="220" y="145" class="val" font-weight="bold">${item.author} (${item.authorHandle || '@mxh'})</text>
    
    <text x="50" y="175" class="label">NỀN TẢNG / FOLLOWERS:</text>
    <text x="220" y="175" class="val">${item.platform} • ${item.followers} người theo dõi</text>
    
    <text x="50" y="205" class="label">LIÊN KẾT GỐC (URL):</text>
    <text x="220" y="205" class="val" fill="#2563eb">${item.postUrl}</text>

    <text x="50" y="235" class="label">LOẠI VI PHẠM ĐỐI CHIẾU:</text>
    <rect x="220" y="220" width="320" height="26" class="badge" />
    <text x="230" y="238" class="badge-text">⚠ ${item.category} (Mức độ: ${item.severity})</text>
    
    <!-- Post Content Proof Box -->
    <rect x="30" y="285" width="940" height="190" class="card" />
    <text x="50" y="315" class="label">NỘI DUNG TOÀN VĂN GHI NHẬN TỪ BÀI ĐĂNG GỐC:</text>
    
    <foreignObject x="50" y="330" width="900" height="130">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
        &quot;${item.content.replace(/"/g, '&quot;')}&quot;
      </div>
    </foreignObject>
    
    <!-- Legal Grounds -->
    <rect x="30" y="495" width="940" height="85" class="card" />
    <text x="50" y="525" class="label">CĂN CỨ XỬ LÝ VI PHẠM HÀNH CHÍNH:</text>
    <text x="50" y="550" class="val">• Luật Khám bệnh, chữa bệnh 15/2023/QH15 &amp; Luật Quảng cáo 16/2012/QH13</text>
    <text x="50" y="570" class="val">• Nghị định 117/2020/NĐ-CP (Điều 39, 40) &amp; Nghị định 38/2021/NĐ-CP (Điều 56)</text>

    <!-- Digital Evidence Integrity Footer (SHA-256) -->
    <rect x="30" y="600" width="940" height="75" class="hash-box" />
    <text x="50" y="625" class="watermark">KHÓA BẢO VỆ TOÀN VẸN CHỨNG CỨ PHÁP LÝ (DIGITAL EVIDENCE INTEGRITY - SHA256):</text>
    <text x="50" y="648" class="hash-text" font-weight="bold">MÃ BĂM SHA-256: [TÍNH TOÁN THEO NỘI DUNG VÀ THỜI ĐIỂM CHỤP]</text>
  </svg>`;

  const buffer = Buffer.from(svgSnapshot, 'utf-8');
  const sha256 = calculateSha256(buffer);

  // Inject final computed hash into the file
  const finalSvg = svgSnapshot.replace('[TÍNH TOÁN THEO NỘI DUNG VÀ THỜI ĐIỂM CHỤP]', sha256);
  fs.writeFileSync(filePath, Buffer.from(finalSvg, 'utf-8'));

  const evidenceData = {
    hasEvidence: true,
    evidenceFile: filename,
    evidenceUrl: `/api/evidence/${filename}`,
    sha256,
    capturedAt: formattedTime,
    timestampIso,
    inspector: 'Nguyễn Văn A'
  };

  updateViolation(violationId, { evidence: evidenceData });
  return evidenceData;
}
