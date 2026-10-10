/**
 * AI Vision OCR & Image Analyzer Module for Medical & Cosmetic Ads
 * Uses Gemini Multimodal API to extract hidden text on banners and identify surgical visuals
 */

export async function extractOcrFromImageUrl(imageUrl, apiKey = process.env.GEMINI_API_KEY) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    return null;
  }

  // Key check: either passed in or from environment
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) {
    return null;
  }

  try {
    // 1. Fetch image buffer
    const imgResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!imgResponse.ok) return null;
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';

    // 2. Call Gemini Multimodal API
    const prompt = 
      `Bạn là trợ lý AI giám sát thanh tra y tế. Nhiệm vụ của bạn là đọc và trích xuất chữ trong ảnh quảng cáo thẩm mỹ này.\n` +
      `Yêu cầu:\n` +
      `1. Đọc toàn bộ chữ in, slogan, số điện thoại hotline, địa chỉ, giá tiền (VD: 499k, 199k), từ ngữ cam kết (VD: vĩnh viễn, không đau).\n` +
      `2. Nhận diện nếu có hình ảnh so sánh Trước/Sau (Before-After) hoặc hình ảnh kim tiêm, phẫu thuật, bàn mổ.\n` +
      `Trả về đoạn văn bản ngắn gọn, chính xác tiếng Việt các nội dung đọc được.`;

    const model = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key.trim())}`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType.split(';')[0],
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 300
      }
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000)
    });

    const resJson = await res.json();
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && candidateText.trim()) {
      return candidateText.trim();
    }
  } catch (err) {
    console.warn('[AI OCR Warning]:', err.message);
  }

  return null;
}
