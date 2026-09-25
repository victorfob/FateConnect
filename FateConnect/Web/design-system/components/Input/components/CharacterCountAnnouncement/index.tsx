import { HiddenField } from '@ds-root/components/HiddenField';
import { characterCountAnnouncement } from '@ds-root/components/Input/constants';
import { useDebouncedValue } from '@ds-root/components/Input/hooks/useDebouncedValue';

const TYPING_PAUSE_BEFORE_ANNOUNCING_MS = 1000;

export type CharacterCountAnnouncementProps = Readonly<{
  characterCount: number;
  maxLength: number;
}>;

export function CharacterCountAnnouncement({
  characterCount,
  maxLength,
}: CharacterCountAnnouncementProps) {
  const announcement = useDebouncedValue(
    characterCountAnnouncement(characterCount, maxLength),
    TYPING_PAUSE_BEFORE_ANNOUNCING_MS,
  );

  return (
    <HiddenField component="span" role="status">
      {announcement}
    </HiddenField>
  );
}
