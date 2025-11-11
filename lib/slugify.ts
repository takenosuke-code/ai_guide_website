export function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const RAW_ALIAS: Record<string, string> = {
  "ai review": "ai-review",
};

export const ALIAS = Object.fromEntries(
  Object.entries(RAW_ALIAS).map(([key, value]) => [toSlug(key), value])
) as Record<string, string>;

export function normalizeAlias(raw: string) {
  const key = toSlug(raw);
  return ALIAS[key] ?? key;
}

