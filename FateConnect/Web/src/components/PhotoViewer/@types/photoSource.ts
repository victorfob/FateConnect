/** A foto guardada se busca com o token; a escolhida agora ainda não saiu do aparelho. */
export type PhotoSource = Readonly<
  { storedUrl: string; localUrl?: never } | { localUrl: string; storedUrl?: never }
>;

export type PhotoShape = 'rounded' | 'circle';
