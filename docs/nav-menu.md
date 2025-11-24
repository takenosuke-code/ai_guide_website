# Header Mega Menu Setup

Use the native WordPress **Tag** description field to control which tags appear
inside the “Software” mega menu and how they are grouped.

## Step-by-step

1. In WordPress Admin go to **Posts → Tags** and edit or create a tag.
2. Locate the **Description** textarea.
3. Add the following key/value pairs (one per line):

```
Nav Group: Security
Nav Label: Cloud Security
Group Order: 2
Tag Order: 10
```

- `Nav Group` – required to show the tag in the mega menu. Tags that share the
  same group value appear under the same left-column pillar (e.g. Security,
  Marketing, Collaboration).
- `Nav Label` – optional text override for the button inside the menu. If
  omitted the tag name is used.
- `Group Order` – optional number that controls the order of the left-column
  group list (lower numbers appear first). If omitted, groups fall back to
  alphabetical order.
- `Tag Order` – optional number that controls the order of individual tag links
  inside the selected group.

4. Save the tag. The next ISR revalidation (or a manual revalidation) will pick
   up the change and the new grouping will appear in the site header.

> Tip: a single tag can appear both as a broad category (e.g. “Coder”) and as a
> specific filter (e.g. “Chat Bots”). Just create two tags and assign them both
> the same `Nav Group` value so they share the same column.

## Recommended workflow

1. **Audience / funnel tags** (e.g. `Coder`, `Marketing`, `Student`) stay the way
   they are today. Leave their Description fields blank so they are only used
   for search filters and collection pages.
2. For every item that should appear inside the Software menu, create a **nav
   tag** (e.g. `Cloud Security`, `Built-in IDEs`, `AI Pair Programmers`).
3. In that nav tag’s Description field paste the `Nav Group` block shown above,
   making sure every tag that belongs under the same pillar uses the exact same
   `Nav Group` name (spacing/punctuation included).
4. When you write a review, assign **both** tags:
   - `Coder` (or `Marketing`, etc.) → keeps existing filtering intact.
   - `Cloud Security` (or the specific nav tag) → makes the tool appear as a
     link under Software → Security.
5. Save the post, trigger a revalidation (or wait for ISR). Hovering “Software”
   will now show the new nav tag beneath its pillar without duplicating the
   group itself.



