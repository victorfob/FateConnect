import type { ReactNode } from 'react';

import { MessageScreen } from '@app/components/MessageScreen';

import * as C from './constants';

type CrashScreenProps = Readonly<{ children: ReactNode }>;

export function CrashScreen({ children }: CrashScreenProps) {
  return (
    <MessageScreen title={C.ERROR_TITLE} description={C.ERROR_DESCRIPTION}>
      {children}
    </MessageScreen>
  );
}
