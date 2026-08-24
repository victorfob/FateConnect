import { LostItemKindEnum } from '@app/services/lostAndFound/types';
import { BackHandOutlinedIcon, LocalOfferIcon, NoBackpackOutlinedIcon } from '@design-system/icons';

type LostItemKindIconProps = Readonly<{ kind: string }>;

/** Quem perdeu ficou sem o objeto; quem achou já o tem na mão. */
export function LostItemKindIcon({ kind }: LostItemKindIconProps) {
  if (kind === LostItemKindEnum.LOST) return <NoBackpackOutlinedIcon />;
  if (kind === LostItemKindEnum.FOUND) return <BackHandOutlinedIcon />;

  return <LocalOfferIcon />;
}
