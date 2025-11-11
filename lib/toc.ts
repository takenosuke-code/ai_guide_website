import * as cheerio from "cheerio";

export type FlatHeading = { id: string; text: string; level: 2 | 3 | 4 | 5 };
export type TocItem = FlatHeading & { children: TocItem[] };

function slugify(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s\._/]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function addAnchorsAndExtractHeadings(html: string): {
  html: string;
  headings: FlatHeading[];
  tree: TocItem[];
} {
  if (!html) return { html, headings: [], tree: [] };

  const $ = cheerio.load(html);
  const used = new Map<string, number>();
  const headings: FlatHeading[] = [];

  $("h2, h3, h4, h5").each((_, el) => {
    const $el = $(el);
    const raw = $el.get(0);
    if (!raw) {
      return;
    }
    const tag = raw.tagName?.toLowerCase() ?? "h2";
    const level = Number(tag.replace("h", "")) as 2 | 3 | 4 | 5;
    const text = $el.text().trim();

    let id = $el.attr("id");
    if (!id) {
      const base = slugify(text) || "section";
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      id = n === 1 ? base : `${base}-${n}`;
      $el.attr("id", id);
    }

    const cls = ($el.attr("class") ?? "") + " scroll-mt-28";
    $el.attr("class", cls.trim());

    headings.push({ id, text, level });
  });

  return { html: $.html(), headings, tree: toTree(headings) };
}

export function toTree(list: FlatHeading[]): TocItem[] {
  const root: TocItem[] = [];
  const stack: TocItem[] = [];

  list.forEach((h) => {
    const node: TocItem = { ...h, children: [] };

    while (stack.length && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });

  return root;
}

