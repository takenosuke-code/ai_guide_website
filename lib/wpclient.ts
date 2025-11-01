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

  // Dev mode: disable caching for immediate updates
  const isDev = process.env.NODE_ENV === 'development';
  const fetchOpts: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  };

  if (isDev) {
    // Ensure fresh data while debugging
    fetchOpts.cache = "no-store";
    fetchOpts.next = { revalidate: 0 };
  } else {
    // Production: use ISR
    fetchOpts.next = { revalidate, ...(tags ? { tags } : {}) };
  }

  const res = await fetch(endpoint, fetchOpts);

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors ?? res.status));
  }
  return json.data as T;
}
