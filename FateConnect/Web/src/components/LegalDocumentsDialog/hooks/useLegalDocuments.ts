import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { acceptLegalDocuments, getLegalDocuments } from '@app/services/users/legalDocumentsService';
import type { LegalDocumentStatus } from '@app/services/users/legalDocumentsTypes';

import { ACCEPT_FAILED } from '../constants';

const LEGAL_DOCUMENTS_QUERY_KEY = 'legal-documents';

/** O aceite envia a versão que a API respondeu, e não a do pacote: aba aberta antes do deploy aceita a vigente. */
export function useLegalDocuments() {
  const queryClient = useQueryClient();
  const { queryKey, signedIn } = useSessionQueryKey(LEGAL_DOCUMENTS_QUERY_KEY);

  const { data } = useQuery({ queryKey, queryFn: getLegalDocuments, enabled: signedIn });

  const pending = useMemo(
    () => (data ?? []).filter((status) => !status.acceptedCurrentVersion),
    [data],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: acceptLegalDocuments,
    meta: { errorMessage: ACCEPT_FAILED },
    onSuccess: () =>
      queryClient.setQueryData<LegalDocumentStatus[]>(queryKey, (current) =>
        current?.map((status) => ({ ...status, acceptedCurrentVersion: true })),
      ),
    // A versão pode ter subido com o diálogo aberto: relê para mostrar a vigente.
    onError: () => queryClient.invalidateQueries({ queryKey }),
  });

  const accept = useCallback(
    () =>
      mutate(
        pending.map(({ document, currentVersion }) => ({ document, version: currentVersion })),
      ),
    [mutate, pending],
  );

  return { pending, accept, accepting: isPending };
}
