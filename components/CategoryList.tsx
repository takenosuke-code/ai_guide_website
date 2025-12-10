import Link from "next/link";
import Container from "@/app/(components)/Container";
import type { NavMenuGroup } from "@/lib/nav-groups";

interface CategoryListProps {
  navGroups: NavMenuGroup[];
}

export default function CategoryList({ navGroups }: CategoryListProps) {
  if (!navGroups || navGroups.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-14">
      <Container>
        <h2
          className="text-center mb-10"
          style={{
            fontSize: "32px",
            fontWeight: 700,
            lineHeight: "100%",
            letterSpacing: "0",
            color: "#4D545D",
          }}
        >
          Research popular software
        </h2>

        <div
          className="columns-1 md:columns-2 lg:columns-3"
          style={{ columnGap: "2.5rem" }}
        >
          {navGroups.map((group) => (
            <div key={group.id} className="mb-8 break-inside-avoid space-y-3">
              <h3 className="text-lg font-bold" style={{ color: "#5D4EE8" }}>
                {group.label}
              </h3>

              <ul className="space-y-2">
                {group.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={`/collection/${encodeURIComponent(tag.slug)}`}
                      className="text-sm text-gray-600 transition-colors flex items-center"
                      style={{ color: "#5E5E6A" }}
                    >
                      <span>{tag.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
