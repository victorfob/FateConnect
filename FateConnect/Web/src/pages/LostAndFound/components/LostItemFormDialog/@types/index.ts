import type { SvgIconComponent } from '@design-system/icons';

/** Textos e ícone que separam cadastrar de editar; o resto do diálogo é igual. */
export type LostItemFormMode = Readonly<{
  title: string;
  submitLabel: string;
  submitIcon: SvgIconComponent;
  succeeded: string;
  failed: string;
}>;
