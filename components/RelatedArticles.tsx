import Image from "next/image";
import { RELATED_BLOG_POSTS_BY_TAGS, RECENT_BLOG_POSTS } from "@/lib/queries";
import { wpFetch } from "@/lib/wpclient";
import Link from "next/link";

type PostLite = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string | null } };
  tags?: { nodes?: { name: string; slug: string }[] };
  author?: { node?: { name?: string | null } | null };
  blog?: {
    topPickImage?: { node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null };
    authorIcon?: { node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null };
  } | null;
};

export default async function RelatedArticles({
  currentId,
  tagSlugs,
}: {
  currentId: string;
  tagSlugs: string[];
}) {
  const r1 = await wpFetch<{ posts: { nodes: PostLite[] } }>(
    RELATED_BLOG_POSTS_BY_TAGS,
    { tagSlugs, excludeId: currentId, first: 3 },
    { revalidate: 3600 }
  );
  let nodes = r1?.posts?.nodes ?? [];

  if (nodes.length < 3) {
    const r2 = await wpFetch<{ posts: { nodes: PostLite[] } }>(
      RECENT_BLOG_POSTS,
      { excludeId: currentId, first: 3 - nodes.length },
      { revalidate: 3600 }
    );
    const fill = r2?.posts?.nodes ?? [];
    const seen = new Set(nodes.map((n) => n.id));
    nodes = nodes.concat(fill.filter((n) => !seen.has(n.id)));
  }

  if (!nodes.length) return null;

  const stripHtml = (html: string) =>
    html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  return (
    <section aria-labelledby="related-articles" className="not-prose mt-16 sm:mt-20">
      <div className="relative left-1/2 -translate-x-1/2 w-[min(88rem,92vw)] px-6 md:px-8">
        <h2
          id="related-articles"
          className="text-center text-sm font-semibold text-gray-700 mb-6"
        >
          Recommended Articles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
          {nodes.slice(0, 3).map((post) => {
            const hero =
              post.blog?.topPickImage?.node?.sourceUrl ??
              post.blog?.topPickImage?.node?.mediaItemUrl ??
              post.featuredImage?.node?.sourceUrl ??
              null;
            const authorName = post.author?.node?.name?.trim() || "Anonymous";
            const authorIcon =
              post.blog?.authorIcon?.node?.sourceUrl ??
              post.blog?.authorIcon?.node?.mediaItemUrl ??
              null;
            const authorInitials = authorName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("");
            const excerpt = post.excerpt ? stripHtml(post.excerpt) : "";
            const primaryTag = post.tags?.nodes?.[0]?.name ?? "Blog";
            return (
              <article
                key={post.id}
                className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition hover:shadow-2xl"
              >
                <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] w-full overflow-hidden">
                  {hero ? (
                    <Image
                      src={hero}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 22vw, 90vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col px-8 py-8">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {primaryTag}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-3 text-xl font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition"
                  >
                    {post.title}
                  </Link>
                  {excerpt && (
                    <p className="mt-4 text-base text-gray-600 line-clamp-3">
                      {excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-5 pt-8">
                    <div
                      className="author-avatar flex-none rounded-full overflow-hidden bg-rose-100 ring-2 ring-white shadow"
                      style={{ width: 56, height: 56, minWidth: 56, minHeight: 56 }}
                    >
                      {authorIcon ? (
                        <Image
                          src={authorIcon}
                          alt={authorName}
                          width={56}
                          height={56}
                          className="block w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-semibold text-rose-500">
                          {authorInitials || "A"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900">
                        by {authorName}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

