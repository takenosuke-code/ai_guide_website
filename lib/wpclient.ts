// lib/wpclient.ts
const endpoint = process.env.WP_GRAPHQL_ENDPOINT!;
if (!endpoint) throw new Error("WP_GRAPHQL_ENDPOINT is not set");

export async function wpFetch<T>(
  query: string,
  variables?: Record<string, any>
) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }, // ISR
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors ?? res.status));
  }
  return json.data as T;
}
