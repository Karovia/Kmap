export async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    let detail = '';
    if (contentType.includes('application/json')) {
      try {
        const errorBody = (await response.json()) as { detail?: string; message?: string };
        detail = errorBody.detail ?? errorBody.message ?? '';
      } catch {
        detail = '';
      }
    }

    throw new Error(detail || fallbackMessage);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('接口返回了非 JSON 内容，请检查前端代理或后端服务是否正常');
  }

  return response.json() as Promise<T>;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  fallbackMessage: string
): Promise<T> {
  const response = await fetch(input, init);
  return parseJsonResponse<T>(response, fallbackMessage);
}
