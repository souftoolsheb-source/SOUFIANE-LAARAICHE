/**
 * WhatsApp Bot Pro — Arabic-First Internationalization (i18n) Module
 * Handles localized strings, number/date formatting using standard Intl APIs.
 */

export const ar = {
  brand: {
    name: 'بوت واتساب برو',
    tagline: 'منظومة الأتمتة والتحميل الذكية',
    badge: 'إصدار الإدارة',
  },
  nav: {
    overview: 'نظرة عامة',
    connection: 'اتصال واتساب',
    downloads: 'طابور التنزيل',
    history: 'سجل التنزيلات',
    commands: 'الأوامر والأتمتة',
    logs: 'سجل النظام',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'دخول الإدارة',
    backToHome: 'العودة للرئيسية',
  },
  status: {
    connected: 'متصل ومستقر',
    pairing: 'بانتظار رمز الاقتران',
    disconnected: 'غير متصل',
    error: 'خطأ في الاتصال',
    queued: 'في الانتظار',
    downloading: 'جاري التحميل',
    completed: 'مكتمل بنجاح',
    failed: 'فشل العملية',
    cancelled: 'ملغي',
  },
  connection: {
    title: 'إدارة اقتران واتساب',
    description: 'ربط البوت برقم هاتفك عبر رمز الاقتران المباشر المكون من 8 خانات دون الحاجة لمسح الرمز المربع.',
    phoneLabel: 'رقم هاتف البوت مع الرمز الدولي',
    phonePlaceholder: '+966 50 123 4567',
    phoneHelp: 'أدخل الرقم بالصيغة الدولية مع رمز الدولة دون أي أصفار في البداية.',
    requestPairingCode: 'توليد رمز الاقتران',
    codeExpiresIn: 'ينتهي الرمز خلال',
    seconds: 'ثانية',
    pairingStepsTitle: 'خطوات إدخال الرمز في هاتفك:',
    step1: 'افتح تطبيق واتساب على هاتفك الأساسي.',
    step2: 'انتقل إلى الإعدادات ثم اختر "الأجهزة المرتبطة".',
    step3: 'اضغط على "ربط جهاز" ثم اختر "الربط باستخدام رقم الهاتف".',
    step4: 'اكتب الرمز الظاهر أدناه بدقة على شاشة هاتفك.',
    warningBaileys: 'تنبيه تنظيمي: هذه المنظومة تعتمد على ربط Baileys غير الرسمي. تجنب إرسال رسائل ترويجية جماعية لتفادي قيود واتساب المؤقتة على الرقم.',
    disconnectButton: 'إنهاء الجلسة وفصل الحساب',
    reconnectButton: 'إعادة الاتصال بالخادم',
    connectedPhone: 'الرقم المقترن حالياً',
    connectedSince: 'متصل منذ',
  },
  downloads: {
    title: 'طابور التحميل اللحظي',
    description: 'متابعة الملفات والوسائط التي يعالجها البوت حالياً استجابةً لطلبات الدردشة.',
    emptyTitle: 'لا توجد تنزيلات جارية حالياً',
    emptyDesc: 'عندما يرسل المستخدمون روابط تنزيل مع الأوامر مثل /video أو /audio ستظهر مراحل الاستخراج هنا.',
    cancelDownload: 'إلغاء التحميل',
    retryDownload: 'إعادة المحاولة',
    speed: 'السرعة',
    progress: 'نسبة التقدم',
    source: 'المصدر',
    requester: 'الطالب',
    size: 'الحجم',
  },
  history: {
    title: 'أرشيف وسجل التنزيلات',
    description: 'سجل موثق لجميع الروابط والوسائط المستخرجة مع إمكانية البحث والتصفية.',
    searchPlaceholder: 'ابحث بالعنوان، الرابط، أو رقم المرسل...',
    filterAll: 'الكل',
    filterVideo: 'فيديو',
    filterAudio: 'صوتيات',
    filterDocument: 'مستندات',
    clearHistory: 'تفريغ السجل',
    noResults: 'لم يتم العثور على نتائج تطابق معايير البحث.',
    downloadFile: 'تحميل للمعاينة',
  },
  commands: {
    title: 'أوامر البوت والذكاء الاصطناعي',
    description: 'تخصيص قواعد المعالجة التلقائية، سقوف الاستخدام، وتفعيل محرك التفكير المتقدم.',
    addCommand: 'إضافة أمر جديد',
    trigger: 'صيغة الأمر',
    category: 'التصنيف',
    status: 'الحالة',
    usage: 'مرات الاستخدام',
    rateLimit: 'حد الدقيقة',
    thinkingModeLabel: 'وضع التفكير العميق (Gemini Thinking Mode)',
    thinkingModeDesc: 'معالجة الاستفسارات المعقدة والروابط الغامضة باستخدام نموذج gemini-4-argon عالي التفكير.',
    categories: {
      media: 'وسائط وتنزيل',
      system: 'أوامر النظام',
      ai: 'ذكاء وتفكير',
      utility: 'أدوات مساعدة',
    },
  },
  logs: {
    title: 'سجل النظام والتشخيصات',
    description: 'متابعة حية لأحداث مقبس واتساب، عمليات الفحص الأمني، والمهام الخادمية.',
    filterLevel: 'مستوى السجل',
    allLevels: 'جميع المستويات',
    autoRefresh: 'تحديث تلقائي حي',
    clearLogs: 'مسح السجلات المعروضة',
    emptyLogs: 'لا توجد أحداث مسجلة حالياً.',
  },
  settings: {
    title: 'إعدادات المنظومة والأمان',
    description: 'التحكم في سعة التخزين المؤقت، حماية SSRF، وإدارة جلسة المشرف.',
    storageSection: 'إدارة التخزين المؤقت وحجم الملفات',
    maxFileSize: 'الحد الأقصى لحجم الملف الواحد (ميجابايت)',
    autoCleanup: 'جدولة الحذف التلقائي للملفات المؤقتة (ساعات)',
    runCleanupNow: 'تنظيف التخزين المؤقت فوراً',
    securitySection: 'أمان الاتصال وعناوين الويب',
    ssrfProtection: 'حماية منع طلبات الخادم المزورة (SSRF Shield)',
    ssrfEnabled: 'مفعلة — حظر النطاقات الداخلية وعناوين IP الخاصة تلقائياً',
    saveSettings: 'حفظ التعديلات',
    savedSuccess: 'تم حفظ الإعدادات بنجاح.',
  },
  publicLanding: {
    heroKicker: 'منظومة الأتمتة المتقدمة',
    heroTitle: 'بوت واتساب المتكامل لإدارة التنزيلات والذكاء الشخصي',
    heroSubtitle: 'خدمة خادمية موثوقة تستخرج مقاطع الفيديو والملفات الصوتية والمستندات بطلب مباشر عبر محادثات واتساب، مع حماية كاملة وسرعة استجابة فائقة.',
    adminPortalCta: 'الدخول إلى لوحة التحكم الإدارية',
    featuresTitle: 'قدرات البوت الأساسية',
    supportedCommandsTitle: 'الأوامر المدعومة في المحادثة',
    commandsList: [
      { cmd: '/help', desc: 'عرض دليل الاستخدام وجميع الأوامر المتاحة' },
      { cmd: '/video [رابط]', desc: 'استخراج وتنزيل مقطع الفيديو بأعلى دقة متوافقة' },
      { cmd: '/audio [رابط]', desc: 'استخلاص الصوت بجودة MP3 عالية الوضوح' },
      { cmd: '/get [رابط]', desc: 'تحميل مباشر للملفات والمستندات والوسائط العامة' },
      { cmd: '/ask [سؤال]', desc: 'استشارة الذكاء الاصطناعي مع التفكير المتعمق' },
    ],
  },
  actions: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    confirm: 'تأكيد الإجراء',
    close: 'إغلاق',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    loading: 'جاري المعالجة...',
    retry: 'إعادة المحاولة',
  },
  errors: {
    general: 'حدث خطأ غير متوقع. يرجى إعادة المحاولة لاحقاً.',
    invalidPhone: 'يرجى إدخال رقم هاتف صحيح بالصيغة الدولية الكاملة.',
    unauthorized: 'الجلسة غير مصرح لها. يرجى تسجيل الدخول مجدداً.',
    ssrfBlocked: 'تم حظر الرابط: النطاق أو عنوان IP غير مسموح به لحماية الخادم.',
    fileTooLarge: 'يتجاوز حجم الملف الحد الأقصى المسموح به في الإعدادات.',
  },
};

/**
 * Format bytes into human-readable Arabic units using standard Intl
 */
export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '—';
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  const formattedVal = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(val);
  return `${formattedVal} ${sizes[i]}`;
}

/**
 * Format Arabic date/time with Intl
 */
export function formatArabicDateTime(isoOrEpoch?: string | number): string {
  if (!isoOrEpoch) return '—';
  const date = new Date(isoOrEpoch);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true,
  }).format(date);
}

/**
 * Format plain number with tabular figures
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
