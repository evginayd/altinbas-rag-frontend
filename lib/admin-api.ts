/**
 * Admin panel API client.
 *
 * Backend'teki /admin/* endpoint'lerine istek atar. Token otomatik olarak
 * localStorage'daki admin store'dan alınır ve Authorization header'ına konur.
 *
 * Hata durumları:
 *   401/403 → token geçersiz, AdminAuthError fırlatır (çağıran logout'a yönlendirir)
 *   503     → backend'de ADMIN_TOKEN yok, AdminNotConfiguredError
 *   400/422 → validation hatası, AdminValidationError
 *   5xx/diğer → AdminApiError
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ---------- Tipler ----------

export type AdminStats = {
  total_chunks: number;
  total_urls: number;
  web_urls: number;
  pdf_urls: number;
};

export type AdminUrlItem = {
  url: string;
  title: string;
  doc_type: "web" | "pdf";
  chunk_count: number;
};

export type AdminUrlsResponse = {
  urls: AdminUrlItem[];
  total: number;
  offset: number;
  limit: number;
};

export type ListUrlsOptions = {
  offset?: number;
  limit?: number;
  type?: "web" | "pdf" | null;
  search?: string;
};

export type IngestStatus = "inserted" | "updated" | "skipped" | "failed";

export type IngestResult = {
  status: IngestStatus;
  chunks: number;
  message: string;
  url: string;
};

export type DeleteResult = {
  deleted: number;
  url: string;
  existed: boolean;
};

// ---------- Hata sınıfları ----------

export class AdminApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "AdminApiError";
  }
}

export class AdminAuthError extends AdminApiError {
  constructor(message = "Invalid admin token") {
    super(message, 401);
    this.name = "AdminAuthError";
  }
}

export class AdminNotConfiguredError extends AdminApiError {
  constructor() {
    super("Admin panel not configured on server", 503);
    this.name = "AdminNotConfiguredError";
  }
}

// ---------- Yardımcı ----------

/**
 * Token'ı localStorage'dan okur. Persisted store içinde
 * state.adminToken olarak saklanır.
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("altinbas-chat-store");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.adminToken ?? null;
  } catch {
    return null;
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  // Login anında token henüz store'a yazılmamış olabilir; manuel override
  overrideToken?: string,
): Promise<T> {
  if (!API_URL) {
    throw new AdminApiError("NEXT_PUBLIC_API_URL is not set", 0);
  }

  const token = overrideToken ?? getToken();
  if (!token) {
    throw new AdminAuthError("No admin token provided");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new AdminApiError("Network error", 0);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AdminAuthError();
  }
  if (response.status === 503) {
    throw new AdminNotConfiguredError();
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail ?? "";
    } catch {
      /* ignore */
    }
    throw new AdminApiError(
      detail || `HTTP ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

// ---------- Public API ----------

/** Token'ı doğrulamak için hafif bir ping (stats endpoint'ini çağırır). */
export async function verifyToken(token: string): Promise<AdminStats> {
  return adminFetch<AdminStats>("/admin/stats", { method: "GET" }, token);
}

export async function getStats(): Promise<AdminStats> {
  return adminFetch<AdminStats>("/admin/stats");
}

export async function listUrls(
  options: ListUrlsOptions = {},
): Promise<AdminUrlsResponse> {
  const params = new URLSearchParams();
  if (options.offset !== undefined) params.set("offset", String(options.offset));
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.type) params.set("type", options.type);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();
  const path = qs ? `/admin/urls?${qs}` : "/admin/urls";
  return adminFetch<AdminUrlsResponse>(path);
}

export async function addUrl(url: string): Promise<IngestResult> {
  return adminFetch<IngestResult>("/admin/urls", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function reingestUrl(url: string): Promise<IngestResult> {
  return adminFetch<IngestResult>("/admin/reingest", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function deleteUrl(url: string): Promise<DeleteResult> {
  return adminFetch<DeleteResult>("/admin/urls", {
    method: "DELETE",
    body: JSON.stringify({ url }),
  });
}
