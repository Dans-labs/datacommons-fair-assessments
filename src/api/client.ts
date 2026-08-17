let baseUrl: string | undefined;
let configPromise: Promise<string> | undefined;

if (typeof window === "undefined") {
  baseUrl = process.env.API;
}

export function setApiBaseUrl(url: string) {
  baseUrl = url;
}

async function ensureBaseUrl(): Promise<string> {
  if (baseUrl) return baseUrl;
  if (!configPromise) {
    configPromise = import("./api-config").then(async (m) => {
      const config = await m.getApiServerConfig();
      baseUrl = config.baseUrl;
      return baseUrl;
    });
  }
  return configPromise;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = await ensureBaseUrl();
  if (!url) {
    throw new Error("API base URL not configured — setApiBaseUrl() must run before apiFetch()");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${url}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
