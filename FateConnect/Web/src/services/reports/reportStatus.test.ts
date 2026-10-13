import {
  isReportStatus,
  parseReportStatus,
  REPORT_STATUS_OPTIONS,
  reportStatusLabel,
  reportStatusSlug,
  reportStatusTone,
  reportStatusTransitions,
} from './reportStatus';
import { ReportStatusEnum } from './types';

const UNKNOWN_LABEL = '—';

describe('reportStatus', () => {
  it.each([
    [ReportStatusEnum.OPEN, 'Aberta', 'warning'],
    [ReportStatusEnum.IN_REVIEW, 'Em análise', 'muted'],
    [ReportStatusEnum.RESOLVED, 'Resolvida', 'success'],
    [ReportStatusEnum.DISMISSED, 'Descartada', 'danger'],
  ])('should name and tone %s', (status, label, tone) => {
    expect(reportStatusLabel(status)).toBe(label);
    expect(reportStatusTone(status)).toBe(tone);
  });

  it('should offer every situation as an option, in the order of the contract', () => {
    expect(REPORT_STATUS_OPTIONS.map((option) => option.value)).toEqual(
      Object.values(ReportStatusEnum),
    );
  });

  it('should survive a situation the product does not know', () => {
    expect(reportStatusLabel('Escalated')).toBe('Escalated');
    expect(reportStatusLabel(null)).toBe(UNKNOWN_LABEL);
    expect(reportStatusLabel('   ')).toBe(UNKNOWN_LABEL);
    expect(reportStatusTone('Escalated')).toBe('neutral');
    expect(isReportStatus('Escalated')).toBe(false);
  });

  it('should read back every slug it writes', () => {
    const roundTrip = Object.values(ReportStatusEnum).map((status) =>
      parseReportStatus(reportStatusSlug(status)),
    );

    expect(roundTrip).toEqual(Object.values(ReportStatusEnum));
  });

  it('should read the slug as the address may carry it, and refuse what is not one', () => {
    expect(parseReportStatus('  DESCARTADA ')).toBe(ReportStatusEnum.DISMISSED);
    expect(parseReportStatus('resolvido')).toBeNull();
    expect(parseReportStatus(null)).toBeNull();
  });
});

describe('reportStatusTransitions', () => {
  // Os pares que `Report.ValidateTransition` aceita: são exatamente estes quatro.
  it.each([
    [ReportStatusEnum.OPEN, [ReportStatusEnum.IN_REVIEW, ReportStatusEnum.DISMISSED]],
    [ReportStatusEnum.IN_REVIEW, [ReportStatusEnum.RESOLVED, ReportStatusEnum.DISMISSED]],
  ])('should offer what the api accepts from %s', (from, expected) => {
    expect(reportStatusTransitions(from)).toEqual(expected);
  });

  it.each([ReportStatusEnum.RESOLVED, ReportStatusEnum.DISMISSED])(
    'should offer nothing from %s, which is terminal',
    (from) => {
      expect(reportStatusTransitions(from)).toEqual([]);
    },
  );

  // O caminho que a tela não pode oferecer: resolver exige passar pela análise.
  it('should keep an open report away from resolved', () => {
    expect(reportStatusTransitions(ReportStatusEnum.OPEN)).not.toContain(ReportStatusEnum.RESOLVED);
  });
});
