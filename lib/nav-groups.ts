import { toSlug } from "./slugify";

export type NavMenuTag = {
  slug: string;
  name: string;
  label: string;
  order: number;
  count?: number | null;
};

export type NavMenuGroup = {
  id: string;
  label: string;
  order: number;
  tags: NavMenuTag[];
};

export type NavMenuPostNode = {
  aiToolMeta?: {
    megamenulabel?: string | null;
    megamenugroup?: string | string[] | null;
  } | null;
  tags?: {
    nodes?: Array<{
      name: string;
      slug: string;
    }>;
  } | null;
};

const ORDER_FALLBACK = 10_000;

const normalizeLabel = (value?: string | null) =>
  typeof value === "string" ? value.trim() : "";

const normalizeGroup = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return (
      value.find((entry) => typeof entry === "string" && entry.trim())?.trim() ??
      ""
    );
  }
  return typeof value === "string" ? value.trim() : "";
};

export function buildNavGroups(posts: NavMenuPostNode[]): NavMenuGroup[] {
  const sources = new Map<
    string,
    {
      groupId: string;
      groupLabel: string;
      label: string;
      slug: string;
      count: number;
    }
  >();

  posts.forEach((post) => {
    const groupLabel = normalizeGroup(post.aiToolMeta?.megamenugroup);
    const label = normalizeLabel(post.aiToolMeta?.megamenulabel);
    if (!groupLabel || !label) return;

    const slugFromLabel = toSlug(label);
    const matchingTag = post.tags?.nodes?.find(
      (tag) => tag.slug === slugFromLabel || toSlug(tag.name) === slugFromLabel
    );
    const slug = matchingTag?.slug ?? slugFromLabel;
    if (!slug) return;

    const groupId = toSlug(groupLabel);
    const key = `${groupId}::${slug}`;
    const existing = sources.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      sources.set(key, {
        groupId,
        groupLabel,
        label,
        slug,
        count: 1,
      });
    }
  });

  const groups = new Map<string, NavMenuGroup>();

  Array.from(sources.values()).forEach((source) => {
    if (!groups.has(source.groupId)) {
      groups.set(source.groupId, {
        id: source.groupId,
        label: source.groupLabel,
        order: ORDER_FALLBACK,
        tags: [],
      });
    }
    const group = groups.get(source.groupId)!;
    group.tags.push({
      slug: source.slug,
      name: source.label,
      label: source.label,
      order: ORDER_FALLBACK,
      count: source.count,
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      tags: group.tags
        .slice()
        .sort(
          (a, b) =>
            (a.order ?? ORDER_FALLBACK) - (b.order ?? ORDER_FALLBACK) ||
            a.label.localeCompare(b.label)
        ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}


