export function normalizeBillId(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
