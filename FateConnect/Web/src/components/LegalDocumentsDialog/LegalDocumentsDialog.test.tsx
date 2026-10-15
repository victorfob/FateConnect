import { http, HttpResponse } from 'msw';

import { DEACTIVATE } from '@app/components/DeactivateAccount/constants';
import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';
import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { DocumentTypeEnum } from '@app/services/signup/types';
import type { LegalDocumentStatus } from '@app/services/users/legalDocumentsTypes';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import * as C from './constants';
import { LegalDocumentsDialog } from '.';

const LEGAL_DOCUMENTS_URL = 'https://api.fateconnect.test/users/me/legal-documents';
const ACCEPTANCES_URL = `${LEGAL_DOCUMENTS_URL}/acceptances`;
const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';

const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const TERMS_VERSION = '2026-10-14';
const RAISED_PRIVACY_VERSION = '2026-12-01';
const RAISED_TERMS_VERSION = '2026-12-02';

const ACCEPTED_TERMS: LegalDocumentStatus = {
  document: DocumentTypeEnum.TERMS_OF_USE,
  currentVersion: TERMS_VERSION,
  acceptedCurrentVersion: true,
};
const PENDING_TERMS: LegalDocumentStatus = {
  document: DocumentTypeEnum.TERMS_OF_USE,
  currentVersion: RAISED_TERMS_VERSION,
  acceptedCurrentVersion: false,
};
const PENDING_PRIVACY: LegalDocumentStatus = {
  document: DocumentTypeEnum.PRIVACY_POLICY,
  currentVersion: RAISED_PRIVACY_VERSION,
  acceptedCurrentVersion: false,
};
const ACCEPTED_PRIVACY: LegalDocumentStatus = { ...PENDING_PRIVACY, acceptedCurrentVersion: true };

const DISAGREEMENT_SENTENCE = `${C.DISAGREEMENT.prefix}${C.DISAGREEMENT.deactivateLink}${C.DISAGREEMENT.suffix}`;

function serveDocuments(documents: LegalDocumentStatus[]) {
  const requests = { count: 0 };
  server.use(
    http.get(LEGAL_DOCUMENTS_URL, () => {
      requests.count += 1;

      return HttpResponse.json(documents);
    }),
  );

  return requests;
}

function recordAcceptances(status = NO_CONTENT) {
  const bodies: unknown[] = [];
  server.use(
    http.post(ACCEPTANCES_URL, async ({ request }) => {
      bodies.push(await request.json());

      return new HttpResponse(null, { status });
    }),
  );

  return bodies;
}

const findDialog = () => screen.findByRole('dialog', { name: C.LEGAL_DOCUMENTS_TITLE });

