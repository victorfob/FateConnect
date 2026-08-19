import { NavLink, Outlet } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { Typography } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';

import * as C from './constants';
import * as S from './styles';

/** Casca das caronas: título, volta para o menu e as duas abas de rota. */
export function Rides() {
  return (
    <S.RidesRoot>
      <S.RidesHeader>
        <S.PageTitle variant="h1">{C.RIDES_TITLE}</S.PageTitle>

        <S.BackButton component={NavLink} to={RoutePathEnum.MENU}>
          <ArrowBackIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {C.BACK_LABEL}
          </Typography>
        </S.BackButton>
      </S.RidesHeader>

      <S.TabList component="nav">
        <S.Tab component={NavLink} to={RoutePathEnum.RIDES_SEARCH} end>
          <SearchIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {C.SEARCH_TAB_LABEL}
          </Typography>
        </S.Tab>

        <S.Tab component={NavLink} to={RoutePathEnum.RIDES_OFFER}>
          <AddIcon fontSize="small" />
          <Typography variant="subtitleBold" color="inherit">
            {C.OFFER_TAB_LABEL}
          </Typography>
        </S.Tab>
      </S.TabList>

      <Outlet />
    </S.RidesRoot>
  );
}
