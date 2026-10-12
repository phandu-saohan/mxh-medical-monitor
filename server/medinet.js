/**
 * Tra cứu giấy phép hoạt động cơ sở y tế / thẩm mỹ trên Cổng thông tin Sở Y tế TP.HCM (tracuu.medinet.org.vn)
 * @param {string} query Tên cơ sở hoặc số Giấy phép hoạt động (GPHĐ)
 * @param {object} options Các tùy chọn nâng cao
 */
export async function searchMedinetLicense(query, options = {}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      success: false,
      found: false,
      count: 0,
      query: '',
      facilities: [],
      message: 'Vui lòng cung cấp tên cơ sở hoặc số giấy phép để tra cứu.'
    };
  }

  // Làm sạch từ khóa tìm kiếm (bỏ các tiền tố như Thẩm mỹ viện, Viện thẩm mỹ, Dr, Bác sĩ nếu quá dài)
  let cleanQuery = query.trim()
    .replace(/^([Tt]rực\s+tiếp\s+|[Cc]ùng\s+|[Hh]ội\s+|[Nn]hóm\s+)/, '')
    .trim();

  try {
    const response = await fetch('https://tracuu.medinet.org.vn/cosokhamchuabenh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://tracuu.medinet.org.vn/'
      },
      body: JSON.stringify({
        key_word: cleanQuery,
        checked: 0, // 0 = tương đối, 1 = chính xác
        page: 1,
        results_per_page: options.limit || 5
      }),
      timeout: 12000
    });

    if (!response.ok) {
      throw new Error(`Cổng Medinet phản hồi mã trạng thái: ${response.status}`);
    }

    const html = await response.text();

    // Phân tích kết quả từ HTML trả về
    const facilities = [];
    const cardBlocks = html.split('<div class="card hospital-card">');
    cardBlocks.shift(); // bỏ phần đầu trước card đầu tiên

    for (const block of cardBlocks) {
      // 1. Mã định danh chi tiết (data-class)
      const dataClassMatch = block.match(/data-class=([a-zA-Z0-9\-]+)/);
      const dataClass = dataClassMatch ? dataClassMatch[1] : null;

      // 2. Tên cơ sở và số GPHĐ
      const titleMatch = block.match(/<h5[^>]*>([\s\S]*?)<\/h5>/);
      let titleHtml = titleMatch ? titleMatch[1] : '';

      const spanMatch = titleHtml.match(/<span>([\s\S]*?)<\/span>/);
      let licenseInfo = spanMatch ? spanMatch[1].replace(/&nbsp;/g, ' ').trim() : '';

      // Tách số GPHĐ và ngày cấp chuẩn
      let licenseNumber = '';
      let issueDate = '';
      if (licenseInfo) {
        const dateMatch = licenseInfo.match(/\[(\d{1,2}\/\d{1,2}\/\d{4})\]/);
        issueDate = dateMatch ? dateMatch[1] : '';
        const numMatch = licenseInfo.match(/^([0-9A-Z\/\-\s]+GPHĐ)/i);
        licenseNumber = numMatch ? numMatch[1].trim() : licenseInfo.split('-')[0].trim();
      }

      // Tên cơ sở y tế
      const cleanName = titleHtml
        .replace(/<i[^>]*>[\s\S]*?<\/i>/g, '')
        .replace(/<span>[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

      // 3. Địa chỉ cơ sở
      const addressMatch = block.match(/<i class="fas fa-map-marker-alt me-1"><\/i>([\s\S]*?)<\/p>/);
      const address = addressMatch
        ? addressMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
        : '';

      // 4. Trạng thái hoạt động
      const statusMatch = block.match(/<span class="font-weight-bold[^\"]*">([^<]+)<\/span>/);
      const status = statusMatch ? statusMatch[1].trim() : 'Đang hoạt động';

      // 5. Ghi chú vi phạm hành chính (nếu có trong Quyết định xử phạt của Thanh tra Sở)
      const dangerMatch = block.match(/<span class="text-danger[^\"]*">([^<]+)<\/span>/);
      const sanctionNote = dangerMatch ? dangerMatch[1].trim() : null;

      if (cleanName) {
        facilities.push({
          id: dataClass,
          facilityName: cleanName,
          licenseInfo,
          licenseNumber,
          issueDate,
          address,
          status,
          sanctionNote,
          detailUrl: dataClass ? `https://tracuu.medinet.org.vn/detail/${dataClass}` : 'https://tracuu.medinet.org.vn',
          verifiedAt: new Date().toISOString()
        });
      }
    }

    const hasResults = facilities.length > 0;
    return {
      success: true,
      found: hasResults,
      count: facilities.length,
      query: cleanQuery,
      facilities,
      source: 'Cổng tra cứu Hành nghề Y Dược - Sở Y tế TP.HCM (tracuu.medinet.org.vn)',
      directPortalUrl: `https://tracuu.medinet.org.vn`,
      summary: hasResults
        ? `Đã tìm thấy ${facilities.length} cơ sở y tế được cấp phép phù hợp trên hệ thống Medinet.`
        : `KHÔNG TÌM THẤY giấy phép hoạt động nào của cơ sở "${cleanQuery}" trên Cổng tra cứu Sở Y tế TP.HCM.`
    };
  } catch (err) {
    console.error('[Medinet Lookup Error]', err.message);
    return {
      success: false,
      found: false,
      count: 0,
      query: cleanQuery,
      facilities: [],
      error: err.message,
      directPortalUrl: 'https://tracuu.medinet.org.vn',
      summary: `Lỗi kết nối cổng tra cứu Medinet: ${err.message}`
    };
  }
}
