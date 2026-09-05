/**
 * Como a roda do símbolo é pintada. O capelo é sempre o vermelho da marca:
 * logotipo é isento do contraste mínimo da WCAG, e é ele que identifica a marca.
 */
export enum BrandMarkToneEnum {
  /** Roda no cinza-azulado da marca — para superfície clara. */
  BRAND = 'brand',
  /** Roda na cor de quem a contém — é assim que ela sobrevive ao cromo dos dois temas. */
  CHROME = 'chrome',
}
