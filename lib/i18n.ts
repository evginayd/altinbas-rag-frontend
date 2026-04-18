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
  },
} as const;

export type Translations = typeof translations.tr;
