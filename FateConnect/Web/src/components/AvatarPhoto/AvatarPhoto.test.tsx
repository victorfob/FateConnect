import { http, HttpResponse } from 'msw';

import { VIEW_PHOTO_LABEL } from '@app/components/PhotoViewer/constants';
import { server } from '@app/mocks/server';
import { render, screen, userEvent, within } from '@app/test/testing-library';

import { photoAlt } from './constants';
import { AvatarPhoto, type AvatarPhotoProps } from '.';

const NAME = 'Marina Duarte';
const ORIGINAL_PATH = 'uploads/user/marina.png';
const OBJECT_URL = 'blob:https://fateconnect.test/marina';
const LOCAL_URL = 'data:image/png;base64,iVBORw0KGgo=';

const DEFAULT_PROPS: AvatarPhotoProps = {
  initials: 'MD',
  label: NAME,
  photoSrc: 'blob:https://fateconnect.test/miniatura',
  source: { storedUrl: ORIGINAL_PATH },
};

const renderComponent = (props = DEFAULT_PROPS) => render(<AvatarPhoto {...props} />);

describe('AvatarPhoto', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should open the stored original in a dialog named after the person', async () => {
    const asked: string[] = [];
    server.use(
      http.get(`https://api.fateconnect.test/${ORIGINAL_PATH}`, ({ request }) => {
        asked.push(new URL(request.url).pathname);

        return new HttpResponse('\x89PNG', { headers: { 'Content-Type': 'image/png' } });
      }),
    );
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: VIEW_PHOTO_LABEL }));

    const dialog = screen.getByRole('dialog', { name: NAME });
    expect(await within(dialog).findByRole('img', { name: photoAlt(NAME) })).toHaveAttribute(
      'src',
      OBJECT_URL,
    );
    expect(asked).toEqual([`/${ORIGINAL_PATH}`]);
  });

  it('should open the photo just chosen without asking the api for it', async () => {
    renderComponent({ ...DEFAULT_PROPS, source: { localUrl: LOCAL_URL } });

    await userEvent.click(screen.getByRole('button', { name: VIEW_PHOTO_LABEL }));

    const dialog = screen.getByRole('dialog', { name: NAME });
    expect(within(dialog).getByRole('img', { name: photoAlt(NAME) })).toHaveAttribute(
      'src',
      LOCAL_URL,
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('should open nothing when there is no photo on show or no original to fetch', () => {
    renderComponent({ ...DEFAULT_PROPS, photoSrc: undefined });
    expect(screen.getByRole('img', { name: NAME })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: VIEW_PHOTO_LABEL })).not.toBeInTheDocument();
  });

  it('should open nothing when the original is unknown', () => {
    renderComponent({ ...DEFAULT_PROPS, source: null });

    expect(screen.getByRole('img', { name: NAME })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: VIEW_PHOTO_LABEL })).not.toBeInTheDocument();
  });
});
