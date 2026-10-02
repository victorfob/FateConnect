import { useCallback } from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  type ListItemTextProps,
  type ThemePreference,
} from '@design-system';

import type { ThemeOption } from '../../@types';
import * as S from './styles';

/** Menu flutuante fala no corpo denso da escala, como o menu da conta. */
const ITEM_TEXT: ListItemTextProps['slotProps'] = { primary: { variant: 'caption' } };

export type ThemeMenuOptionProps = Readonly<{
  option: ThemeOption;
  chosen: boolean;
  onChoose: (preference: ThemePreference) => void;
}>;

export function ThemeMenuOption({ option, chosen, onChoose }: ThemeMenuOptionProps) {
  const handleClick = useCallback(() => onChoose(option.preference), [onChoose, option.preference]);

  return (
    <ListItemButton aria-current={chosen} onClick={handleClick}>
      <ListItemIcon>
        <option.Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={option.label} slotProps={ITEM_TEXT} />
      {chosen && <S.ChosenMark fontSize="small" />}
    </ListItemButton>
  );
}
