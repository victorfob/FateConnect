export type PartialDateRange = { start: Date | null; end: Date | null };

export interface ReadDateRange extends PartialDateRange {
  isInverted: boolean;
}
