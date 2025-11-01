// lib/normalizers.ts

/**
 * Normalize keyFindings from aiToolMeta.keyFindingsRaw (camelCase)
 * Splits textarea content by newline into array of strings
 */
export function normalizeKeyFindings(node: any): string[] {
  const raw = node?.aiToolMeta?.keyFindingsRaw ?? "";

  return String(raw)
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 12); // optional cap at 12 items
}

