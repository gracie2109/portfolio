/**
 * Picks the localized value of a bilingual field pair (e.g. title_vi/title_en)
 * off a data row, falling back to the English value.
 */
export function localizeField(row, field, lang) {
  if (lang === "vi") return row[`${field}_vi`] || row[`${field}_en`];
  return row[`${field}_en`];
}
