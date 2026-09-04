import { SessionRefusedContext } from '@app/providers/SessionProvider/context';
import { SessionStatusEnum } from '@app/providers/SessionProvider/types';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { useSessionStatus } from './useSessionStatus';

function StatusProbe() {
  return <span>{useSessionStatus()}</span>;
}

function renderProbe(refused: boolean) {
  render(
    <SessionRefusedContext value={refused}>
      <StatusProbe />
    </SessionRefusedContext>,
  );
}

describe('useSessionStatus', () => {
  it('should report no session when nothing was stored and nothing was refused', () => {
    renderProbe(false);

    expect(screen.getByText(SessionStatusEnum.NONE)).toBeInTheDocument();
  });

  it('should report a valid session while a token is stored', () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    renderProbe(false);

    expect(screen.getByText(SessionStatusEnum.VALID)).toBeInTheDocument();
  });

  it('should report an expired session after the api refused the stored token', () => {
    renderProbe(true);

    expect(screen.getByText(SessionStatusEnum.EXPIRED)).toBeInTheDocument();
  });

  it('should let a new token outrank an earlier refusal', () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    renderProbe(true);

    expect(screen.getByText(SessionStatusEnum.VALID)).toBeInTheDocument();
  });
});
