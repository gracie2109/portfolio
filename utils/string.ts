export const capitalizeFirstLetter = (value?: string | null): string => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed[0].toUpperCase() + trimmed.slice(1);
};