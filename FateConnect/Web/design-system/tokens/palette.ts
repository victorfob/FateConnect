/** Cores do produto. Um valor só existe aqui; componente nenhum declara hex. */
export const colorTokens = {
  primary: '#43545C',
  accent: '#CF2E2E',

  /**
   * A marca sobre o cromo — o capelo do símbolo e a inicial de `Connect`. O
   * `accent` é fundo de botão e ali some. Logotipo é isento da WCAG, e o tom saiu
   * do vizinho: mais claro destoa do botão ao lado, mais escuro afunda no cromo.
   */
  brandOnChrome: '#FF5252',

  /**
   * Erro, só como texto. Precisa de 4,5:1 sobre os **dois** fundos claros, e o tom
   * herdado reprova no cinza da página; ele fica como `error.light`.
   */
  error: '#D4190C',
  errorInherited: '#F44336',

  surfaceGray: '#F0F2F4',
  surfaceWhite: '#FFFFFF',
  /**
   * Realce sobre o cromo colorido — menu lateral. Some sobre superfície clara. O
   * véu clareia o cromo, então tem teto: mais opaco, o rótulo branco reprova.
   */
  chromeHover: 'rgba(255, 255, 255, 0.12)',
  /**
   * Realce genérico sobre superfície clara: o produto usa a cor de conteúdo a
   * 3,5%, que é o que o Material desenha na opção do `select`.
   */
  hover: 'rgba(0, 0, 0, 0.035)',

  textOnGray: '#747D84',
  /**
   * Borda do campo de formulário. Os 38% do produto ficam abaixo dos 3:1 que a
   * WCAG 1.4.11 pede para o limite de um controle; 44% é o menor que passa nos
   * dois fundos claros.
   */
  inputOutline: 'rgba(0, 0, 0, 0.44)',
  /**
   * Texto de apoio. O cinza do produto reprova AA sobre o fundo da página; este
   * passa nos dois fundos claros.
   */
  textMuted: '#646D75',
  textOnAccent: 'rgba(255, 255, 255, 0.9)',

  successText: '#155724',
  successBackground: '#D4EDDA',
  warningText: '#856404',
  warningBackground: '#FFF3CD',
  dangerBackground: '#FFDFDF',
  mutedText: '#383D41',
  mutedBackground: '#E2E3E5',

  /**
   * Bloco-fantasma do esqueleto. O cinza usual some para quem enxerga pouco; este
   * é o tom mais claro da família neutra que alcança os 3:1 da WCAG 1.4.11 sobre
   * os dois fundos claros.
   */
  skeleton: '#848C92',

  /**
   * Fundo do campo preenchido pelo navegador, o mesmo azul que o Chrome pinta.
   * ⛔ Não volte para `transparent`: o navegador pinta só o `input`, e a faixa
   * atrás do botão de senha sairia branca, com o campo em dois tons.
   */
  inputAutofill: '#E8F0FE',
  /**
   * Trilho do interruptor desligado. O cinza do iOS some sobre o cartão branco;
   * este alcança os 3:1 da WCAG 1.4.11 para não-texto.
   */
  switchTrack: '#848C92',
  dateRangeBand: '#E2E3E5',

  /** Divisor sobre superfície neutra. */
  divider: '#D9D9D9',
  /** Divisor sobre o cromo colorido, onde a linha precisa ser clara. */
  chromeDivider: 'rgba(255, 255, 255, 0.5)',
};

export const shadowTokens = {
  component: '0 2px 5px rgba(0, 0, 0, 0.08)',
  /** O que flutua por cima dos cartões, fixo no pé da tela: a sombra sobe sobre o que fica atrás. */
  floating: '0 -2px 6px rgba(0, 0, 0, 0.06)',
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
  errorDark: '#D4190C',
};

/**
 * Tokens do tema escuro, conforme o sistema de cor do Material Design:
 * superfície `#121212` e "on colors" brancos por nível de ênfase (alta 87%,
 * média 60%, desabilitado 38%). Cada cor de marca é escolhida pelo contraste
 * que o papel dela exige, não por uma regra fixa de dessaturação.
 */
export const darkColorTokens = {
  /** Fundo do botão neutro: escuro o bastante para o texto branco, que aqui é regra. */
  primary: '#566C76',
  /** Fundo de botão: escuro o bastante para o texto branco, que aqui é regra. */
  secondary: '#CF2E2E',
  /**
   * A marca sobre o cromo escuro, que aqui é a superfície elevada. O cromo claro
   * pede um vermelho mais claro, e por isso o tom não é o mesmo nos dois temas.
   */
  brandOnChrome: '#CF2E2E',
  /**
   * A mesma marca **como texto**, e por isso mais clara que o fundo de botão
   * acima. São dois tons porque os dois papéis se excluem: para o branco passar
   * AA em cima, a cor precisa de luminância ≤ 0.183; para ela mesma ser texto
   * legível sobre a **superfície elevada**, ≥ 0.233. Nenhuma cor cabe nas duas.
   */
  brandText: '#E7867E',
  error: '#F44336',

  surface: '#121212',
  /** Superfície elevada: sobreposição branca de 5%, como o M2 prescreve para 1dp. */
  surfaceElevated: '#1E1E1E',
  /**
   * Superfície que flutua **sobre** o cromo, como o popover ancorado no topo. É o
   * degrau de 24dp do M2, e existe como token porque o véu de elevação do `Paper`
   * está desligado. ⛔ Clareá-la obriga a remedir `brandText` e `skeleton` sobre ela.
   */
  surfaceFloating: '#383838',

  /**
   * Estados sobre superfície escura — servem à etiqueta e ao aviso. No tema
   * claro são fundo claro com texto escuro; no escuro isso se inverte, senão o
   * texto some no próprio fundo. Os fundos são a cor de estado a 16% já
   * achatada sobre a superfície elevada.
   */
  successTagBackground: '#3B3F3C',
  successTagText: '#A5D6A7',
  warningTagBackground: '#424038',
  warningTagText: '#FFE082',
  dangerTagBackground: '#402422',
  dangerTagText: '#EF9A9A',
  mutedTagBackground: '#37393B',
  mutedTagText: '#CFD8DC',

  /**
   * Bloco-fantasma: 44% de branco já achatado sobre a superfície elevada, o menor
   * que alcança sobre ela o mínimo de 3:1 para não-texto.
   */
  skeleton: '#818181',

  /**
   * O azul-aço que o Chrome pinta no escuro fica muito além do realce do claro.
   * Este tom repete contra o cartão o afastamento que o claro tem.
   */
  inputAutofill: '#2A2A2A',
  /** Trilho do interruptor desligado, no mesmo mínimo de 3:1 do tema claro. */
  switchTrack: '#818181',
  dateRangeBand: '#2C2C2C',

  onSurfaceHigh: 'rgba(255, 255, 255, 0.87)',
  onSurfaceMedium: 'rgba(255, 255, 255, 0.60)',
  onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
  divider: 'rgba(255, 255, 255, 0.12)',
  hover: 'rgba(255, 255, 255, 0.08)',
};
