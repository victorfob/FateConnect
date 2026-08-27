import type { SvgIconComponent } from '@design-system/icons';

/** Textos e ícone que separam ofertar de editar; o resto do diálogo é igual. */
export type RideFormMode = Readonly<{
  title: string;
  submitLabel: string;
  submitIcon: SvgIconComponent;
  succeeded: string;
  failed: string;
}>;
