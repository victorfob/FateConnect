import { useCallback, useState, type MouseEvent } from 'react';
import {
  AnchoredPopover,
  IconButton,
  List,
  useThemeMode,
  type ThemePreference,
} from '@design-system';
import { ExpandMoreIcon } from '@design-system/icons';

import { ThemeMenuOption } from './components/ThemeMenuOption';
import { optionFor, THEME_LABEL, THEME_OPTIONS, triggerLabel } from './constants';
import * as S from './styles';

export type ThemeMenuProps = Readonly<{
  /** No topo, só o ícone do tema escolhido: não cabe o nome ao lado do menu. */
  iconOnly?: boolean;
}>;

export function ThemeMenu({ iconOnly = false }: ThemeMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { preference, choosePreference } = useThemeMode();
  const chosen = optionFor(preference);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    [],
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleChoose = useCallback(
    (option: ThemePreference) => {
      choosePreference(option);
      setAnchorEl(null);
    },
    [choosePreference],
  );

  return (
    <>
      {iconOnly ? (
        <IconButton
          color="inherit"
          size="large"
          label={triggerLabel(chosen.label)}
          onClick={handleOpen}
        >
          <chosen.Icon />
        </IconButton>
      ) : (
        <S.LabelledTrigger
          variant="soft"
          size="small"
          aria-label={triggerLabel(chosen.label)}
          startIcon={<chosen.Icon />}
          endIcon={<ExpandMoreIcon />}
          onClick={handleOpen}
        >
          {chosen.label}
        </S.LabelledTrigger>
      )}

      <AnchoredPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        label={THEME_LABEL}
      >
        <List subheader={<S.MenuTitle>{THEME_LABEL}</S.MenuTitle>}>
          {THEME_OPTIONS.map((option) => (
            <ThemeMenuOption
              key={option.preference}
              option={option}
              chosen={option.preference === preference}
              onChoose={handleChoose}
            />
          ))}
        </List>
      </AnchoredPopover>
    </>
  );
}
