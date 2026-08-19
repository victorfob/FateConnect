import { describe, expect, it } from 'vitest';

import { APP_CONTACT } from '@app/constants/appContact';
import { LandingSection } from '@app/routes/paths';
import { render, screen } from '@app/test/testing-library';
import { Footer } from '.';

describe('Footer', () => {
  it('should render the institutional contact details', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: 'Entre em contato' })).toBeInTheDocument();
    expect(screen.getByText(APP_CONTACT.email)).toBeInTheDocument();
    expect(screen.getByText(APP_CONTACT.phone)).toBeInTheDocument();
    expect(screen.getByText(APP_CONTACT.address)).toBeInTheDocument();
  });

  it('should expose the contact anchor targeted by the landing navigation', () => {
    render(<Footer />);

    expect(document.getElementById(LandingSection.CONTACT)).toBeInTheDocument();
  });
});
