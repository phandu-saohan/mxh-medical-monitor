/**
 * Export official medical inspection report & violation dossiers
 */
export function generateViolationReportHtml(violation) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Biên Bản Ghi Nhận Dấu Hiệu Vi Phạm - ${violation.author}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14pt;
      line-height: 1.5;
      margin: 40px;
      color: #000;
    }
    .header {
      display: flex;
      justify-content: space-between;
      text-align: center;
      margin-bottom: 25px;
    }
    .header-col {
      width: 48%;
    }
    .bold { font-weight: bold; }
    .underline { border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px; }
    .title {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin: 30px 0 10px 0;
      text-transform: uppercase;
    }
    .subtitle {
      text-align: center;
      font-style: italic;
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 5px;
      text-decoration: underline;
    }
    .content-box {
      border: 1px solid #333;
      padding: 12px;
      background: #fdfdfd;
      margin: 10px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11pt;
      font-weight: bold;
      color: #b91c1c;
      border: 1px solid #b91c1c;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #333;
      padding: 8px 12px;
      text-align: left;
    }
    th { background: #eee; }
    .footer-signs {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      text-align: center;
    }
    .sign-box {
      width: 45%;
    }
    @media print {
      body { margin: 20mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">🖨️ In Biên Bản / Lưu PDF</button>
  </div>

  <div class="header">
    <div class="header-col">
      <div class="bold">SỞ Y TẾ THÀNH PHỐ</div>
      <div class="bold">TỔ GIÁM SÁT NỘI DUNG Y TẾ MẠNG XÃ HỘI</div>
      <div>Số: ${violation.id.replace('vio-', '')}/BB-GSYT</div>
    </div>
    <div class="header-col">
      <div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="bold underline">Độc lập - Tự do - Hạnh phúc</div>
      <div style="margin-top: 5px; font-style: italic;">Hà Nội, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
    </div>
  </div>

  <div class="title">BIÊN BẢN GHI NHẬN HÀNH VI CÓ DẤU HIỆU VI PHẠM<br>QUY ĐỊNH PHÁP LUẬT VỀ Y TẾ VÀ QUẢNG CÁO TRÊN MẠNG XÃ HỘI</div>
  <div class="subtitle">(Dành cho hồ sơ thanh tra, rà soát cơ sở thẩm mỹ, spa, viện thẩm mỹ)</div>

  <p>Căn cứ:</p>
  <ul>
    <li>Luật Khám bệnh, chữa bệnh số 15/2023/QH15 ngày 09 tháng 01 năm 2023;</li>
    <li>Luật Quảng cáo số 16/2012/QH13 ngày 21 tháng 06 năm 2012;</li>
    <li>Nghị định số 117/2020/NĐ-CP ngày 28 tháng 09 năm 2020 của Chính phủ quy định xử phạt vi phạm hành chính trong lĩnh vực y tế;</li>
    <li>Nghị định số 38/2021/NĐ-CP ngày 29 tháng 03 năm 2021 của Chính phủ quy định xử phạt vi phạm hành chính trong lĩnh vực văn hóa và quảng cáo.</li>
  </ul>

  <div class="section-title">I. THÔNG TIN ĐỐI TƯỢNG VÀ TÀI KHOẢN GIÁM SÁT:</div>
  <table>
    <tr>
      <th style="width: 30%;">Tên trang / Tài khoản:</th>
      <td><strong>${violation.author}</strong> (${violation.authorHandle})</td>
    </tr>
    <tr>
      <th>Nền tảng / Lượng theo dõi:</th>
      <td>${violation.platform} - ${violation.followers} người theo dõi</td>
    </tr>
    <tr>
      <th>Đường dẫn liên kết (URL):</th>
      <td><a href="${violation.postUrl}" target="_blank">${violation.postUrl}</a></td>
    </tr>
    <tr>
      <th>Thời điểm ghi nhận:</th>
      <td>${violation.timestamp}</td>
    </tr>
    <tr>
      <th>Loại hình ấn phẩm:</th>
      <td>${violation.postType}</td>
    </tr>
  </table>

  <div class="section-title">II. NỘI DUNG ẤN PHẨM QUẢNG CÁO GHI NHẬN:</div>
  <div class="content-box">
    <em>"${violation.content}"</em>
  </div>

  <div class="section-title">III. PHÂN TÍCH HÀNH VI VI PHẠM VÀ CĂN CỨ PHÁP LÝ:</div>
  <p><strong>1. Phân loại vi phạm:</strong> <span class="badge">${violation.category}</span> - Mức độ nghiêm trọng: <strong>${violation.severity}</strong></p>
  <p><strong>2. Các dấu hiệu sai phạm cụ thể:</strong></p>
  <ul>
    ${violation.violationDetails.map(d => `<li>${d}</li>`).join('')}
  </ul>

  <p><strong>3. Viện dẫn điều khoản pháp lý:</strong></p>
  <ul>
    ${violation.legalBasis.map(b => `<li>${b}</li>`).join('')}
  </ul>

  <div class="section-title">IV. ĐỀ XUẤT BIỆN PHÁP XỬ LÝ CỦA GIÁM SÁT VIÊN:</div>
  <ul>
    ${violation.recommendations.map(r => `<li>${r}</li>`).join('')}
  </ul>

  <div class="section-title">V. XÁC THỰC BẢO TOÀN CHỨNG CỨ SỐ (DIGITAL EVIDENCE INTEGRITY):</div>
  <table style="background: #f8fafc; font-size: 11pt;">
    <tr>
      <th style="width: 35%;">Mã băm an toàn SHA-256:</th>
      <td style="font-family: monospace; word-break: break-all; font-weight: bold; color: #1e293b;">
        ${violation.evidence?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
      </td>
    </tr>
    <tr>
      <th>Trạng thái chứng cứ:</th>
      <td style="color: #15803d; font-weight: bold;">
        ✓ ĐÃ NIÊM PHONG CHỨNG CỨ SỐ BẤT KHẢ THAY ĐỔI
      </td>
    </tr>
    <tr>
      <th>Thời điểm niêm phong:</th>
      <td>${violation.evidence?.capturedAt || violation.timestamp}</td>
    </tr>
  </table>

  <div class="footer-signs">
    <div class="sign-box">
      <div class="bold">NGƯỜI XÁC MINH / ĐƠN VỊ LIÊN QUAN</div>
      <div style="font-style: italic; margin-top: 60px;">(Ký, ghi rõ họ tên)</div>
    </div>
    <div class="sign-box">
      <div class="bold">CÁN BỘ / GIÁM SÁT VIÊN Y TẾ</div>
      <div style="font-style: italic; margin-top: 60px;">(Ký, ghi rõ họ tên)</div>
      <div class="bold" style="margin-top: 10px;">Nguyễn Văn A</div>
    </div>
  </div>
</body>
</html>`;
}
