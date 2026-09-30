import { Typography } from '@design-system';
import { DeleteIcon, ImageIcon } from '@design-system/icons';

import { PHOTO_FIELD_TEXTS } from '../../constants';
import * as S from './styles';

export type PhotoActionButtonsProps = Readonly<{
  pickLabel: string;
  onPick: VoidFunction;
  /** Sem foto à vista não há o que remover, e o botão não aparece. */
  canRemove: boolean;
  onRemove: VoidFunction;
  disabled?: boolean;
}>;

export function PhotoActionButtons({
  pickLabel,
  onPick,
  canRemove,
  onRemove,
  disabled,
}: PhotoActionButtonsProps) {
  return (
    <>
      <S.PhotoPickButton variant="soft" onClick={onPick} disabled={disabled}>
        <ImageIcon fontSize="small" />
        <Typography variant="caption" color="inherit">
          {pickLabel}
        </Typography>
      </S.PhotoPickButton>

      {canRemove && (
        <S.PhotoRemoveButton variant="destructive" onClick={onRemove} disabled={disabled}>
          <DeleteIcon fontSize="small" />
          <Typography variant="caption" color="inherit">
            {PHOTO_FIELD_TEXTS.remove}
          </Typography>
        </S.PhotoRemoveButton>
      )}
    </>
  );
}
