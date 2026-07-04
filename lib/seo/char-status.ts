/** Color for a live character counter: grey while empty, amber while short
 * of the recommended minimum, green once it's in the good range, red past
 * the maximum. Shared so every counter in the editor agrees on when a
 * field actually looks right. */
export function charStatusColor(length: number, min: number, max: number): string {
  if (length === 0) return "text-muted-foreground";
  if (length > max) return "text-destructive";
  if (length < min) return "text-amber-600 dark:text-amber-500";
  return "text-emerald-600 dark:text-emerald-500";
}
