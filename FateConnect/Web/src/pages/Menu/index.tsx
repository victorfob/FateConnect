import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router';
import { Typography } from '@design-system';

import { useAppLinks } from '@app/hooks/useAppLinks';

import * as C from './constants';
import * as S from './styles';

/** Em fileira única os quatro cartões encostam nas bordas; em duas colunas, não. */
const FULL_MENU_SIZE = 4;
const BALANCED_COLUMNS = 2;

export function Menu() {
  const appLinks = useAppLinks();

  const columns = useMemo(() => {
    if (appLinks.length === FULL_MENU_SIZE) return BALANCED_COLUMNS;

    return appLinks.length;
  }, [appLinks.length]);

  return (
    <S.MenuRoot>
      <Typography variant="h1">{C.MENU_TITLE}</Typography>

      <S.MenuIntro>
        <Typography variant="subtitle" color="inherit">
          {C.MENU_INTRO}
        </Typography>
      </S.MenuIntro>

      <S.CardsContainer columns={columns}>
        {appLinks.map(({ label, path, Icon }) => (
          <S.ServiceCard key={path} component={RouterLink} to={path}>
            <S.IconDisc aria-hidden="true">
              <Icon />
            </S.IconDisc>

            <Typography variant="h2">{label}</Typography>
          </S.ServiceCard>
        ))}
      </S.CardsContainer>
    </S.MenuRoot>
  );
}
