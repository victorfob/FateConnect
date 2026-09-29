import { render, screen } from '@app/test/testing-library';

import { FormGrid } from '.';

describe('FormGrid', () => {
  it('should lay the fields in a grid, with the wide cell as an item of its own', () => {
    render(
      <FormGrid>
        <input aria-label="Nome" />
        <FormGrid.Wide>
          <input aria-label="Descrição" />
        </FormGrid.Wide>
      </FormGrid>,
    );

    const grid = screen.getByRole('textbox', { name: 'Nome' }).parentElement;
    const wideCell = screen.getByRole('textbox', { name: 'Descrição' }).parentElement;

    expect(grid).toHaveStyle({ display: 'grid' });
    expect(wideCell).not.toBe(grid);
    expect(wideCell?.parentElement).toBe(grid);
  });
});
