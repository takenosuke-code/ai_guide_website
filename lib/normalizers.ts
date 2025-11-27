// lib/normalizers.ts

/**
 * Normalize keyFindings from aiToolMeta.keyFindingsRaw (camelCase)
 * Parses similar to KeyFindingsSection: first line is title, next lines are description, blank line = new feature
 * Returns only the titles (for unexpanded/collapsed view on homepage cards)
 */
export function normalizeKeyFindings(node: any): string[] {
  const raw = node?.aiToolMeta?.keyFindingsRaw ?? "";
  
  if (!raw || String(raw).trim() === '') {
    return [];
  }

  // Split by double newlines (blank lines) to separate different features
  const sections = String(raw).split(/\n\s*\n/).filter(section => section.trim() !== '');
  
  const titles: string[] = [];
  
  sections.forEach(section => {
    const lines = section.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
    
    if (lines.length > 0) {
      // First line is the feature title
      const title = lines[0];
      if (title) {
        titles.push(title);
      }
    }
  });
  
  return titles.slice(0, 5); // Cap at 5 items for homepage cards
}

