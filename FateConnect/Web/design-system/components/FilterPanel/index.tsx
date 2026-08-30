import type { ReactNode, SubmitEvent } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';

import { FilterPanelField } from './FilterPanelField';
import * as S from './styles';

export type FilterPanelProps = Readonly<{
  title: string;
  submitLabel: string;
  /** Células por linha no desktop, contando a do botão. */
  columns: number;
  /** Ponto ao lado do título enquanto a lista está filtrada. */
  active?: boolean;
  /** Chamado com o submit nativo já prevenido pelo painel. */
  onSubmit: VoidFunction;
  children: ReactNode;
}>;

/**
 * Painel de filtros das listas: recolhe, avisa quando há filtro valendo e
 * desenha o botão de aplicar. Quem usa entrega só os campos, em `Field`.
 */
function FilterPanel({
  title,
  submitLabel,
  columns,
  active,
  onSubmit,
  children,
}: FilterPanelProps) {
  const handleSubmit = (event: SubmitEvent<HTMLElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <S.PanelRoot defaultExpanded disableGutters>
      <S.PanelHeader expandIcon={<ChevronRightIcon />}>
        <FilterAltIcon />
        <S.ActiveFilterBadge variant="dot" color="secondary" invisible={!active}>
          <Typography variant="subtitleBold" color="inherit">
            {title}
          </Typography>
        </S.ActiveFilterBadge>
      </S.PanelHeader>

      <S.PanelBody>
        <S.PanelForm component="form" onSubmit={handleSubmit}>
          <S.FieldsRow columns={columns}>
            {children}

            <FilterPanelField>
              <S.SubmitButton type="submit" variant="contained" color="secondary" fullWidth>
                <SearchIcon fontSize="small" />
                <Typography variant="subtitleBold" color="inherit">
                  {submitLabel}
                </Typography>
              </S.SubmitButton>
            </FilterPanelField>
          </S.FieldsRow>
        </S.PanelForm>
      </S.PanelBody>
    </S.PanelRoot>
  );
}

FilterPanel.Field = FilterPanelField;

export { FilterPanel };
