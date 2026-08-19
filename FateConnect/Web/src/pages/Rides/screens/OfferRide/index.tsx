import { useCallback } from 'react';

import { useNotification } from '@app/hooks/useNotification';
import { Typography } from '@design-system';
import { AddIcon } from '@design-system/icons';

import { OFFER_BUTTON_LABEL, OFFER_SOON_MESSAGE, OFFER_SUBTITLE, OFFER_TITLE } from './constants';
import * as S from './styles';

/**
 * Cartão de chamada para ofertar carona. O formulário em si ainda não existe no
 * produto — o botão avisa que está por vir, como hoje.
 */
export function OfferRide() {
  const { notifyWarning } = useNotification();

  const handleOfferClick = useCallback(() => notifyWarning(OFFER_SOON_MESSAGE), [notifyWarning]);

  return (
    <S.OfferWrapper>
      <S.OfferCard>
        <Typography variant="h2">{OFFER_TITLE}</Typography>
        <Typography variant="subtitle">{OFFER_SUBTITLE}</Typography>

        <S.OfferButton component="button" type="button" onClick={handleOfferClick}>
          <AddIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {OFFER_BUTTON_LABEL}
          </Typography>
        </S.OfferButton>
      </S.OfferCard>
    </S.OfferWrapper>
  );
}
