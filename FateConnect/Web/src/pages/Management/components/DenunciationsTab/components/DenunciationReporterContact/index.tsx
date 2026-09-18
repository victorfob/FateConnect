import { ContactButton } from '@app/components/ContactButton';
import type { UserContact } from '@app/services/types';

import { contactMessage } from './constants';

type DenunciationReporterContactProps = Readonly<{ user: UserContact | null }>;

/** Denúncia sigilosa chega sem contato, e aí não há a quem escrever. */
export function DenunciationReporterContact({ user }: DenunciationReporterContactProps) {
  if (!user) return null;

  return <ContactButton contact={user} message={contactMessage()} />;
}
