import {
  DenunciationCategoryEnum,
  DenunciationStatusEnum,
  type Denunciation,
} from '@app/services/denunciations/types';
import { render, screen } from '@app/test/testing-library';

import { DENUNCIATION_CARD_MARKERS } from './constants';
import { DenunciationCard } from '.';

const DENUNCIATION: Denunciation = {
  id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
  category: DenunciationCategoryEnum.NO_SHOW,
  description: 'Combinou a carona e não apareceu no ponto.',
  imageUrl: null,
  thumbnailUrl: null,
  status: DenunciationStatusEnum.OPEN,
  user: null,
  isAnonymous: true,
  createdAt: '2026-09-30T14:20:00',
};

const renderComponent = (denunciation = DENUNCIATION) =>
  render(<DenunciationCard denunciation={denunciation} />);

describe('DenunciationCard', () => {
  it('should list the confidential marker before the date', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(
      `${DENUNCIATION_CARD_MARKERS.confidential}30/09/2026`,
    );
  });
});
