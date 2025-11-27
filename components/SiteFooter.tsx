import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  items: FooterLink[];
}

interface SiteFooterProps {
  sections: FooterSection[];
  footnote?: string;
}

export default function SiteFooter({
  sections,
  footnote = "© AI Plaza. Every AI, clearly explained.",
}: SiteFooterProps) {
  return (
    <footer className="bg-[#070c1a] text-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-8 grid-cols-4">
        {sections.map((section) => (
          <div key={section.title} className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              {section.title}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors block line-clamp-2 break-words"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-gray-400">
          <p>{footnote}</p>
          <div className="flex gap-4">
            <Link href="/articles" className="hover:text-white">
              Articles
            </Link>
            <Link
              href="https://aitoolsite1020-vqchs.wpcomstaging.com/submit-a-review/"
              className="hover:text-white"
            >
              Submit Review
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


