import type { SvgIconComponent } from '@design-system/icons';

export type LostItemFormMode = Readonly<{
  title: string;
  submitLabel: string;
  submitIcon: SvgIconComponent;
  succeeded: string;
  failed: string;
}>;
