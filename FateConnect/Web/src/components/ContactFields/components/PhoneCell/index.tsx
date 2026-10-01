import type { ReactNode } from 'react';
import { FormGrid } from '@design-system';

export type PhoneCellProps = Readonly<{ alone: boolean; children: ReactNode }>;

export function PhoneCell({ alone, children }: PhoneCellProps) {
  if (alone) return <FormGrid.Wide>{children}</FormGrid.Wide>;

  return children;
}
