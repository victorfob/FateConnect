import type { UserSummary } from '@app/services/users/managementTypes';
import { AccountStatusEnum } from '@app/services/users/types';
import { render, screen } from '@app/test/testing-library';

import { UserCard } from '.';

const CONTACT_EMAIL = 'marina.duarte@example.com';

const USER: UserSummary = {
  id: 42,
  fullName: 'Marina Duarte',
  contactEmail: CONTACT_EMAIL,
  phone: '15999990001',
  thumbnailUrl: null,
  status: AccountStatusEnum.ACTIVE,
};

const renderComponent = (user = USER) =>
  render(<UserCard user={user} isOwnAccount={false} onEdit={vi.fn()} onStatusConfirm={vi.fn()} />);

describe('UserCard', () => {
  it('should list the phone before the email', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(`(15) 99999-0001${CONTACT_EMAIL}`);
  });
});
