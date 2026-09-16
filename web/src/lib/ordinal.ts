/** 1st, 2nd, 3rd, 4th — and 11th/12th/13th, which break the pattern. */
export function ordinal(n: number): string {
  const teens = n % 100
  if (teens >= 11 && teens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}
