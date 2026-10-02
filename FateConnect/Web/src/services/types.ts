export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Como a API descreve quem a tela precisa contatar, em qualquer módulo. */
export type UserContact = {
  name: string;
  email: string | null;
  phone: string | null;
  thumbnailUrl: string | null;
};

export type PageQuery = {
  page?: number;
  pageSize?: number;
};
