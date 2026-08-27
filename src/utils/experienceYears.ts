export interface ExperienceRange {
  start_time?: string | null;
  end_time?: string | null;
}

function getDateFromMonth(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getExperienceYears(experiences: ExperienceRange[]): number {
  const ranges = experiences
    .map((exp) => ({
      start: getDateFromMonth(exp.start_time),
      end: getDateFromMonth(exp.end_time),
    }))
    .filter((r): r is { start: Date; end: Date | null } => r.start !== null);

  if (ranges.length === 0) return 0;

  const earliestStart = ranges.reduce(
    (earliest, { start }) => (start < earliest ? start : earliest),
    ranges[0].start
  );
  const hasCurrentRole = ranges.some(({ end }) => !end);
  const latestEnd = hasCurrentRole
    ? new Date()
    : ranges.reduce(
        (latest, { end }) => (end && end > latest ? end : latest),
        ranges[0].end || ranges[0].start
      );
  const totalMonths =
    (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
    (latestEnd.getMonth() - earliestStart.getMonth()) +
    1;

  return Math.max(0, Math.floor(totalMonths / 12));
}
