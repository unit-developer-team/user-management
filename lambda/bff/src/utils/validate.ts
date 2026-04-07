export const validate = (body: string | null) => {
  if (!body) return { ok: false as const, error: "リクエストボディがありません" };

  try {
    const data = JSON.parse(body);
    return { ok: true as const, data };
  } catch {
    return { ok: false as const, error: "JSONのパースに失敗しました" };
  }
};