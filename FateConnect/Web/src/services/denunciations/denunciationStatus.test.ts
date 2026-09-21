import {
  DENUNCIATION_STATUS_OPTIONS,
  denunciationStatusLabel,
  denunciationStatusSlug,
  denunciationStatusTone,
  denunciationStatusTransitions,
  isDenunciationStatus,
  parseDenunciationStatus,
} from './denunciationStatus';
import { DenunciationStatusEnum } from './types';

const UNKNOWN_LABEL = '—';

describe('denunciationStatus', () => {
  it.each([
    [DenunciationStatusEnum.OPEN, 'Aberta', 'warning'],
    [DenunciationStatusEnum.IN_REVIEW, 'Em análise', 'neutral'],
    [DenunciationStatusEnum.RESOLVED, 'Resolvida', 'success'],
    [DenunciationStatusEnum.DISMISSED, 'Descartada', 'danger'],
  ])('should name and tone %s', (status, label, tone) => {
    expect(denunciationStatusLabel(status)).toBe(label);
    expect(denunciationStatusTone(status)).toBe(tone);
  });

  it('should offer every situation as an option, in the order of the contract', () => {
    expect(DENUNCIATION_STATUS_OPTIONS.map((option) => option.value)).toEqual(
      Object.values(DenunciationStatusEnum),
    );
  });

  it('should survive a situation the product does not know', () => {
    expect(denunciationStatusLabel('Escalated')).toBe('Escalated');
    expect(denunciationStatusLabel(null)).toBe(UNKNOWN_LABEL);
    expect(denunciationStatusLabel('   ')).toBe(UNKNOWN_LABEL);
    expect(denunciationStatusTone('Escalated')).toBe('neutral');
    expect(isDenunciationStatus('Escalated')).toBe(false);
  });

  it('should read back every slug it writes', () => {
    const roundTrip = Object.values(DenunciationStatusEnum).map((status) =>
      parseDenunciationStatus(denunciationStatusSlug(status)),
    );

    expect(roundTrip).toEqual(Object.values(DenunciationStatusEnum));
  });

  it('should read the slug as the address may carry it, and refuse what is not one', () => {
    expect(parseDenunciationStatus('  DESCARTADA ')).toBe(DenunciationStatusEnum.DISMISSED);
    expect(parseDenunciationStatus('resolvido')).toBeNull();
    expect(parseDenunciationStatus(null)).toBeNull();
  });
});

describe('denunciationStatusTransitions', () => {
  // Medido em `Denunciation.ValidateTransition`: são exatamente estes quatro pares.
  it.each([
    [
      DenunciationStatusEnum.OPEN,
      [DenunciationStatusEnum.IN_REVIEW, DenunciationStatusEnum.DISMISSED],
    ],
    [
      DenunciationStatusEnum.IN_REVIEW,
      [DenunciationStatusEnum.RESOLVED, DenunciationStatusEnum.DISMISSED],
    ],
  ])('should offer what the api accepts from %s', (from, expected) => {
    expect(denunciationStatusTransitions(from)).toEqual(expected);
  });

  it.each([DenunciationStatusEnum.RESOLVED, DenunciationStatusEnum.DISMISSED])(
    'should offer nothing from %s, which is terminal',
    (from) => {
      expect(denunciationStatusTransitions(from)).toEqual([]);
    },
  );

  // O caminho que a tela não pode oferecer: resolver exige passar pela análise.
  it('should keep an open denunciation away from resolved', () => {
    expect(denunciationStatusTransitions(DenunciationStatusEnum.OPEN)).not.toContain(
      DenunciationStatusEnum.RESOLVED,
    );
  });
});
