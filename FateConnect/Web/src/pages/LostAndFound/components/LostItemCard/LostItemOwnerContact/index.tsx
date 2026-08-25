import { ContactButton } from '@app/components/ContactButton';
import { LOST_ITEM_OWNER } from '@app/pages/LostAndFound/helpers/lostItemOwner';
import type { LostItem } from '@app/services/lostAndFound/types';

import { contactMessage } from './constants';

type LostItemOwnerContactProps = Readonly<{ item: LostItem }>;

/** Não olha para a situação: combinar a devolução vale depois de concluído. */
export function LostItemOwnerContact({ item }: LostItemOwnerContactProps) {
  if (item.meuItem) return null;

  return <ContactButton contact={LOST_ITEM_OWNER} message={contactMessage(item.nome)} />;
}
