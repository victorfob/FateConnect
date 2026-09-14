import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { PageShell, Typography } from '@design-system';
import { ArrowBackIcon, SendIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import { DenunciationFormDialog } from './components/DenunciationFormDialog';
import * as C from './constants';
import * as S from './styles';

export function Denunciations() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  return (
    <PageShell
      title={C.DENUNCIATIONS_TITLE}
      action={
        <PageShell.Back
          label={C.BACK_LABEL}
          icon={<ArrowBackIcon fontSize="small" />}
          component={NavLink}
          to={RoutePathEnum.MENU}
        />
      }
    >
      <S.IntroCard>
        <Typography variant="h2">{C.DENUNCIATIONS_INTRO.title}</Typography>
        <S.IntroText variant="subtitle">{C.DENUNCIATIONS_INTRO.description}</S.IntroText>

        <S.StartButton variant="contained" color="secondary" onClick={handleOpenForm}>
          <SendIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {C.DENUNCIATIONS_INTRO.action}
          </Typography>
        </S.StartButton>
      </S.IntroCard>

      <DenunciationFormDialog open={isFormOpen} onClose={handleCloseForm} />
    </PageShell>
  );
}
