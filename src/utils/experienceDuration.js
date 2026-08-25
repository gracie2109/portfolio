export function formatPeriod(start, end, lang) {
  if (end) return `${start} — ${end}`;
  return `${start} — ${lang === "vi" ? "Hiện tại" : "Present"}`;
}

export function getDuration(startString, endString, lang) {
  if (!startString) return "";
  const startYear = +startString.slice(0, 4);
  const startMonth = +startString.slice(5, 7);
  const now = new Date();
  let endYear, endMonth;
  if (!endString) {
    endYear = now.getFullYear();
    endMonth = now.getMonth() + 1;
  } else {
    endYear = +endString.slice(0, 4);
    endMonth = +endString.slice(5, 7);
  }
  const totalMonths =
    (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  if (totalMonths <= 0) return "";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (lang === "vi") {
    if (years > 0 && months > 0) return `${years} năm ${months} tháng`;
    if (years > 0) return `${years} năm`;
    return `${months} tháng`;
  } else {
    if (years > 0 && months > 0) return `${years} yr ${months} mo`;
    if (years > 0) return `${years} yr`;
    return `${months} mo`;
  }
}
