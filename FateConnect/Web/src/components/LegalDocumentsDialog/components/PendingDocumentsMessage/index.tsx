import { InlineLink } from '@app/components/InlineLink';
import { DocumentTypeEnum } from '@app/services/signup/types';

import { CHANGED_MESSAGES, PRIVACY_LINK, TERMS_LINK } from '../../constants';

export type PendingDocumentsMessageProps = Readonly<{ documents: readonly DocumentTypeEnum[] }>;

/** Nomeia o que mudou, e o nome de cada documento abre o PDF dele. */
export function PendingDocumentsMessage({ documents }: PendingDocumentsMessageProps) {
  const termsPending = documents.includes(DocumentTypeEnum.TERMS_OF_USE);
  const privacyPending = documents.includes(DocumentTypeEnum.PRIVACY_POLICY);

  if (termsPending && privacyPending)
    return (
      <>
        {CHANGED_MESSAGES.both.prefix}
        <InlineLink href={TERMS_LINK.url}>{TERMS_LINK.label}</InlineLink>
        {CHANGED_MESSAGES.both.separator}
        <InlineLink href={PRIVACY_LINK.url}>{PRIVACY_LINK.label}</InlineLink>
        {CHANGED_MESSAGES.both.suffix}
      </>
    );

  if (termsPending)
    return (
      <>
        {CHANGED_MESSAGES.termsOfUse.prefix}
        <InlineLink href={TERMS_LINK.url}>{TERMS_LINK.label}</InlineLink>
        {CHANGED_MESSAGES.termsOfUse.suffix}
      </>
    );

  return (
    <>
      {CHANGED_MESSAGES.privacyPolicy.prefix}
      <InlineLink href={PRIVACY_LINK.url}>{PRIVACY_LINK.label}</InlineLink>
      {CHANGED_MESSAGES.privacyPolicy.suffix}
    </>
  );
}
