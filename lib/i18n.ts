/**
 * Basit i18n sistemi. Zustand store'da tutulan dil tercihi ile UI
 * string'lerini çevirir. Backend de kullanıcı sorgusunun dilini
 * otomatik algıladığı için backend'e dil göndermemize gerek yok —
 * kullanıcı EN seçse de TR soru yazarsa TR cevap alır.
 */

export type Language = "tr" | "en";

export const translations = {
  tr: {
    // Header
    appName: "Altınbaş AI",
    appSubtitle: "Üniversite Asistanı",

    // Empty state
    welcomeGreeting: "Altınbaş AI Asistanına Hoş Geldin 👋",
    welcomeDescription:
      "Üniversite, fakülteler, müfredat, burslar, başvuru süreçleri ve daha fazlası hakkında her şeyi sorabilirsin.",
    clickToAsk: "Sormak için tıkla →",
    suggestions: [
      "Burs türleri nelerdir?",
      "Yatay geçiş başvuru tarihleri",
      "Yazılım Mühendisliği müfredatı",
      "İletişim bilgileri ve yerleşkeler",
    ],

    // Input bar
    inputPlaceholder: "Altınbaş Üniversitesi hakkında soru sor...",
    sendLabel: "Gönder",
    disclaimerText: "AI asistan hata yapabilir. Önemli bilgileri doğrulayın.",

    // Sources
    sourcesLabel: (n: number) => `${n} Kaynak`,
    relevanceScore: "İlgili skor",

    // New chat
    newChat: "Yeni Sohbet",
    newChatDialogTitle: "Yeni sohbet başlatılsın mı?",
    newChatDialogDescription:
      "Mevcut konuşma silinecek. Bu işlem geri alınamaz.",
    cancel: "Vazgeç",
    confirmNewChat: "Yeni Sohbet Başlat",

    // Language toggle
    languageLabel: "Dil",
    switchToEnglish: "English",
    switchToTurkish: "Türkçe",

    // Errors
    errorApiUrl:
      "API URL tanımlı değil. NEXT_PUBLIC_API_URL ortam değişkenini ayarlayın.",
    errorConnection: "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.",
    errorUnexpected: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",

    // Admin panel
    adminTitle: "Admin Panel",
    adminLoginTitle: "Admin Girişi",
    adminLoginDescription:
      "Yönetici panelini kullanmak için token girmeniz gerekiyor.",
    adminTokenLabel: "Admin Token",
    adminTokenPlaceholder: "Admin token'ınızı yapıştırın",
    adminLoginButton: "Giriş Yap",
    adminLoginError: "Token geçersiz veya sunucu yapılandırılmamış.",
    adminNavDashboard: "Gösterge Paneli",
    adminNavUrls: "URL Yönetimi",
    adminNavLogout: "Çıkış",
    adminBackToChat: "Sohbete Dön",
    adminStatsTotalChunks: "Toplam Chunk",
    adminStatsTotalUrls: "Toplam URL",
    adminStatsWebUrls: "Web Sayfası",
    adminStatsPdfUrls: "PDF Dökümanı",
    adminStatsRefresh: "Yenile",
    adminUrlListTitle: "URL Listesi",
    adminUrlListDescription:
      "Qdrant vektör veritabanındaki tüm kaynaklar. İçeriği güncellemek, silmek veya yeni URL eklemek için bu paneli kullanın.",
    adminUrlSearchPlaceholder: "URL veya başlık ile ara...",
    adminUrlTableUrl: "URL",
    adminUrlTableTitle: "Başlık",
    adminUrlTableType: "Tip",
    adminUrlTableChunks: "Chunk",
    adminUrlTableActions: "İşlemler",
    adminUrlEmpty: "Henüz hiç URL eklenmemiş.",
    adminUrlNoMatch: "Aramanızla eşleşen URL bulunamadı.",
    adminAddUrlTitle: "Yeni URL Ekle",
    adminAddUrlDescription:
      "Web sayfası veya PDF URL'i ekleyin. Ekleme sırasında içerik çekilip vektörlere dönüştürülür.",
    adminAddUrlPlaceholder: "https://altinbas.edu.tr/...",
    adminAddUrlButton: "Ekle ve İşle",
    adminAddUrlProcessing: "İşleniyor...",
    adminReingestButton: "Yeniden İşle",
    adminReingestProcessing: "Yeniden işleniyor...",
    adminDeleteButton: "Sil",
    adminDeleteDialogTitle: "URL silinsin mi?",
    adminDeleteDialogDescription:
      "Bu URL'e ait tüm chunk'lar Qdrant'tan silinecek. Bu işlem GERİ ALINAMAZ. Silinen veri günlük cron'da yeniden oluşabilir (URL hâlâ urls.json'daysa) veya kalıcı silinmiş olur (manuel eklenmişse).",
    adminDeleteConfirmButton: "Evet, Sil",
    adminToastInserted: "URL eklendi",
    adminToastUpdated: "URL güncellendi",
    adminToastSkipped: "İçerik değişmemiş, atlandı",
    adminToastFailed: "İşlem başarısız",
    adminToastDeleted: "URL silindi",
  },
  en: {
    // Header
    appName: "Altinbas AI",
    appSubtitle: "University Assistant",

    // Empty state
    welcomeGreeting: "Welcome to Altinbas AI Assistant 👋",
    welcomeDescription:
      "Ask anything about the university, faculties, curriculum, scholarships, application processes and more.",
    clickToAsk: "Click to ask →",
    suggestions: [
      "What types of scholarships are available?",
      "Lateral transfer application dates",
      "Software Engineering curriculum",
      "Contact information and campuses",
    ],

    // Input bar
    inputPlaceholder: "Ask anything about Altinbas University...",
    sendLabel: "Send",
    disclaimerText:
      "AI assistant can make mistakes. Verify important information.",

    // Sources
    sourcesLabel: (n: number) => `${n} Source${n > 1 ? "s" : ""}`,
    relevanceScore: "Relevance",

    // New chat
    newChat: "New Chat",
    newChatDialogTitle: "Start a new chat?",
    newChatDialogDescription:
      "The current conversation will be deleted. This action cannot be undone.",
    cancel: "Cancel",
    confirmNewChat: "Start New Chat",

    // Language toggle
    languageLabel: "Language",
    switchToEnglish: "English",
    switchToTurkish: "Türkçe",

    // Errors
    errorApiUrl:
      "API URL is not defined. Please set the NEXT_PUBLIC_API_URL environment variable.",
    errorConnection:
      "Could not connect to the server. Please check your internet connection.",
    errorUnexpected: "An unexpected error occurred. Please try again.",

    // Admin panel
    adminTitle: "Admin Panel",
    adminLoginTitle: "Admin Login",
    adminLoginDescription: "Enter your token to access the admin panel.",
    adminTokenLabel: "Admin Token",
    adminTokenPlaceholder: "Paste your admin token",
    adminLoginButton: "Sign In",
    adminLoginError: "Invalid token or server is not configured.",
    adminNavDashboard: "Dashboard",
    adminNavUrls: "URL Management",
    adminNavLogout: "Logout",
    adminBackToChat: "Back to Chat",
    adminStatsTotalChunks: "Total Chunks",
    adminStatsTotalUrls: "Total URLs",
    adminStatsWebUrls: "Web Pages",
    adminStatsPdfUrls: "PDF Documents",
    adminStatsRefresh: "Refresh",
    adminUrlListTitle: "URL List",
    adminUrlListDescription:
      "All sources in the Qdrant vector database. Use this panel to update content, delete, or add new URLs.",
    adminUrlSearchPlaceholder: "Search by URL or title...",
    adminUrlTableUrl: "URL",
    adminUrlTableTitle: "Title",
    adminUrlTableType: "Type",
    adminUrlTableChunks: "Chunks",
    adminUrlTableActions: "Actions",
    adminUrlEmpty: "No URLs have been added yet.",
    adminUrlNoMatch: "No URLs match your search.",
    adminAddUrlTitle: "Add New URL",
    adminAddUrlDescription:
      "Add a web page or PDF URL. Content will be scraped and embedded as vectors.",
    adminAddUrlPlaceholder: "https://altinbas.edu.tr/...",
    adminAddUrlButton: "Add and Ingest",
    adminAddUrlProcessing: "Processing...",
    adminReingestButton: "Reingest",
    adminReingestProcessing: "Reingesting...",
    adminDeleteButton: "Delete",
    adminDeleteDialogTitle: "Delete this URL?",
    adminDeleteDialogDescription:
      "All chunks for this URL will be permanently deleted from Qdrant. This action CANNOT BE UNDONE. The data may be re-created by the daily cron (if the URL is still in urls.json) or remain permanently deleted (if added manually).",
    adminDeleteConfirmButton: "Yes, Delete",
    adminToastInserted: "URL added",
    adminToastUpdated: "URL updated",
    adminToastSkipped: "Content unchanged, skipped",
    adminToastFailed: "Operation failed",
    adminToastDeleted: "URL deleted",
  },
} as const;

export type Translations = typeof translations.tr;
