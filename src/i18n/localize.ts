/**
 * Picks the localized value of a bilingual field pair (e.g. title_vi/title_en)
 * off a data row, falling back to the English value.
 */
export function localizeField(
  row: Record<string, unknown>,
  field: string,
  lang: string
): string {
  if (lang === "vi") return (row[`${field}_vi`] as string) || (row[`${field}_en`] as string);
  return row[`${field}_en`] as string;
}
