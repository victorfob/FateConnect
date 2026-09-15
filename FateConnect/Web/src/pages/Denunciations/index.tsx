import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { CardsList, PageShell, Pagination, Typography } from '@design-system';
import { ArrowBackIcon, SendIcon } from '@design-system/icons';

import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { RoutePathEnum } from '@app/routes/paths';
import { listDenunciations } from '@app/services/denunciations/denunciationsService';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { DenunciationCard } from './components/DenunciationCard';
import { DenunciationFilter } from './components/DenunciationFilter';
import { DenunciationFormDialog } from './components/DenunciationFormDialog';
import { denunciationSearchCodec } from './helpers/searchQuery';
import * as C from './constants';
import * as S from './styles';

const NO_ITEMS = 0;

export function Denunciations() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: denunciationSearchCodec,
      queryKey: C.DENUNCIATIONS_QUERY_KEY,
      listFunction: listDenunciations,
      errorMessage: C.DENUNCIATION_LIST_MESSAGES.loadFailed,
    });

  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  return (
    <PageShell
      title={C.DENUNCIATIONS_TITLE}
      titleAction={<DenunciationFilter initialFilters={filters} onApply={applyFilters} />}
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

      <Typography variant="h2">{C.LIST_SECTION_TITLE}</Typography>

      <CardsList
        isLoading={isPending}
        skeletonCount={PAGE_SIZE}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((denunciation) => (
          <DenunciationCard key={denunciation.id} denunciation={denunciation} />
        ))}
      </CardsList>

      <DenunciationFormDialog open={isFormOpen} onClose={handleCloseForm} />
    </PageShell>
  );
}
