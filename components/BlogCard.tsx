import Link from "next/link";
import Image from "next/image";

type BlogCardProps = {
  href: string;
  title: string;
  excerpt?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  authorName?: string;
  authorAvatarUrl?: string | null;
  className?: string;
};

export default function BlogCard({
  href,
  title,
  excerpt,
  imageUrl,
  imageAlt = "",
  authorName,
  authorAvatarUrl,
  className = "",
}: BlogCardProps) {
  return (
    <article
      className={`group relative flex flex-col rounded-2xl bg-white/6 ring-1 ring-white/10 transition hover:bg-white/8 hover:ring-white/20 ${className}`}
    >
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      />

      <div className="relative z-20 flex flex-col p-5 md:p-6">
        <div className="flex-1 min-h-0">
          {imageUrl && (
            <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl">
              <Image
                src={imageUrl}
                alt={imageAlt || title}
                fill
                sizes="(min-width: 768px) 24rem, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          <h3 className="text-lg md:text-xl font-semibold leading-tight line-clamp-2">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 text-sm md:text-base opacity-85 line-clamp-3 break-words [overflow-wrap:anywhere]">
              {excerpt}
            </p>
          )}
        </div>

        {(authorName || authorAvatarUrl) && (
          <footer className="mt-3 border-t border-slate-200/60 pt-2">
            <div className="flex items-center gap-3 min-h-0">
              {authorAvatarUrl && (
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
                  <Image
                    src={authorAvatarUrl}
                    alt={`${authorName ?? "Author"}`}
                    fill
                    sizes="2rem"
                    className="object-cover"
                  />
                </span>
              )}
              {authorName && (
                <span className="truncate text-sm font-medium leading-5">
                  {authorName}
                </span>
              )}
            </div>
          </footer>
        )}
      </div>
    </article>
  );
}

