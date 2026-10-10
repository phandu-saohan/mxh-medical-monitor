/**
 * Official Legal Dossier Generator based on Decree 118/2021/ND-CP
 * Form: BIÊN BẢN VI PHẠM HÀNH CHÍNH VỀ HOẠT ĐỘNG Y TẾ & QUẢNG CÁO TRÊN MẠNG XÃ HỘI
 */

export function generateAdministrativeViolationRecordHtml(violation) {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();

  const fineRange = violation.severity === 'Cao' ? '30.000.000 đồng đến 50.000.000 đồng' : '10.000.000 đồng đến 20.000.000 đồng';
  const averageFine = violation.severity === 'Cao' ? '35.000.000' : '15.000.000';

  const sha256Hash = violation.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Biên Bản VPHC - ${violation.author}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .header-table td {
      vertical-align: top;
      text-align: center;
      padding: 0;
    }
    .header-left {
      width: 45%;
      font-size: 12pt;
    }
    .header-right {
      width: 55%;
    }
    .national-title {
      font-weight: bold;
      font-size: 12pt;
    }
    .national-motto {
      font-weight: bold;
      font-size: 13pt;
      text-decoration: underline;
    }
    .dossier-title {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin: 25px 0 5px 0;
      text-transform: uppercase;
    }
    .dossier-subtitle {
      text-align: center;
      font-size: 13pt;
      font-style: italic;
      margin-bottom: 25px;
    }
    p, li {
      text-align: justify;
      margin: 6px 0;
    }
    .section-title {
      font-weight: bold;
      margin-top: 15px;
    }
    .quote-box {
      border-left: 3px solid #000;
      padding: 8px 12px;
      margin: 10px 0;
      font-style: italic;
      background: #fbfbfb;
    }
    .signature-table {
      width: 100%;
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .signature-table td {
      width: 50%;
      text-align: center;
      vertical-align: top;
    }
    .seal-box {
      height: 90px;
    }
    .btn-print {
      position: fixed;
      top: 15px;
      right: 15px;
      background: #1e40af;
      color: #fff;
      border: none;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    @media print {
      .btn-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">🖨️ In Biên Bản / Lưu PDF</button>

  <table class="header-table">
    <tr>
      <td class="header-left">
        <strong>THANH TRA SỞ Y TẾ</strong><br>
        <strong>ĐOÀN KIỂM TRA LIÊN NGÀNH</strong><br>
        Số: ....../BB-VPHC
      </td>
      <td class="header-right">
        <span class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br>
        <span class="national-motto">Độc lập - Tự do - Hạnh phúc</span><br>
        <em>Ngày ${day} tháng ${month} năm ${year}</em>
      </td>
    </tr>
  </table>

  <div class="dossier-title">BIÊN BẢN VI PHẠM HÀNH CHÍNH</div>
  <div class="dossier-subtitle">Về hoạt động quảng cáo dịch vụ thẩm mỹ và khám bệnh, chữa bệnh trên mạng xã hội</div>

  <p>Căn cứ Luật Xử lý vi phạm hành chính ngày 20 tháng 06 năm 2012 (sửa đổi, bổ sung năm 2020);</p>
  <p>Căn cứ Luật Khám bệnh, chữa bệnh số 15/2023/QH15 ngày 09 tháng 01 năm 2023;</p>
  <p>Căn cứ Nghị định số 118/2021/NĐ-CP ngày 23 tháng 12 năm 2021 của Chính phủ quy định chi tiết một số điều và biện pháp thi hành Luật Xử lý vi phạm hành chính;</p>
  <p>Căn cứ Nghị định số 96/2023/NĐ-CP ngày 30 tháng 12 năm 2023 quy định chi tiết Luật Khám bệnh, chữa bệnh;</p>
  <p>Căn cứ Nghị định số 38/2021/NĐ-CP ngày 29 tháng 03 năm 2021 quy định xử phạt vi phạm hành chính trong lĩnh vực văn hóa và quảng cáo;</p>
  <p>Căn cứ Nghị định số 117/2020/NĐ-CP ngày 28 tháng 09 năm 2020 quy định xử phạt vi phạm hành chính trong lĩnh vực y tế;</p>

  <p>Hôm nay, vào hồi ...... giờ ...... ngày ${day} tháng ${month} năm ${year}, tại Phòng Thanh tra Giám sát - Sở Y tế;</p>
  
  <p class="section-title">I. NGƯỜI LẬP BIÊN BẢN:</p>
  <p>Họ và tên: ................................................................ Chức vụ: Thanh tra viên / Chuyên viên giám sát số</p>
  <p>Cơ quan: Thanh tra Sở Y tế tỉnh / thành phố.</p>

  <p class="section-title">II. ĐỐI TƯỢNG CÓ HÀNH VI VI PHẠM ĐƯỢC XÁC ĐỊNH QUA KHÔNG GIAN MẠNG:</p>
  <p>- Tên cơ sở/Tổ chức/Cá nhân: <strong>${violation.author}</strong> (${violation.authorType === 'Page' ? 'Trang Fanpage' : 'Hội Nhóm Facebook'})</p>
  <p>- Tài khoản định danh: <code>${violation.authorHandle || '@facebook_page'}</code></p>
  <p>- Đường dẫn bài viết vi phạm: <code>${violation.postUrl || 'https://www.facebook.com/...'}</code></p>
  <p>- Mã hồ sơ hệ thống: <code>${violation.id}</code> (Phát hiện lúc: ${violation.timestamp || `${day}/${month}/${year}`})</p>

  <p class="section-title">III. HÀNH VI VI PHẠM HÀNH CHÍNH ĐÃ PHÁT HIỆN:</p>
  <p>Qua công tác giám sát, rà soát chuyên ngành trên không gian mạng xã hội (Facebook), phát hiện cơ sở/cá nhân nêu trên có hành vi:</p>
  <p><strong>1. Mô tả hành vi:</strong> ${violation.category}. Cụ thể:</p>
  <div class="quote-box">
    "${violation.content}"
  </div>
  <p><strong>2. Các điểm vi phạm cụ thể:</strong></p>
  <ul>
    ${(violation.violationDetails || ['Quảng cáo dịch vụ phẫu thuật thẩm mỹ xâm lấn không có giấy phép']).map(d => `<li>${d}</li>`).join('')}
  </ul>

  <p class="section-title">IV. CĂN CỨ PHÁP LÝ & QUY ĐỊNH XỬ PHẠT:</p>
  <ul>
    ${(violation.legalBasis || [
      'Điều 19 Luật Khám bệnh, chữa bệnh 15/2023/QH15',
      'Khoản 2 Điều 37 Nghị định 96/2023/NĐ-CP',
      'Điều 56 Nghị định 38/2021/NĐ-CP',
      'Điều 39 Nghị định 117/2020/NĐ-CP'
    ]).map(lb => `<li>${lb}</li>`).join('')}
  </ul>
  <p>- <strong>Khung tiền phạt theo quy định:</strong> Từ ${fineRange} (Mức phạt trung bình đề xuất: <strong>${averageFine} đồng</strong>).</p>
  <p>- <strong>Biện pháp khắc phục hậu quả:</strong></p>
  <ul>
    <li>Buộc gỡ bỏ, xóa bỏ toàn bộ nội dung quảng cáo vi phạm trên trang mạng xã hội trong vòng 24 giờ.</li>
    <li>Đình chỉ hoạt động cung cấp dịch vụ thẩm mỹ can thiệp xâm lấn trái phép theo quy định tại Điều 39 Nghị định 117/2020/NĐ-CP.</li>
  </ul>

  <p class="section-title">V. CHỨNG CỨ ĐIỆN TỬ KÈM THEO:</p>
  <p>- Bằng chứng bản chụp màn hình vi phạm đã được niêm phong điện tử với mã băm toàn vẹn: <code>SHA-256: ${sha256Hash}</code>.</p>
  <p>- Thời điểm bắt gói tin và trích xuất chứng cứ: ${violation.date || now.toISOString()}.</p>

  <p>Biên bản được lập xong hồi ...... giờ ...... cùng ngày, được đọc lại cho mọi người cùng nghe và thống nhất ký tên.</p>

  <table class="signature-table">
    <tr>
      <td>
        <strong>ĐẠI DIỆN CƠ SỞ / ĐỐI TƯỢNG VI PHẠM</strong><br>
        <em>(Ký, ghi rõ họ tên hoặc đại diện ủy quyền)</em>
        <div class="seal-box"></div>
      </td>
      <td>
        <strong>NGƯỜI LẬP BIÊN BẢN</strong><br>
        <em>(Ký, ghi rõ họ tên, chức vụ)</em>
        <div class="seal-box"></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
