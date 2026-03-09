export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
