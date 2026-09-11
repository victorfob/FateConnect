export type PartialDateRange = { start: Date | null; end: Date | null };

export interface ReadDateRange extends PartialDateRange {
  isInverted: boolean;
}

/** A forma que a faixa do período assume na célula de um dia. */
export type DayBandShape = 'outside' | 'inside' | 'start' | 'end' | 'only';
