// client/src/lib/apiRequest.ts
export async function apiRequest(
  url: string,
  options: RequestInit = {},
  token?: string
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`请求失败: ${res.status} - ${error}`);
  }

  return res.json();
}
