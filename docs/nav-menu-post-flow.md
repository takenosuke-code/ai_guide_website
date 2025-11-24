# Mega Menu from AI Review Fields

This flow lets you define the Software mega menu entirely from the **AI review
edit screen** instead of editing each WordPress tag separately.

---

## 1. Add the “Mega Menu” fields (one-time setup)

1. In WordPress, open **Custom Fields → Field Groups → AI Tool Meta**.
2. Click **Add Field** and create the following inputs (a separate tab is
   optional but keeps the UI tidy):

| Label | Field Name | Type | GraphQL Field Name | Notes |
| --- | --- | --- | --- | --- |
| Mega Menu Group | `nav_group` | Select (manual choices) | `navGroup` | Add your high-level pillars (e.g. Security, Marketing, Coder). Enable “Allow Null” so a post can opt out. |
| Mega Menu Label | `nav_label` | Text | `navLabel` | The text that appears inside the Software drawer (e.g. Cloud Security, Built-in IDEs). |
| Mega Menu Tag Link | `nav_tag_link` | Taxonomy (Post Tags), single-select | `navTagLink` | Choose which existing WordPress tag this menu item should link to (we reuse the `/collection/[slug]` pages). |
| Mega Menu Tag Order | `nav_tag_order` | Number | `navTagOrder` | Optional per-label ordering within a group. |

3. For each field above, open the **GraphQL** panel and toggle **Show in
   GraphQL** so Next.js can query them.
4. Save the field group, then go to **GraphQL → Settings → Clear Schema Cache**
   to expose the new schema.

---

## 2. Use the fields while writing a review

1. Open any AI review (Posts → All Posts → Edit).
2. Scroll to the **Mega Menu** section you just created.
3. Fill the fields:
   - **Mega Menu Group** – pick the pillar this tool should live under.
   - **Mega Menu Label** – the sub-link name inside that pillar.
   - **Mega Menu Tag Link** – select the WordPress tag visitors should land on
     when they click this label (e.g. the `cloud-security` tag you already use
     for filtering).
   - **Mega Menu Tag Order** – optional integer to control the order of labels
     within the selected group.
4. Update / publish the post. You can leave the fields empty if the review
   shouldn’t appear in the Software drawer.

---

## 3. What happens on the site

- Next.js will fetch every AI review, read the four new fields, and build a list
  of unique `group → label → tagSlug` links.
- The Software mega menu shows each group once. Labels inside the group are
  sorted by `Mega Menu Tag Order` (then alphabetically).
- Clicking a label routes to the `/collection/[slug]` page for the tag you chose
  in **Mega Menu Tag Link**.

> Tip: you can reuse the same group across as many reviews as you like; just
> pick the same “Mega Menu Group” option and give each review a unique label.

Once these fields exist in WordPress, we can update the Next.js GraphQL queries
to read `navGroup`, `navLabel`, `navTagLink`, and `navTagOrder` so the Software
menu is driven entirely by the data you enter per review.


