import { render, screen } from '@app/test/testing-library';

import { ListCard, type ListCardProps } from '.';

const TITLE = 'Item de teste';
const OWN_LABEL = 'Meu item';
const MEDIA_TEXT = 'foto';

const DEFAULT_PROPS: ListCardProps = { children: TITLE };

const renderComponent = (props = DEFAULT_PROPS) => render(<ListCard {...props} />);

describe('ListCard', () => {
  it('should render its content inside an article', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(TITLE);
  });

  it('should render the media slot beside the body', () => {
    renderComponent({ ...DEFAULT_PROPS, media: <span>{MEDIA_TEXT}</span> });

    expect(screen.getByText(MEDIA_TEXT)).toBeInTheDocument();
  });

  it('should announce the own label only when the record belongs to the reader', () => {
    renderComponent({ ...DEFAULT_PROPS, own: true, ownLabel: OWN_LABEL });

    expect(screen.getByText(OWN_LABEL)).toBeInTheDocument();
  });

  it('should keep the own label out of the tree when the record is not the reader own', () => {
    renderComponent({ ...DEFAULT_PROPS, ownLabel: OWN_LABEL });

    expect(screen.queryByText(OWN_LABEL)).not.toBeInTheDocument();
  });

  it('should keep the own flag out of the markup', () => {
    renderComponent({ ...DEFAULT_PROPS, own: true });

    expect(screen.getByRole('article')).not.toHaveAttribute('own');
  });
});
