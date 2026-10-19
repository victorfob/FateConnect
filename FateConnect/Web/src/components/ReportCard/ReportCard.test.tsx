import { ReportCategoryEnum, ReportStatusEnum, type Report } from '@app/services/reports/types';
import { render, screen } from '@app/test/testing-library';

import { REPORT_CARD_MARKERS } from './constants';
import { ReportCard } from '.';

const REPORT: Report = {
  id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
  category: ReportCategoryEnum.NO_SHOW,
  description: 'Combinou a carona e não apareceu no ponto.',
  imageUrl: null,
  thumbnailUrl: null,
  status: ReportStatusEnum.OPEN,
  user: null,
  isConfidential: true,
  createdAt: '2026-09-30T14:20:00',
};

const renderComponent = (report = REPORT) => render(<ReportCard report={report} />);

describe('ReportCard', () => {
  it('should list the confidential marker before the date', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(
      `${REPORT_CARD_MARKERS.confidential}30/09/2026`,
    );
  });
});