describe('LegalDocumentsDialog', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Mariana Alves Rocha'));
  });

  it('should show nothing to whoever already accepted the current versions', async () => {
    const requests = serveDocuments([ACCEPTED_TERMS, ACCEPTED_PRIVACY]);
    render(<LegalDocumentsDialog />);

    await waitFor(() => expect(requests.count).toBe(1));

    expect(screen.queryByRole('dialog', { name: C.LEGAL_DOCUMENTS_TITLE })).not.toBeInTheDocument();
  });

  it('should name the privacy policy and open its document when only it changed', async () => {
    serveDocuments([ACCEPTED_TERMS, PENDING_PRIVACY]);
    render(<LegalDocumentsDialog />);

    const dialog = await findDialog();

    expect(dialog).toHaveTextContent(
      `${C.CHANGED_MESSAGES.privacyPolicy.prefix}${C.PRIVACY_LINK.label}${C.CHANGED_MESSAGES.privacyPolicy.suffix}${DISAGREEMENT_SENTENCE}`,
    );
    expect(within(dialog).getByRole('link', { name: C.PRIVACY_LINK.label })).toHaveAttribute(
      'href',
      PRIVACY_URL,
    );
    expect(
      within(dialog).queryByRole('link', { name: C.TERMS_LINK.label }),
    ).not.toBeInTheDocument();
  });

  it('should name the terms of use and open their document when only they changed', async () => {
    serveDocuments([PENDING_TERMS, ACCEPTED_PRIVACY]);
    render(<LegalDocumentsDialog />);

    const dialog = await findDialog();

    expect(dialog).toHaveTextContent(
      `${C.CHANGED_MESSAGES.termsOfUse.prefix}${C.TERMS_LINK.label}${C.CHANGED_MESSAGES.termsOfUse.suffix}`,
    );
    expect(within(dialog).getByRole('link', { name: C.TERMS_LINK.label })).toHaveAttribute(
      'href',
      TERMS_URL,
    );
    expect(
      within(dialog).queryByRole('link', { name: C.PRIVACY_LINK.label }),
    ).not.toBeInTheDocument();
  });

  it('should name both documents when both changed', async () => {
    serveDocuments([PENDING_TERMS, PENDING_PRIVACY]);
    render(<LegalDocumentsDialog />);

    const dialog = await findDialog();

    expect(dialog).toHaveTextContent(
      `${C.CHANGED_MESSAGES.both.prefix}${C.TERMS_LINK.label}${C.CHANGED_MESSAGES.both.separator}${C.PRIVACY_LINK.label}${C.CHANGED_MESSAGES.both.suffix}`,
    );
  });

  it('should hold the person until a choice, without closing on escape', async () => {
    serveDocuments([ACCEPTED_TERMS, PENDING_PRIVACY]);
    render(<LegalDocumentsDialog />);
    await findDialog();

    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { name: C.LEGAL_DOCUMENTS_TITLE })).toBeInTheDocument();
  });

  it('should record the version the API answered and let the person through', async () => {
    serveDocuments([PENDING_TERMS, PENDING_PRIVACY]);
    const acceptances = recordAcceptances();
    render(<LegalDocumentsDialog />);
    const dialog = await findDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: C.ACCEPT_LABEL }));

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: C.LEGAL_DOCUMENTS_TITLE }),
      ).not.toBeInTheDocument(),
    );
    expect(acceptances).toEqual([
      {
        acceptances: [
          { document: DocumentTypeEnum.TERMS_OF_USE, version: RAISED_TERMS_VERSION },
          { document: DocumentTypeEnum.PRIVACY_POLICY, version: RAISED_PRIVACY_VERSION },
        ],
      },
    ]);
  });

  it('should keep the dialog and read the documents again when the acceptance is refused', async () => {
    const requests = serveDocuments([ACCEPTED_TERMS, PENDING_PRIVACY]);
    recordAcceptances(BAD_REQUEST);
    render(<LegalDocumentsDialog />);
    const dialog = await findDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: C.ACCEPT_LABEL }));

    expect(await screen.findByText(C.ACCEPT_FAILED)).toBeInTheDocument();
    // O diálogo é modal e esconde o resto da página da árvore de acessibilidade.
    expect(screen.getAllByRole('alert', { hidden: true })).toHaveLength(1);
    await waitFor(() => expect(requests.count).toBe(2));
    expect(screen.getByRole('dialog', { name: C.LEGAL_DOCUMENTS_TITLE })).toBeInTheDocument();
  });

  it('should end the session on leaving, without recording any acceptance', async () => {
    serveDocuments([ACCEPTED_TERMS, PENDING_PRIVACY]);
    const acceptances = recordAcceptances();
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    render(<LegalDocumentsDialog />);
    const dialog = await findDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: C.SIGN_OUT_LABEL }));

    expect(tokenStorage.getToken()).toBeNull();
    expect(acceptances).toEqual([]);
  });

  it('should open the account deactivation confirmation from the link in the text', async () => {
    serveDocuments([ACCEPTED_TERMS, PENDING_PRIVACY]);
    render(<LegalDocumentsDialog />);
    const dialog = await findDialog();

    await userEvent.click(
      within(dialog).getByRole('button', { name: C.DISAGREEMENT.deactivateLink }),
    );

    expect(screen.getByRole('dialog', { name: DEACTIVATE.dialogTitle })).toBeInTheDocument();
  });
});
