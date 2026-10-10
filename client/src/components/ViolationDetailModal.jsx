import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  ThumbsUp,
  MessageCircle,
  Share2,
  AlertCircle,
  ExternalLink,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Camera,
  KeyRound,
  FileBadge2,
  Building2,
  RefreshCw,
  ScanText,
  FileText,
  Sparkles,
  Archive,
  HardDrive,
  Download
} from 'lucide-react';

function cleanContentText(text) {
  if (!text) return '';
  return text
    .replace(/(?:\bFacebook\b[\s,.:;·•\-_/|]*){2,}/gi, ' ')
    .replace(/^\s*(?:Facebook[\s,.:;·•\-_/|]*)+/gi, '')
    .replace(/(?:Facebook[\s,.:;·•\-_/|]*)+\s*$/gi, '')
    .replace(/\bFacebook\s+Facebook\b/gi, '')
    .replace(/Có thể là hình ảnh về[^\n\.]*(?:\.|\n|$)/gi, ' ')
    .replace(/May be an image of[^\n\.]*(?:\.|\n|$)/gi, ' ')
    .replace(/Đã chia sẻ bài viết.*$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function ViolationDetailModal({
  item,
  onClose,
  onUpdateStatus,
  onExportReport
}) {
  const [status, setStatus] = useState(item?.status || 'Chờ xử lý');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isArchivingVault, setIsArchivingVault] = useState(false);
  const [evidence, setEvidence] = useState(item?.evidence || null);
  const [licenseCheck, setLicenseCheck] = useState(null);
  const [ocrText, setOcrText] = useState(item?.ocrText || null);
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  useEffect(() => {
    setStatus(item?.status || 'Chờ xử lý');
    setEvidence(item?.evidence || null);
    setOcrText(item?.ocrText || null);

    // Verify facility license against database
    if (item?.author) {
      fetch(`/api/license/lookup?name=${encodeURIComponent(item.author)}`)
        .then((res) => res.json())
        .then((data) => setLicenseCheck(data))
        .catch(() => {});
    }

    // TỰ ĐỘNG ĐỌC VÀ BÓC TÁCH CHỮ TỪ HÌNH ẢNH / VIDEO (KHÔNG CẦN CHỜ ĐỒNG Ý)
    const targetImg = item?.mediaUrl || item?.avatar;
    if (!item?.ocrText && targetImg && targetImg.startsWith('http')) {
      setIsScanningOcr(true);
      fetch('/api/ocr/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: targetImg })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.text) {
            setOcrText(data.text);
          }
        })
        .catch(() => {})
        .finally(() => setIsScanningOcr(false));
    }
  }, [item]);

  const handleScanOcr = async () => {
    const targetImg = item?.mediaUrl || item?.avatar;
    if (!targetImg) {
      alert('Không tìm thấy hình ảnh bài viết để quét OCR.');
      return;
    }
    setIsScanningOcr(true);
    try {
      const res = await fetch('/api/ocr/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: targetImg })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setOcrText(data.text);
      } else {
        alert(data.error || 'Không trích xuất được chữ từ hình ảnh này (vui lòng cấu hình Gemini API Key trong phần Cài đặt).');
      }
    } catch (err) {
      alert('Lỗi quét OCR: ' + err.message);
    } finally {
      setIsScanningOcr(false);
    }
  };

  if (!item) return null;

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(item.id, newStatus);
    }
  };

  const handleCaptureEvidence = async () => {
    setIsCapturing(true);
    try {
      const res = await fetch(`/api/evidence/${item.id}/capture`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvidence(data.evidence);
        alert('Đã tạo ảnh chụp bằng chứng số và khóa bảo vệ toàn vẹn bằng mã băm SHA-256!');
      }
    } catch (e) {
      alert(`Lỗi chụp bằng chứng: ${e.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleArchiveVault = async () => {
    setIsArchivingVault(true);
    try {
      const res = await fetch(`/api/evidence/${item.id}/archive-vault`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl: item.mediaUrl || item.avatar })
      });
      const data = await res.json();
      if (data.success) {
        setEvidence((prev) => ({
          ...(prev || {}),
          vault: data.vault
        }));
        alert('Đã tải và niêm phong tệp phương tiện gốc vào Kho Bằng Chứng Số (Evidence Vault) thành công! Mã băm SHA-256 đã được xác lập.');
      } else {
        alert(data.error || 'Lỗi khi niêm phong vào Vault.');
      }
    } catch (e) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsArchivingVault(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <h3 className="text-sm font-bold text-slate-900">
          Chi tiết nội dung vi phạm
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Author Header */}
        <div className="flex items-center space-x-3">
          <img
            src={item.avatar}
            alt={item.author}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                {item.author}
              </h4>
              {item.isGroup || item.authorType === 'Group' || /hội|nhóm|group|cộng đồng|tâm sự|chia sẻ/i.test(item.author) ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Hội Nhóm
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Fanpage
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {item.followers || 'Đang hoạt động'} • {item.timestamp}
            </div>
          </div>
        </div>

        {/* Post Text */}
        <div className="text-slate-700 font-medium leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
          {cleanContentText(item.content)}
        </div>

        {/* Media Preview Box */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
          <img
            src={item.mediaUrl || item.avatar}
            alt="Media preview"
            className="w-full h-48 object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
          />
          {item.postType === 'Video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              {item.videoDuration && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {item.videoDuration}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Multimodal AI Vision OCR Action & Result (Mô-đun 2: Tự động 100%) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center space-x-1.5 text-indigo-700 text-[11px]">
              <ScanText className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Vision OCR: Tự Động Đọc Chữ Ảnh &amp; Video (Không cần xác nhận)</span>
            </span>
            <div className="flex items-center space-x-1.5">
              {isScanningOcr && (
                <span className="text-[10px] text-indigo-600 flex items-center space-x-1 font-semibold animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Đang tự động đọc...</span>
                </span>
              )}
              {ocrText && !isScanningOcr && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã tự động đọc</span>
                </span>
              )}
            </div>
          </div>

          {ocrText ? (
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-[11px] text-slate-700 space-y-1">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Nội dung tự động bóc tách từ hình ảnh / video:
              </div>
              <p className="whitespace-pre-line leading-relaxed">{ocrText}</p>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400">
              {isScanningOcr ? 'Hệ thống đang tự động trích xuất chữ và hình ảnh Before/After qua Google Gemini Multimodal Vision...' : 'Bài viết không chứa tệp hình ảnh/video hoặc đã quét xong.'}
            </div>
          )}
        </div>

        {/* Engagement Stats Bar */}
        <div className="flex items-center justify-between text-slate-500 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-1.5 font-medium">
            <ThumbsUp className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>{item.engagement?.likes || 1200}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{item.engagement?.comments || 342} bình luận</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>{item.engagement?.shares || 89} lượt chia sẻ</span>
            </div>
          </div>
        </div>

        {/* Giai đoạn 2 & Option 3: Bằng Chứng Số & Kho Lưu Trữ Bất Khả Biến (Evidence Vault) */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 space-y-3 shadow-md border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center space-x-1.5 text-cyan-300">
              <FileBadge2 className="w-4 h-4" />
              <span>Chứng Cứ Pháp Lý &amp; Khóa SHA-256 (GĐ 2 &amp; Option 3)</span>
            </span>
            {evidence?.vault?.isVaultArchived ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Đã Khóa Vault Offline</span>
              </span>
            ) : evidence ? (
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Đã Niêm Phong Snapshot</span>
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Chưa Niêm Phong
              </span>
            )}
          </div>

          {/* Snapshot evidence info */}
          {evidence && (
            <div className="space-y-1.5 text-[11px] border-b border-slate-800 pb-2.5">
              <div className="text-slate-300">
                <span className="text-slate-400">Thời điểm chụp:</span> {evidence.capturedAt}
              </div>
              <div className="bg-black/50 p-2 rounded-lg font-mono text-[10px] break-all border border-slate-700 text-cyan-200">
                <span className="text-slate-400 block mb-0.5 font-sans font-bold">MÃ BĂM SNAPSHOT SHA-256:</span>
                {evidence.sha256}
              </div>
              <div className="pt-0.5 flex items-center space-x-2">
                <a
                  href={evidence.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-cyan-300 hover:underline font-bold text-xs"
                >
                  <span>Xem ảnh chụp hồ sơ niêm phong</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Option 3: Evidence Vault Offline Media File */}
          {evidence?.vault?.isVaultArchived ? (
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-indigo-500/40 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center space-x-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Kho Bằng Chứng Số: ĐÃ LƯU TRỮ VĨNH VIỄN</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{evidence.vault.fileSizeFormatted}</span>
              </div>
              <div className="bg-black/60 p-2 rounded font-mono text-[10px] text-emerald-300 break-all">
                <span className="text-slate-400 block font-sans font-bold">MÃ BĂM TỆP GỐC SHA-256:</span>
                {evidence.vault.mediaSha256}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Lưu lúc: {evidence.vault.archivedAt}</span>
                <a
                  href={evidence.vault.vaultUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Tải Tệp Vault Gốc</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="pt-1 space-y-2">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tự động chụp bản chụp màn hình và tải lưu trữ vĩnh viễn tệp ảnh/video vào Kho Bằng Chứng Số (Vault) để chống cơ sở xóa bài phi tang.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleCaptureEvidence}
                  disabled={isCapturing}
                  className="py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 text-[11px]"
                >
                  {isCapturing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Đang chụp...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3 h-3" />
                      <span>1. Chụp Bằng Chứng Số</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleArchiveVault}
                  disabled={isArchivingVault}
                  className="py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 text-[11px]"
                >
                  {isArchivingVault ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Đang lưu Vault...</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3 h-3" />
                      <span>2. Khóa Vào Kho Vault</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Giai đoạn 3: Đối Soát Giấy Phép Hoạt Động (GPHĐ) */}
        {licenseCheck && (
          <div className={`rounded-xl p-3.5 border text-xs space-y-1.5 ${
            licenseCheck.isLicensed 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4" />
                <span>Đối soát GPHĐ Cơ sở Y tế (GĐ 3)</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                licenseCheck.isLicensed ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
              }`}>
                {licenseCheck.isLicensed ? 'CÓ GIẤY PHÉP' : 'CHƯA CÓ GPHĐ PTTM'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {licenseCheck.message}
            </p>
          </div>
        )}

        {/* Phân tích AI Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="font-bold text-slate-900 text-xs">Phân tích AI</span>
            </div>
            <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full tracking-wider uppercase">
              VI PHẠM
            </span>
          </div>

          {/* Loại vi phạm */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-0.5">Loại vi phạm</div>
            <div className="text-red-600 font-bold text-xs">{item.category}</div>
          </div>

          {/* Nội dung vi phạm */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-1">Nội dung vi phạm</div>
            <ul className="space-y-1 text-slate-700">
              {item.violationDetails?.map((detail, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mức độ nghiêm trọng */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500">Mức độ nghiêm trọng:</span>
            <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span>{item.severity || 'Cao'}</span>
            </span>
          </div>

          {/* Căn cứ pháp lý */}
          {item.legalBasis && item.legalBasis.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 mb-1">Căn cứ pháp lý viện dẫn</div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                {item.legalBasis.map((law, idx) => (
                  <li key={idx} className="flex items-start space-x-1">
                    <span className="text-blue-500 font-bold shrink-0">§</span>
                    <span>{law}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Đề xuất xử lý */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-1">Đề xuất xử lý</div>
            <ul className="space-y-1 text-slate-700">
              {item.recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Thông tin nguồn */}
        <div className="border-t border-slate-100 pt-3">
          <h5 className="font-bold text-slate-900 text-xs mb-2">Thông tin nguồn</h5>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-start justify-between">
              <span className="text-slate-400">Link gốc</span>
              <a
                href={item.postUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline max-w-[200px] truncate flex items-center space-x-1"
              >
                <span>{item.postUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Trang</span>
              <span className="font-semibold text-slate-700">{item.author}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Followers</span>
              <span className="text-slate-700">{item.followers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Loại nội dung</span>
              <span className="text-slate-700">{item.postType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Thời gian đăng</span>
              <span className="text-slate-700">{item.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tài khoản</span>
              <span className="text-blue-600 font-medium">{item.authorHandle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => {
              const url = `/api/violations/${item.id}/export`;
              window.open(url, '_blank');
            }}
            className="flex items-center space-x-1 px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-300 text-xs transition-colors cursor-pointer"
            title="Xuất hồ sơ giám sát kèm mã băm SHA-256"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Hồ Sơ SHA-256</span>
          </button>

          <button
            onClick={() => {
              const url = `/api/violations/${item.id}/sanction-record`;
              window.open(url, '_blank');
            }}
            className="flex items-center space-x-1 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold border border-rose-300 text-xs transition-colors cursor-pointer"
            title="In Biên bản Vi phạm Hành chính chuẩn Nghị định 118/2021/NĐ-CP"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Biên Bản VPHC (NĐ 118)</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStatusChange('Đã xác minh')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
              status === 'Đã xác minh'
                ? 'bg-orange-50 text-orange-700 border-orange-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {status === 'Đã xác minh' ? '✓ Đã xác minh' : 'Xác minh'}
          </button>

          <button
            onClick={() => handleStatusChange('Đã xử lý')}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Xử lý vi phạm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
