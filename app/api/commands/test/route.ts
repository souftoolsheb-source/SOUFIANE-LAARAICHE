import { NextRequest, NextResponse } from 'next/server';
import {
  getAppState,
  executeGeminiThinkingQuery,
  addSystemLog,
  calculateRealMetrics,
} from '@/lib/server/state';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'الرسالة مطلوبة للتجربة.' },
        { status: 400 }
      );
    }

    const trimmed = message.trim();
    const state = getAppState();

    state.processedMessagesCount += 1;

    // Track usage count on matching command rule
    const matchingCmd = state.commands.find((c) =>
      trimmed.startsWith(c.trigger)
    );
    if (matchingCmd) {
      matchingCmd.usageCount += 1;
    }

    if (trimmed.startsWith('/help')) {
      addSystemLog('info', 'system', 'طلب المستخدم قائمة الأوامر والمساعدة عبر /help.');
      return NextResponse.json({
        success: true,
        reply:
          '👋 مرحباً بك في بوت واتساب برو!\nالأوامر المتاحة:\n• /video [رابط]: تنزيل مقطع فيديو\n• /audio [رابط]: استخراج الصوت\n• /get [رابط]: تحميل ملف مباشر\n• /ask [سؤال]: استشارة الذكاء الاصطناعي مع التفكير العميق\n• /help: المساعدة',
      });
    }

    if (trimmed.startsWith('/status')) {
      const realMetrics = calculateRealMetrics();
      addSystemLog('info', 'system', 'فحص حالة النظام والمقبس عبر /status.');
      return NextResponse.json({
        success: true,
        reply: `🟢 حالة المقبس: ${state.whatsapp.status}\n📦 التنزيلات النشطة: ${realMetrics.activeDownloads}\n⚡ الرسائل المعالجة: ${realMetrics.processedMessagesCount}`,
      });
    }

    if (trimmed.startsWith('/ask')) {
      const prompt = trimmed.replace('/ask', '').trim();
      if (!prompt) {
        return NextResponse.json({
          success: true,
          reply: 'يرجى كتابة السؤال بعد الأمر /ask (مثال: /ask ما هي سرعة الضوء؟)',
        });
      }

      addSystemLog(
        'info',
        'gemini_ai',
        `تشغيل نموذج التفكير (Gemini 4 Argon - HIGH Thinking) للاستفسار: "${prompt.slice(0, 40)}..."`
      );
      const aiResponse = await executeGeminiThinkingQuery(prompt);
      return NextResponse.json({
        success: true,
        reply: `🧠 [إجابة محرك التفكير المتقدم]:\n\n${aiResponse}`,
      });
    }

    addSystemLog('info', 'system', `تم استلام رسالة عامة من المستخدم: "${trimmed.slice(0, 30)}..."`);
    return NextResponse.json({
      success: true,
      reply: `تم استلام رسالتك: "${trimmed}". لمعرفة الأوامر المدعومة أرسل /help.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'تعذر تنفيذ التجربة.' },
      { status: 500 }
    );
  }
}
