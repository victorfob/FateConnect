import { SectionCard } from '@design-system';
import { SecurityIcon } from '@design-system/icons';

import { DeactivateAccount } from '@app/components/DeactivateAccount';

import { CardSubsection } from '../CardSubsection';
import { PasswordFields } from '../PasswordFields';
import * as C from './constants';
import * as S from './styles';

export type AccountAccessCardProps = Readonly<{ fatecEmail: string }>;

export function AccountAccessCard({ fatecEmail }: AccountAccessCardProps) {
  return (
    <SectionCard title={C.ACCOUNT_ACCESS_TITLE} icon={<SecurityIcon fontSize="small" />} grow>
      <CardSubsection title={C.ACCOUNT_ACCESS_SUBSECTIONS.password}>
        <PasswordFields fatecEmail={fatecEmail} />
      </CardSubsection>

      <CardSubsection title={C.ACCOUNT_ACCESS_SUBSECTIONS.deactivation}>
        <S.DeactivateRow>
          <DeactivateAccount />
        </S.DeactivateRow>
      </CardSubsection>
    </SectionCard>
  );
}
