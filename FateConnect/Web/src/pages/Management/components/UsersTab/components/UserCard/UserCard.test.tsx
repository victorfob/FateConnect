import { http, HttpResponse } from 'msw';

import { VIEW_PHOTO_LABEL } from '@app/components/PhotoViewer/constants';
import { server } from '@app/mocks/server';
import type { UserSummary } from '@app/services/users/managementTypes';
import { AccountStatusEnum } from '@app/services/users/types';
import { render, screen, userEvent } from '@app/test/testing-library';

import { UserCard } from '.';

const CONTACT_EMAIL = 'marina.duarte@example.com';

const USER: UserSummary = {
  id: 42,
  fullName: 'Marina Duarte',
  contactEmail: CONTACT_EMAIL,
  phone: '15999990001',
  imageUrl: null,
  thumbnailUrl: null,
  status: AccountStatusEnum.ACTIVE,
};

const renderComponent = (user = USER) =>
  render(<UserCard user={user} isOwnAccount={false} onEdit={vi.fn()} onStatusConfirm={vi.fn()} />);

describe('UserCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should open the original profile photo from the avatar', async () => {
    const asked: string[] = [];
    URL.createObjectURL = vi.fn(() => 'blob:https://fateconnect.test/foto');
    URL.revokeObjectURL = vi.fn();
    server.use(
      http.get('https://api.fateconnect.test/uploads/user/*', ({ request }) => {
        asked.push(new URL(request.url).pathname);

        return new HttpResponse('\x89PNG', { headers: { 'Content-Type': 'image/png' } });
      }),
    );
    renderComponent({
      ...USER,
      imageUrl: 'uploads/user/marina.png',
      thumbnailUrl: 'uploads/user/thumbnails/marina.webp',
    });

    await userEvent.click(await screen.findByRole('button', { name: VIEW_PHOTO_LABEL }));

    expect(await screen.findByRole('dialog', { name: USER.fullName })).toBeInTheDocument();
    expect(asked).toEqual(['/uploads/user/thumbnails/marina.webp', '/uploads/user/marina.png']);
  });

  it('should list the phone before the email', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(`(15) 99999-0001${CONTACT_EMAIL}`);
  });
});
