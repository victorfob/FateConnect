import { Link as RouterLink } from 'react-router';
import { Typography } from '@design-system';

import { APP_LINKS } from '@app/constants/navigation';

import * as C from './constants';
import * as S from './styles';

export function Menu() {
  return (
    <S.MenuRoot>
      <Typography variant="h1">{C.MENU_TITLE}</Typography>

      <S.MenuIntro>
        <Typography variant="subtitle" color="inherit">
          {C.MENU_INTRO}
        </Typography>
      </S.MenuIntro>

      <S.CardsContainer>
        {APP_LINKS.map(({ label, path, Icon }) => (
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
