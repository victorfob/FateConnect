import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATION_TITLES,
} from '@app/constants/inAppNotifications';
import {
  InAppNotificationTypeEnum,
  type InAppNotification,
} from '@app/services/inAppNotifications/types';
import { render, screen, userEvent } from '@app/test/testing-library';

import { InAppNotificationItem, type InAppNotificationItemProps } from '.';

const NOW = new Date('2026-10-12T18:30:00Z');

const NOTIFICATION: InAppNotification = {
  id: 7,
  type: InAppNotificationTypeEnum.ITEM_ARCHIVED,
  content:
    'O item “Garrafa azul” foi arquivado automaticamente por inatividade, depois de 60 dias sem alteração.',
  referenceId: 'e1c4a7b2-3f60-4d8e-9a15-2b7c0d9e4f31',
  isRead: false,
  createdAt: '2026-10-12T17:00:00Z',
};

const DEFAULT_PROPS: InAppNotificationItemProps = {
  notification: NOTIFICATION,
  onOpen: vi.fn(),
  onMarkAsRead: vi.fn(),
};

const renderComponent = (props = DEFAULT_PROPS) => render(<InAppNotificationItem {...props} />);

const title = IN_APP_NOTIFICATION_TITLES[InAppNotificationTypeEnum.ITEM_ARCHIVED];

describe('InAppNotificationItem', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should show the title of the type, the text the api wrote and how long ago', () => {
    renderComponent();

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(NOTIFICATION.content)).toBeInTheDocument();
    expect(screen.getByText('há 1 hora')).toHaveAttribute('datetime', NOTIFICATION.createdAt);
  });

  it('should tell the screen reader it is unread, and offer the check', () => {
    renderComponent();

    expect(screen.getByText(title).closest('button')).toHaveAccessibleName(
      `${IN_APP_NOTIFICATION_TEXTS.unread} ${title} ${NOTIFICATION.content} há 1 hora`,
    );
    expect(
      screen.getByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
    ).toBeInTheDocument();
  });

  it('should drop the check and the unread mark once it is read', () => {
    renderComponent({ ...DEFAULT_PROPS, notification: { ...NOTIFICATION, isRead: true } });

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(IN_APP_NOTIFICATION_TEXTS.unread)).not.toBeInTheDocument();
  });

  it('should open the notification from anywhere on it, and mark it from the check alone', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText(NOTIFICATION.content));

    expect(DEFAULT_PROPS.onOpen).toHaveBeenCalledWith(NOTIFICATION);
    expect(DEFAULT_PROPS.onMarkAsRead).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }));

    expect(DEFAULT_PROPS.onMarkAsRead).toHaveBeenCalledWith(NOTIFICATION);
    expect(DEFAULT_PROPS.onOpen).toHaveBeenCalledTimes(1);
  });
});
