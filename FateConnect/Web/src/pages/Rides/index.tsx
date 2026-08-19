import { NavLink, Outlet } from 'react-router';

import { RoutePath } from '@app/routes/paths';
import { AddIcon, ArrowBackIcon, SearchIcon, Typography } from '@design-system';

import { BACK_LABEL, OFFER_TAB_LABEL, RIDES_TITLE, SEARCH_TAB_LABEL } from './constants';
import * as S from './styles';

/** Casca das caronas: título, volta para o menu e as duas abas de rota. */
export function Rides() {
  return (
    <S.RidesRoot>
      <S.RidesHeader>
        <S.PageTitle variant="h1">{RIDES_TITLE}</S.PageTitle>

        <S.BackButton component={NavLink} to={RoutePath.MENU}>
          <ArrowBackIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {BACK_LABEL}
          </Typography>
        </S.BackButton>
      </S.RidesHeader>

      <S.TabList component="nav">
        <S.Tab component={NavLink} to={RoutePath.RIDES_SEARCH} end>
          <SearchIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {SEARCH_TAB_LABEL}
          </Typography>
        </S.Tab>

        <S.Tab component={NavLink} to={RoutePath.RIDES_OFFER}>
          <AddIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {OFFER_TAB_LABEL}
          </Typography>
        </S.Tab>
      </S.TabList>

      <Outlet />
    </S.RidesRoot>
  );
}
