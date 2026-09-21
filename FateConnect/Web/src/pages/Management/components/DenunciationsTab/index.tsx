import { useCallback } from 'react';
import { CardsList, Pagination } from '@design-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DenunciationCard } from '@app/components/DenunciationCard';
import { StoredPhoto } from '@app/components/StoredPhoto';
import { useNotification } from '@app/hooks/useNotification';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import {
  listDenunciations,
  updateDenunciationStatus,
} from '@app/services/denunciations/denunciationsService';
import type { Denunciation, DenunciationStatusEnum } from '@app/services/denunciations/types';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { ManagementShell } from '../ManagementShell';
import { DenunciationReporterContact } from './components/DenunciationReporterContact';
import { DenunciationsFilter } from './components/DenunciationsFilter';
import { DenunciationStatusAction } from './components/DenunciationStatusAction';
import { managementDenunciationCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;

export function DenunciationsTab() {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: managementDenunciationCodec,
      queryKey: C.DENUNCIATIONS_QUERY_KEY,
      listFunction: listDenunciations,
      errorMessage: C.DENUNCIATION_LIST_MESSAGES.loadFailed,
    });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({
      denunciation,
      status,
    }: {
      denunciation: Denunciation;
      status: DenunciationStatusEnum;
    }) => updateDenunciationStatus(denunciation.id, status),
    onSuccess: () => {
      notifySuccess(C.DENUNCIATION_LIST_MESSAGES.statusChanged);
      void queryClient.invalidateQueries({ queryKey: [C.DENUNCIATIONS_QUERY_KEY] });
    },
    meta: { errorMessage: C.DENUNCIATION_LIST_MESSAGES.statusFailed },
  });

  const handleStatusConfirm = useCallback(
    (denunciation: Denunciation, status: DenunciationStatusEnum) =>
      changeStatus({ denunciation, status }),
    [changeStatus],
  );

  return (
    <ManagementShell
      titleAction={<DenunciationsFilter initialFilters={filters} onApply={applyFilters} />}
    >
      <CardsList
        isLoading={isPending}
        skeletonCount={PAGE_SIZE}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((denunciation) => (
          <DenunciationCard
            key={denunciation.id}
            denunciation={denunciation}
            media={
              <StoredPhoto
                url={denunciation.imageUrl}
                alt={C.photoAlt(denunciation)}
                download={{
                  label: C.DOWNLOAD_LABEL,
                  baseName: C.photoBaseName(denunciation),
                }}
              />
            }
            reporterContact={<DenunciationReporterContact user={denunciation.user} />}
            actions={
              <DenunciationStatusAction
                denunciation={denunciation}
                onConfirm={handleStatusConfirm}
              />
            }
          />
        ))}
      </CardsList>
    </ManagementShell>
  );
}
