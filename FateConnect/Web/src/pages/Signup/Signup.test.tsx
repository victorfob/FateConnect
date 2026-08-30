import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { FATEC_EMAIL_MESSAGE } from '@app/constants/fatecEmail';
import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';
import { server } from '@app/mocks/server';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { PASSWORD_TOGGLE_LABEL } from './components/AccountSection/constants';
import { CALENDAR_TOGGLE_LABEL } from './components/BirthDateField/constants';
import { SIGNUP_MESSAGES } from './schema';
import * as C from './constants';
import { Signup } from '.';

const SIGNUP_URL = 'https://api.fateconnect.test/users/signup';
const ZIP_URL = 'https://viacep.com.br/ws/:zipCode/json/';

const VALID_SIGNUP = {
  fullName: 'Maria Silva',
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  birthDate: '22051999',
  password: 'segredo123',
  phone: '11912345678',
  contactEmail: 'maria@exemplo.com',
};

function renderSignup() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.SIGNUP, element: <Signup /> },
      { path: RoutePathEnum.LANDING, element: <div>landing</div> },
    ],
    { initialEntries: [RoutePathEnum.SIGNUP] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

async function fillRequiredFields() {
  // O endereço é obrigatório, e quem o preenche é a busca por CEP.
  server.use(
    http.get(ZIP_URL, () =>
      HttpResponse.json({
        cep: '18000-000',
        logradouro: 'Rua das Flores',
        localidade: 'Sorocaba',
        uf: 'SP',
      }),
    ),
  );

  await userEvent.type(screen.getByLabelText(/Nome completo/), VALID_SIGNUP.fullName);
  await userEvent.type(screen.getByLabelText(/E-mail Fatec/), VALID_SIGNUP.fatecEmail);
  await userEvent.type(screen.getByLabelText(/Data de nascimento/), VALID_SIGNUP.birthDate);
  await userEvent.type(screen.getByLabelText(/^Senha/), VALID_SIGNUP.password);
  await userEvent.type(screen.getByLabelText(/Telefone/), VALID_SIGNUP.phone);
  await userEvent.type(screen.getByLabelText(/E-mail para contato/), VALID_SIGNUP.contactEmail);
  await selectOption(C.FIELD_LABELS.gender, 'Feminino');

  await userEvent.type(screen.getByLabelText(/CEP/), '18000000');
  await screen.findByDisplayValue('Rua das Flores');
  await userEvent.type(screen.getByLabelText(/Número/), '100');

  await userEvent.click(screen.getByRole('checkbox', { name: /Termos de uso/ }));
}

async function selectOption(fieldLabel: string, optionLabel: string) {
  await userEvent.click(screen.getByRole('combobox', { name: new RegExp(fieldLabel) }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', { name: optionLabel }),
  );
}

/** O rótulo do campo, para conferir se ele subiu ao receber valor de fora. */
function labelOf(field: HTMLElement): HTMLElement | null {
  return field.closest('.MuiFormControl-root')?.querySelector('label') ?? null;
}

function submit() {
  return userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
}

describe('Signup', () => {
  it('should show every required message when submitting an empty form', async () => {
    renderSignup();

    await submit();

    expect(await screen.findByText(SIGNUP_MESSAGES.fullNameRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.fatecEmailRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.birthDateRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.genderRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.passwordRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.phoneRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.contactEmailRequired)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.termsRequired)).toBeInTheDocument();
  });

  it('should reject a malformed email and a short password', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText(/E-mail Fatec/), 'nao-e-email');
    await userEvent.type(screen.getByLabelText(/^Senha/), 'curta');

    await submit();

    expect(await screen.findByText(FATEC_EMAIL_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(SIGNUP_MESSAGES.passwordTooShort)).toBeInTheDocument();
  });

  // A API só aceita o domínio institucional; recusar aqui poupa uma requisição
  // que voltaria 400 sem dizer qual campo reprovou.
  it('should reject an email outside the institutional domain', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText(/E-mail Fatec/), 'maria.silva@gmail.com');

    await submit();

    expect(await screen.findByText(FATEC_EMAIL_MESSAGE)).toBeInTheDocument();
  });

  it('should reject a phone number outside ten or eleven digits', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText(/Telefone/), '119123');

    await submit();

    expect(await screen.findByText(SIGNUP_MESSAGES.phoneInvalid)).toBeInTheDocument();
  });

  it('should format the birth date while it is typed', async () => {
    renderSignup();
    const birthDate = screen.getByLabelText(/Data de nascimento/);

    await userEvent.type(birthDate, VALID_SIGNUP.birthDate);

    expect(birthDate).toHaveValue('22/05/1999');
  });

  it('should reject a birth date that does not complete eighteen years', async () => {
    renderSignup();
    const currentYear = new Date().getFullYear();

    await userEvent.type(
      screen.getByLabelText(/Data de nascimento/),
      `0101${String(currentYear - 10)}`,
    );
    await submit();

    expect(await screen.findByText(SIGNUP_MESSAGES.birthDateUnderage)).toBeInTheDocument();
  });

  it('should reject a date that does not exist', async () => {
    renderSignup();

    await userEvent.type(screen.getByLabelText(/Data de nascimento/), '31021999');
    await submit();

    expect(await screen.findByText(SIGNUP_MESSAGES.birthDateInvalid)).toBeInTheDocument();
  });

  it('should format the phone number by its length', async () => {
    renderSignup();
    const phone = screen.getByLabelText(/Telefone/);

    await userEvent.type(phone, '1123456789');
    expect(phone).toHaveValue('(11) 2345-6789');

    await userEvent.type(phone, '0');
    expect(phone).toHaveValue('(11) 23456-7890');
  });

  it('should toggle the password visibility and show the current state in the icon', async () => {
    renderSignup();
    const password = screen.getByLabelText(/^Senha/);
    const toggle = screen.getByRole('button', { name: PASSWORD_TOGGLE_LABEL });

    expect(password).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);

    expect(password).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('should fill the address from the zip code', async () => {
    server.use(
      http.get(ZIP_URL, () =>
        HttpResponse.json({
          cep: '01001-000',
          logradouro: 'Praça da Sé',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      ),
    );
    renderSignup();

    await userEvent.type(screen.getByLabelText(/CEP/), '01001000');

    expect(await screen.findByDisplayValue('Praça da Sé')).toBeInTheDocument();
    expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Estado/ })).toHaveTextContent('São Paulo');
    expect(labelOf(screen.getByLabelText(/Logradouro/))).toHaveAttribute('data-shrink', 'true');
  });

  it('should warn and clear the address when the zip code does not exist', async () => {
    server.use(http.get(ZIP_URL, () => HttpResponse.json({ erro: 'true' })));
    renderSignup();

    await userEvent.type(screen.getByLabelText(/CEP/), '00000000');

    expect(await screen.findByText(C.ZIP_LOOKUP_MESSAGES.notFound)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cidade/)).toHaveValue('');
  });

  it('should warn when both zip code providers fail', async () => {
    server.use(
      http.get(ZIP_URL, () => HttpResponse.error()),
      http.get('https://opencep.com/v1/:zipCode.json', () => HttpResponse.error()),
    );
    renderSignup();

    await userEvent.type(screen.getByLabelText(/CEP/), '01001000');

    expect(await screen.findByText(C.ZIP_LOOKUP_MESSAGES.failed)).toBeInTheDocument();
  });

  it('should open each legal document in a new tab, so the form survives', () => {
    renderSignup();

    const terms = screen.getByRole('link', { name: 'Termos de uso' });
    expect(terms).toHaveAttribute('href', TERMS_URL);
    expect(terms).toHaveAttribute('target', '_blank');

    const privacy = screen.getByRole('link', { name: 'Política de privacidade' });
    expect(privacy).toHaveAttribute('href', PRIVACY_URL);
    expect(privacy).toHaveAttribute('target', '_blank');
  });

  it('should toggle the consent when the sentence around the links is clicked', async () => {
    renderSignup();
    const consent = screen.getByRole('checkbox', { name: /Termos de uso/ });

    await userEvent.click(screen.getByText(/Eu concordo com os/));

    expect(consent).toBeChecked();
  });

  it('should not toggle the consent when the legal link is clicked', async () => {
    renderSignup();
    const consent = screen.getByRole('checkbox', { name: /Termos de uso/ });

    await userEvent.click(screen.getByRole('link', { name: 'Termos de uso' }));

    expect(consent).not.toBeChecked();
  });

  it('should offer the placeholder as the first option of a select', async () => {
    renderSignup();

    await userEvent.click(screen.getByRole('combobox', { name: /Gênero/ }));

    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options[0]).toHaveTextContent(C.SELECT_PLACEHOLDER);
  });

  it('should create the account and send the user to the login anchor', async () => {
    server.use(
      http.post(SIGNUP_URL, () =>
        HttpResponse.json({
          id: 1,
          fatecEmail: VALID_SIGNUP.fatecEmail,
          fullName: 'Maria Silva',
        }),
      ),
    );
    const router = renderSignup();
    await fillRequiredFields();

    await submit();

    expect(await screen.findByText(C.SIGNUP_SUCCESS_MESSAGE)).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING));
    expect(router.state.location.hash).toBe(`#${LandingSectionEnum.LOGIN}`);
  });

  it('should send the payload in the contract the backend expects', async () => {
    let payload: unknown;
    server.use(
      http.post(SIGNUP_URL, async ({ request }) => {
        payload = await request.json();

        return HttpResponse.json({ id: 1, fatecEmail: '', fullName: 'Maria Silva' });
      }),
    );
    renderSignup();
    await fillRequiredFields();

    await submit();

    await waitFor(() => expect(payload).toBeDefined());
    expect(payload).toEqual({
      fullName: VALID_SIGNUP.fullName,
      fatecEmail: VALID_SIGNUP.fatecEmail,
      password: VALID_SIGNUP.password,
      gender: 'Female',
      birthDate: '1999-05-22T00:00:00Z',
      addresses: [
        {
          zipCode: '18000-000',
          street: 'Rua das Flores',
          streetNumber: '100',
          complement: '',
          city: 'Sorocaba',
          state: 'SP',
        },
      ],
      contacts: [{ phone: '11912345678', contactEmail: VALID_SIGNUP.contactEmail }],
    });
  });

  it.each([
    [409, C.SIGNUP_ERROR_MESSAGES.emailTaken],
    [400, C.SIGNUP_ERROR_MESSAGES.invalidData],
    [500, C.SIGNUP_ERROR_MESSAGES.generic],
  ])('should report the failure for status %s', async (status, message) => {
    server.use(http.post(SIGNUP_URL, () => new HttpResponse(null, { status })));
    renderSignup();
    await fillRequiredFields();

    await submit();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: C.SUBMIT_LABEL })).toBeEnabled();
  });

  it('should disable the form while the account is being created', async () => {
    // A resposta só chega quando o teste soltar: espera por tempo torna o caso
    // instável, porque a requisição pode terminar antes da verificação.
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.post(SIGNUP_URL, async () => {
        await held;

        return HttpResponse.json({ id: 1, fatecEmail: '', fullName: 'Maria Silva' });
      }),
    );
    renderSignup();
    await fillRequiredFields();

    await submit();

    const submitButton = screen.getByRole('button', { name: C.SUBMIT_LABEL });
    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(within(submitButton).getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/)).toBeDisabled();

    respond();
  });

  it('should fill the field with the date chosen in the calendar', async () => {
    renderSignup();
    const birthDate = screen.getByLabelText(/Data de nascimento/);
    await userEvent.type(birthDate, '22051999');

    await userEvent.click(screen.getByRole('button', { name: CALENDAR_TOGGLE_LABEL }));
    const calendar = await screen.findByRole('grid');
    await userEvent.click(within(calendar).getByRole('gridcell', { name: '10' }));

    expect(birthDate).toHaveValue('10/05/1999');
    // O campo é não controlado: sem o rótulo no alto, ele cobriria a data.
    expect(labelOf(birthDate)).toHaveAttribute('data-shrink', 'true');
  });
});
