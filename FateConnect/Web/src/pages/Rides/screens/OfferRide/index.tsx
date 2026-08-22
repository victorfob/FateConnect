import { useCallback, useState } from 'react';

import { Typography } from '@design-system';
import { AddIcon } from '@design-system/icons';

import { RideFormDialog } from '../../components/RideFormDialog';
import * as C from './constants';
import * as S from './styles';

/** Cartão de chamada para ofertar carona; o formulário vem no diálogo. */
export function OfferRide() {
  const [isOffering, setIsOffering] = useState(false);

  const handleOpen = useCallback(() => setIsOffering(true), []);
  const handleClose = useCallback(() => setIsOffering(false), []);

  return (
    <S.OfferWrapper>
      <S.OfferCard>
        <Typography variant="h2">{C.OFFER_TITLE}</Typography>
        <Typography variant="subtitle">{C.OFFER_SUBTITLE}</Typography>

        <S.OfferButton component="button" type="button" onClick={handleOpen}>
          <AddIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {C.OFFER_BUTTON_LABEL}
          </Typography>
        </S.OfferButton>
      </S.OfferCard>

      <RideFormDialog open={isOffering} onClose={handleClose} />
    </S.OfferWrapper>
  );
}
