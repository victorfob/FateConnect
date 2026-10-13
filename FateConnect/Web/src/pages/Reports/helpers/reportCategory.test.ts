import { ReportCategoryEnum } from '@app/services/reports/types';

import {
  isReportCategory,
  parseReportCategory,
  REPORT_CATEGORY_OPTIONS,
  reportCategorySlug,
} from './reportCategory';

/** Quantas o `EnumReportCategory` declara hoje. */
const CATEGORY_COUNT = 9;

describe('reportCategory', () => {
  it('should offer one option per category, each labelled in pt-BR', () => {
    const labelled = REPORT_CATEGORY_OPTIONS.filter((option) => option.label !== option.value);

    expect(REPORT_CATEGORY_OPTIONS).toHaveLength(CATEGORY_COUNT);
    expect(labelled).toHaveLength(CATEGORY_COUNT);
  });

  it('should narrow what the API serializes and refuse the rest', () => {
    expect(isReportCategory(ReportCategoryEnum.SPAM)).toBe(true);
    expect(isReportCategory('')).toBe(false);
    expect(isReportCategory('Harassment')).toBe(false);
  });
});

describe('reportCategorySlug e parseReportCategory', () => {
  it.each(Object.values(ReportCategoryEnum))('should survive the round trip for %s', (category) => {
    expect(parseReportCategory(reportCategorySlug(category))).toBe(category);
  });

  it('should read the slug regardless of case', () => {
    expect(parseReportCategory('  PERFIL-FALSO ')).toBe(ReportCategoryEnum.FAKE_PROFILE);
  });

  it.each([null, undefined, '', 'inventado'])('should refuse %s', (raw) => {
    expect(parseReportCategory(raw)).toBeNull();
  });
});
