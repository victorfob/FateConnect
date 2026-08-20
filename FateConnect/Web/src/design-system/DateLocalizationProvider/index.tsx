import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactNode } from 'react';

/**
 * Locale dos componentes de data. Substitui o adapter de data escrito à mão no
 * front anterior: o `date-fns` já traz o pt-BR. A tradução da interface do
 * calendário vem do tema, que já aplica o pacote pt-BR dos seletores.
 */
export function DateLocalizationProvider({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      {children}
    </LocalizationProvider>
  );
}
