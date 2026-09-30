import { render, screen } from '@app/test/testing-library';

import { SectionCard, type SectionCardProps } from '.';

const DEFAULT_PROPS: SectionCardProps = { title: 'Segurança', children: <p>Conteúdo</p> };

const renderComponent = (props = DEFAULT_PROPS) => render(<SectionCard {...props} />);

describe('SectionCard', () => {
  it('should name the region after its title', () => {
    renderComponent();

    const region = screen.getByRole('region', { name: 'Segurança' });

    expect(region).toHaveTextContent('Conteúdo');
    expect(screen.getByRole('heading', { level: 2, name: 'Segurança' })).toBeInTheDocument();
  });

  it('should stay an unnamed surface without a title', () => {
    renderComponent({ children: <p>Conteúdo</p> });

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('should grow to the end of the column only when asked', () => {
    renderComponent({ ...DEFAULT_PROPS, grow: true });

    expect(screen.getByRole('region', { name: 'Segurança' })).toHaveStyle({ flexGrow: '1' });
  });
});
