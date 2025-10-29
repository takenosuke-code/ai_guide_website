// lib/wpclient.ts
const endpoint = process.env.WP_GRAPHQL_ENDPOINT!;
console.log('🔍 WordPress Endpoint:', endpoint); // Debug log
if (!endpoint) throw new Error("WP_GRAPHQL_ENDPOINT is not set");

type FetchOpts = {
  revalidate?: number;
  tags?: string[];
};

export async function wpFetch<T>(
  query: string,
  variables: Record<string, any> = {},
  opts: FetchOpts = {}
) {
  const { revalidate = 60, tags } = opts;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    next: { revalidate, ...(tags ? { tags } : {}) }, // ← ここがポイント
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors ?? res.status));
  }
  return json.data as T;
}
