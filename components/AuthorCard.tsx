import Image from "next/image";

type Props = {
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
};

export default function AuthorCard({ name, description, avatarUrl }: Props) {
  return (
    // prose のスタイル干渉を遮断
    <section className="not-prose border-t border-gray-200 mt-8 pt-8">
      <div className="flex items-start gap-4">
        {/* ✅ 伸びない固定円：flex-none + 固定寸法 + object-cover（fill は使わない） */}
        <div
          className="author-avatar flex-none rounded-full overflow-hidden bg-rose-200"
          style={{ width: 56, height: 56, minWidth: 56, minHeight: 56 }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name ?? "Author"}
              width={56}
              height={56}
              className="block w-full h-full object-cover"
              priority={false}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          {name ? (
            <h3 className="text-base font-semibold text-gray-900 leading-tight">
              {name}
            </h3>
          ) : null}

          {description ? (
            <p className="not-prose mt-1 text-sm text-gray-600 leading-6 line-clamp-3 md:line-clamp-4 max-w-[68ch]">
              {description.trim()}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

