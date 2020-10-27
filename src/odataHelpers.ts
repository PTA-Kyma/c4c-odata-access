const dateRegex = /Date\((\d+)\)/;

export function parseDate(date: string): Date | null {
  const match = dateRegex.exec(date);
  if (!match) return null;
  return new Date(Number(match[1]));
}
