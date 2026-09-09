import { ContactButton } from '@app/components/ContactButton';
import type { LostItem } from '@app/services/lostAndFound/types';

import { contactMessage } from './constants';

type LostItemOwnerContactProps = Readonly<{ item: LostItem }>;

/** Não olha para a situação: combinar a devolução vale depois de concluído. */
export function LostItemOwnerContact({ item }: LostItemOwnerContactProps) {
  if (item.isOwner) return null;

  return <ContactButton contact={item.contact} message={contactMessage(item.name)} />;
}
