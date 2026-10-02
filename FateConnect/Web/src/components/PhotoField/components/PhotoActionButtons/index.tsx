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
      <S.PhotoPickButton variant="soft" size="small" onClick={onPick} disabled={disabled}>
        <ImageIcon fontSize="small" />
        {pickLabel}
      </S.PhotoPickButton>

      {canRemove && (
        <S.PhotoRemoveButton
          variant="destructive"
          size="small"
          onClick={onRemove}
          disabled={disabled}
        >
          <DeleteIcon fontSize="small" />
          {PHOTO_FIELD_TEXTS.remove}
        </S.PhotoRemoveButton>
      )}
    </>
  );
}
