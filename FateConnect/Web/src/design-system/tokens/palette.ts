/** Cores do produto. Um valor só existe aqui; componente nenhum declara hex. */
export const colorTokens = {
  primary: '#43545C',
  accent: '#CF2E2E',

  /**
   * Segundo vermelho do produto, usado no botão de acesso — papel de **erro**.
   * Escurecido em relação ao herdado (`#F44336`) para alcançar 4.5:1 com texto
   * branco; o tom original fica como `error.light`.
   */
  error: '#E81C0D',
  errorInherited: '#F44336',

  surfaceGray: '#F0F2F4',
  surfaceWhite: '#FFFFFF',
  surfaceHover: 'rgba(255, 255, 255, 0.6)',

  textOnGray: '#747D84',
  /** Borda do campo de formulário — o mesmo 38% que o produto desenha hoje. */
  inputOutline: 'rgba(0, 0, 0, 0.38)',
  textMuted: '#6C757D',
  textOnAccent: 'rgba(255, 255, 255, 0.9)',

  successText: '#155724',
  successBackground: '#D4EDDA',
  warningText: '#856404',
  warningBackground: '#FFF3CD',
  dangerText: '#CF2E2E',
  dangerBackground: '#FFDFDF',

  /** Divisor sobre superfície neutra — linha do formulário de cadastro. */
  divider: '#D9D9D9',
  /** Divisor sobre o cromo colorido (rodapé), onde a linha precisa ser clara. */
  chromeDivider: 'rgba(255, 255, 255, 0.5)',
};

/** Sombra padrão de componente elevado. */
export const shadowTokens = {
  component: '0 2px 5px rgba(0, 0, 0, 0.08)',
};

/**
 * Tamanhos de ícone em pixels.
 *
 * `sm` e `lg` acompanham a **largura renderizada** dos ícones do produto, não a
 * altura: os glifos da biblioteca original são mais largos que altos (20x16 e
 * 40x32), enquanto os nossos são quadrados. Igualar pela largura mantém a massa
 * visual equivalente.
 */
export const iconSizeTokens = {
  sm: 20,
  md: 24,
  lg: 40,
};

/**
 * Variantes de cada cor de marca, seguindo a mesma regra do tema atual do
 * produto: `light` é a base clareada 25% e `dark` é a base escurecida 20%.
 */
export const colorVariants = {
  primaryLight: '#68828F',
  primaryDark: '#36434A',
  secondaryLight: '#DC6161',
  secondaryDark: '#A62525',
  errorLight: '#F77268',
  /** Escurecido até alcançar 4.5:1 com texto branco — ver `contrast.test.ts`. */
  errorDark: '#E81C0D',
};

/**
 * Tokens do tema escuro, conforme o sistema de cor do Material Design:
 * superfície `#121212`, cores de marca dessaturadas para alcançar contraste, e
 * "on colors" brancos por nível de ênfase (alta 87%, média 60%, desabilitado 38%).
 */
export const darkColorTokens = {
  primary: '#68828E',
  secondary: '#D84E4E',
  error: '#F44336',

  surface: '#121212',
  /** Superfície elevada: sobreposição branca de 5%, como o M2 prescreve para 1dp. */
  surfaceElevated: '#1E1E1E',

  /**
   * Etiquetas de estado. No tema claro elas são fundo claro com texto escuro;
   * no escuro isso se inverte, senão o texto some no próprio fundo. Os fundos
   * são a cor de estado a 16% já achatada sobre a superfície elevada.
   */
  successTagBackground: '#3B3F3C',
  successTagText: '#A5D6A7',
  warningTagBackground: '#424038',
  warningTagText: '#FFE082',

  onSurfaceHigh: 'rgba(255, 255, 255, 0.87)',
  onSurfaceMedium: 'rgba(255, 255, 255, 0.60)',
  onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
  divider: 'rgba(255, 255, 255, 0.12)',
  hover: 'rgba(255, 255, 255, 0.08)',
};
