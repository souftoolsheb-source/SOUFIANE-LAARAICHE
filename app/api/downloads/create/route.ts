import { NextRequest, NextResponse } from 'next/server';
import {
  getAppState,
  validateUrlForSsrf,
  addSystemLog,
} from '@/lib/server/state';
import type { DownloadItem, DownloadType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { url, type, requestedBy = '+966 50 (المشرف)' } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'الرابط مطلوب.' },
        { status: 400 }
      );
    }

    // SSRF Validation
    const ssrfCheck = validateUrlForSsrf(url);
    if (!ssrfCheck.valid) {
      addSystemLog('error', 'downloader', `تم إحباط محاولة تنزيل رابط غير آمن (SSRF): ${url}`);
      return NextResponse.json(
        { success: false, error: ssrfCheck.reason },
        { status: 400 }
      );
    }

    const state = getAppState();
    const host = ssrfCheck.hostname || '';

    // Check domain allowed list
    const isDomainAllowed =
      state.settings.allowedDomains.length === 0 ||
      state.settings.allowedDomains.some((d) => host.includes(d) || d.includes(host));

    if (!isDomainAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `النطاق (${host}) غير مدرج في قائمة النطاقات المصرح بها في إعدادات المنظومة.`,
        },
        { status: 403 }
      );
    }

    const downloadId = `dl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const startTime = Date.now();

    // Create item in downloading state
    const newDownload: DownloadItem = {
      id: downloadId,
      url,
      sourceDomain: host,
      title: `وسائط من ${host}`,
      type: (type as DownloadType) || 'video',
      status: 'downloading',
      progressPercent: 10,
      fileSizeBytes: 0,
      requestedBy,
      createdAt: new Date().toISOString(),
    };

    state.downloads.unshift(newDownload);
    state.processedMessagesCount += 1;

    // Perform REAL HTTP request to probe and fetch the target URL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WhatsAppBotPro/1.0; +https://whatsapp.bot)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        newDownload.status = 'failed';
        newDownload.errorReason = `فشل الخادم الوجهة برمز خطأ HTTP ${response.status} (${response.statusText})`;
        addSystemLog('error', 'downloader', `فشل تنزيل ${url}: رمز HTTP ${response.status}`);
        return NextResponse.json({
          success: true,
          item: newDownload,
        });
      }

      const contentLengthHeader = response.headers.get('content-length');
      const contentTypeHeader = response.headers.get('content-type') || '';
      const realBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

      // Check max file size limit
      const maxAllowedBytes = state.settings.maxFileSizeMb * 1024 * 1024;
      if (realBytes > maxAllowedBytes) {
        newDownload.status = 'failed';
        newDownload.errorReason = `حجم الملف (${Math.round(realBytes / 1024 / 1024)} ميجابايت) يتجاوز الحد الأقصى المسموح به (${state.settings.maxFileSizeMb} ميجابايت).`;
        addSystemLog('warn', 'downloader', `تم إلغاء تنزيل ${url}: الحجم يتجاوز السقف.`);
        return NextResponse.json({
          success: true,
          item: newDownload,
        });
      }

      // Read a portion or full stream of the real file
      const reader = response.body?.getReader();
      let receivedBytes = 0;

      if (reader) {
        // Read chunks (capped at 25MB for server memory safety)
        while (receivedBytes < 25 * 1024 * 1024) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) receivedBytes += value.length;
        }
      }

      const totalSize = realBytes > 0 ? realBytes : receivedBytes;
      const elapsedSeconds = Math.max(0.1, (Date.now() - startTime) / 1000);
      const speedMbps = ((receivedBytes / 1024 / 1024) / elapsedSeconds).toFixed(1);

      // Determine real media type from content-type header
      let determinedType: DownloadType = 'document';
      if (contentTypeHeader.includes('video')) determinedType = 'video';
      else if (contentTypeHeader.includes('audio')) determinedType = 'audio';
      else if (contentTypeHeader.includes('image')) determinedType = 'image';

      // Extract filename from URL pathname
      let extractedName = url.split('/').pop()?.split('?')[0] || `file-${Date.now()}`;
      if (!extractedName.includes('.')) {
        extractedName += determinedType === 'video' ? '.mp4' : determinedType === 'audio' ? '.mp3' : '.dat';
      }

      newDownload.title = extractedName;
      newDownload.type = determinedType;
      newDownload.status = 'completed';
      newDownload.progressPercent = 100;
      newDownload.fileSizeBytes = totalSize;
      newDownload.downloadSpeed = `${speedMbps} MB/s`;
      newDownload.completedAt = new Date().toISOString();

      addSystemLog(
        'success',
        'downloader',
        `اكتمل تنزيل الملف (${extractedName}) بنجاح بحجم ${Math.round(totalSize / 1024)} كيلوبايت وبسرعة ${speedMbps} MB/s.`
      );

      return NextResponse.json({
        success: true,
        item: newDownload,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      newDownload.status = 'failed';
      newDownload.errorReason = fetchErr?.name === 'AbortError' ? 'انتهت مهلة الاتصال بالخادم (Timeout).' : `تعذر الوصول للموقع: ${fetchErr?.message || 'خطأ في الشبكة'}`;
      addSystemLog('error', 'downloader', `خطأ في تنزيل ${url}: ${newDownload.errorReason}`);

      return NextResponse.json({
        success: true,
        item: newDownload,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في معالجة طلب التنزيل.' },
      { status: 500 }
    );
  }
}
