import { Button } from '@design-system';
import { InfoOutlinedIcon, SaveIcon } from '@design-system/icons';

import { SAVE_BAR_TEXTS } from './constants';
import * as S from './styles';

export type SaveBarProps = Readonly<{
  hasChanges: boolean;
  saving: boolean;
  onDiscard: VoidFunction;
}>;

export function SaveBar({ hasChanges, saving, onDiscard }: SaveBarProps) {
  return (
    <S.SaveBarRoot>
      {hasChanges && (
        <S.UnsavedNotice variant="caption" role="status">
          <InfoOutlinedIcon fontSize="small" />
          {SAVE_BAR_TEXTS.unsaved}
        </S.UnsavedNotice>
      )}

      {hasChanges && (
        <Button type="button" variant="soft" onClick={onDiscard} disabled={saving}>
          {SAVE_BAR_TEXTS.discard}
        </Button>
      )}

      <Button
        type="submit"
        variant="contained"
        color="secondary"
        disabled={!hasChanges}
        loading={saving}
      >
        <SaveIcon fontSize="small" />
        {SAVE_BAR_TEXTS.save}
      </Button>
    </S.SaveBarRoot>
  );
}
