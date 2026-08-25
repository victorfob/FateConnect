import type { ReactNode } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale/pt-BR';

/** A tradução da interface do calendário vem do tema, não daqui. */
export function DateLocalizationProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      {children}
    </LocalizationProvider>
  );
}
