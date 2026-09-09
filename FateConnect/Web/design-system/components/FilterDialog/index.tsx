import { useCallback, useState, type ReactNode, type SubmitEvent } from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Dialog } from '../Dialog';
import { IconButton } from '../IconButton';
import { FilterDialogField } from './FilterDialogField';
import * as S from './styles';

export type FilterDialogProps = Readonly<{
  /** Nome do gatilho: vira tooltip e nome acessível do botão de ícone. */
  triggerLabel: string;
  title: string;
  submitLabel: string;
  clearLabel: string;
  /** Ponto no gatilho enquanto a lista está filtrada. */
  active?: boolean;
  onSubmit: VoidFunction;
  /** Devolve a lista ao padrão da tela. Só é oferecido com filtro valendo. */
  onClear: VoidFunction;
  children: ReactNode;
}>;

/**
 * Filtros das listas: um botão de ícone que avisa quando há filtro valendo e
 * abre o diálogo da aplicação com os campos. Quem usa entrega só os campos, em
 * `Field`, e recebe de volta o pedido de aplicar e o de limpar.
 */
function FilterDialog({
  triggerLabel,
  title,
  submitLabel,
  clearLabel,
  active,
  onSubmit,
  onClear,
  children,
}: FilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLElement>) => {
      event.preventDefault();
      setIsOpen(false);
      onSubmit();
    },
    [onSubmit],
  );

  const handleClear = useCallback(() => {
    setIsOpen(false);
    onClear();
  }, [onClear]);

  return (
    <>
      <S.TriggerBadge variant="dot" color="secondary" invisible={!active}>
        <IconButton type="button" label={triggerLabel} onClick={handleOpen}>
          <FilterAltIcon />
        </IconButton>
      </S.TriggerBadge>

      <Dialog open={isOpen} onClose={handleClose} title={title}>
        <S.FilterForm component="form" onSubmit={handleSubmit}>
          <Dialog.Body>
            <S.FieldsGrid>{children}</S.FieldsGrid>
          </Dialog.Body>

          <Dialog.Footer>
            {active && (
              <Button type="button" variant="contained" color="primary" onClick={handleClear}>
                <Typography variant="subtitleBold" color="inherit">
                  {clearLabel}
                </Typography>
              </Button>
            )}

            <Button type="submit" variant="contained" color="secondary">
              <SearchIcon fontSize="small" />
              <Typography variant="subtitleBold" color="inherit">
                {submitLabel}
              </Typography>
            </Button>
          </Dialog.Footer>
        </S.FilterForm>
      </Dialog>
    </>
  );
}

FilterDialog.Field = FilterDialogField;

export { FilterDialog };
