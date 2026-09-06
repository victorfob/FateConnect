import type { ReactNode } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale/pt-BR';

/**
 * O adaptador crava `MMM d` na data curta, em qualquer idioma, e o cabeçalho do
 * seletor sairia `nov 20`. Em pt-BR o dia vem antes do mês.
 */
const DATE_FORMATS = { shortDate: 'd MMM' };

/** A tradução da interface do calendário vem do tema, não daqui. */
export function DateLocalizationProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={ptBR}
      dateFormats={DATE_FORMATS}
    >
      {children}
    </LocalizationProvider>
  );
}
